/**
 * Order and payment status badges now live in the shared UI layer, because the
 * storefront shows the same states on a customer's own orders. Re-exported
 * here so existing dashboard imports keep working.
 */
export {
  OrderStatusBadge,
  PaymentStatusBadge,
  default,
} from "../../../components/ui/StatusBadge";
