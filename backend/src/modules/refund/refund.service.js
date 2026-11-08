const prisma = require("../../db/client");
const { num, toRefund } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction } = require("../../core/transaction");
const inventoryService = require("../inventory/inventory.service");
const { REFUND_STATUS, REFUND_OPEN_STATUSES } = require("../../constants/refund");
const { PAYMENT_STATUS, ORDER_STATUS } = require("../../constants/orderStatus");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const { round } = require("../../utils/money");
const { parseSort, searchFilter, sortable } = require("../../utils/schemas");

const SORTABLE = sortable("createdAt", "amount", "status", "orderNumber");

const USER_SUMMARY = { id: true, firstName: true, lastName: true, email: true };

/** Amount already refunded or awaiting processing against an order. */
const committedAmount = async (orderId, client = prisma) => {
  const { _sum } = await client.refund.aggregate({
    where: {
      orderId,
      status: { in: [...REFUND_OPEN_STATUSES, REFUND_STATUS.COMPLETED] },
    },
    _sum: { amount: true },
  });
  return round(num(_sum.amount) || 0);
};

/**
 * Opens a refund request.
 *
 * The requested amount is capped at what remains refundable on the order, so
 * repeated partial requests can never exceed what was actually paid.
 */
const request = async ({ orderId, requester, items = [], amount, reason, customerNote }) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound("Order not found");

  if (!requester.isStaff && String(order.userId) !== String(requester.userId)) {
    throw AppError.forbidden();
  }

  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw AppError.badRequest("This order has not been paid, so there is nothing to refund");
  }

  const alreadyCommitted = await committedAmount(orderId);
  const refundable = round(num(order.grandTotal) - alreadyCommitted);

  if (refundable <= 0) {
    throw AppError.badRequest("This order has already been fully refunded");
  }

  // An unspecified amount refunds everything still outstanding.
  const requested = amount === undefined ? refundable : round(amount);
  if (requested <= 0) throw AppError.badRequest("Refund amount must be greater than zero");
  if (requested > refundable) {
    throw AppError.badRequest(`At most ₹${refundable} can still be refunded on this order`);
  }

  const refund = await prisma.refund.create({
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      items,
      amount: requested,
      reason,
      customerNote: customerNote || "",
    },
  });

  return toRefund(refund);
};

/**
 * Approves or rejects a request. Approval alone does not move money; that
 * happens in `process`, which keeps the decision and the payout auditable
 * as separate steps.
 */
const review = async ({ refundId, approve, staffNote, actorId }) => {
  const refund = await prisma.refund.findUnique({ where: { id: refundId } });
  if (!refund) throw AppError.notFound("Refund not found");

  if (refund.status !== REFUND_STATUS.REQUESTED) {
    throw AppError.badRequest(`This refund has already been ${refund.status}`);
  }

  const updated = await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: approve ? REFUND_STATUS.APPROVED : REFUND_STATUS.REJECTED,
      staffNote: staffNote || "",
      reviewedById: actorId,
      reviewedAt: new Date(),
    },
  });

  return toRefund(updated);
};

/**
 * Completes an approved refund: records the payout, returns stock if the
 * goods came back, and updates the order's payment status, all atomically.
 *
 * The gateway call itself is left to an operator for now — the record is
 * marked complete so the money movement is tracked either way.
 */
const process = async ({ refundId, gatewayRefundId, actorId }) =>
  withTransaction(async (tx) => {
    const refund = await tx.refund.findUnique({ where: { id: refundId } });
    if (!refund) throw AppError.notFound("Refund not found");

    // Conditional on the status, so a double click cannot process it twice.
    const { count } = await tx.refund.updateMany({
      where: { id: refundId, status: REFUND_STATUS.APPROVED },
      data: {
        status: REFUND_STATUS.COMPLETED,
        gatewayRefundId: gatewayRefundId || "",
        completedAt: new Date(),
      },
    });
    if (count === 0) throw AppError.badRequest("Only an approved refund can be processed");

    const order = await tx.order.findUnique({ where: { id: refund.orderId } });
    if (!order) throw AppError.notFound("Order not found");

    if (refund.restock && refund.items?.length) {
      for (const item of refund.items) {
        try {
          await inventoryService.adjustStock({
            productId: item.product,
            variantSku: item.variantSku || "",
            quantity: item.qty,
            reason: MOVEMENT_REASONS.RETURN,
            note: `Refund ${refund.id}`,
            referenceType: "Refund",
            referenceId: refund.id,
            performedBy: actorId,
            tx,
          });
        } catch (error) {
          // Only application errors can be survived; see core/transaction.js.
          if (!(error instanceof AppError)) throw error;
          logger.error(`Failed to restock refunded item: ${error.message}`, {
            refund: refund.id,
            product: item.product,
          });
        }
      }
    }

    const totalRefunded = await committedAmount(order.id, tx);
    const fullyRefunded = totalRefunded >= num(order.grandTotal);

    const orderUpdate = {
      paymentStatus: fullyRefunded ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED,
    };

    // A fully refunded order is closed out, when the lifecycle permits it.
    if (fullyRefunded && [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(order.status)) {
      orderUpdate.status = ORDER_STATUS.REFUNDED;
      orderUpdate.history = {
        create: {
          sequence: await tx.orderStatusEvent.count({ where: { orderId: order.id } }),
          status: ORDER_STATUS.REFUNDED,
          note: `Refund ${refund.id} completed`,
          changedById: actorId,
        },
      };
    }
    await tx.order.update({ where: { id: order.id }, data: orderUpdate });

    if (order.paymentRef) {
      await tx.payment.updateMany({
        where: { id: order.paymentRef },
        data: { refundedAmount: { increment: refund.amount } },
      });
    }

    return toRefund(await tx.refund.findUnique({ where: { id: refundId } }));
  });

const list = async ({ page, limit, sort, search, status, userId, isStaff }) => {
  const where = {
    ...(status ? { status } : {}),
    ...searchFilter(search, ["orderNumber", "reason"]),
    // Customers only ever see their own requests.
    ...(isStaff ? {} : { userId }),
  };

  const [rows, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      orderBy: parseSort(sort, SORTABLE),
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: USER_SUMMARY } },
    }),
    prisma.refund.count({ where }),
  ]);

  return { items: rows.map(toRefund), total, page, limit };
};

const getById = async ({ refundId, requester }) => {
  const row = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { user: { select: USER_SUMMARY }, order: true },
  });

  if (!row) throw AppError.notFound("Refund not found");

  if (!requester.isStaff && String(row.userId) !== String(requester.userId)) {
    throw AppError.forbidden();
  }
  return toRefund(row);
};

module.exports = { request, review, process, list, getById };
