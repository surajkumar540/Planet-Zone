import { motion } from "framer-motion";
import { Ban, Check, ClipboardCheck, Home, PackageCheck, RotateCcw, Truck } from "lucide-react";

import { formatDateTime } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Visual order progress, shared by the customer's order page and the dashboard.
 *
 * The happy path is five steps. "processing" counts as packing in progress, so
 * the customer sees movement as soon as the warehouse picks the order up. Each
 * reached step shows when it happened, read from the order's status history.
 * Cancelled, returned and refunded orders get a clear banner instead of a
 * half-finished tracker.
 */
const STEPS = [
  { status: "confirmed", label: "Confirmed", icon: ClipboardCheck },
  { status: "packed", label: "Packed", icon: PackageCheck, inProgress: "processing" },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home },
];

const ORDER = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

const ENDED = {
  cancelled: { icon: Ban, title: "Order cancelled", tone: "text-status-critical bg-status-critical-bg" },
  returned: { icon: RotateCcw, title: "Order returned", tone: "text-status-warning bg-status-warning-bg" },
  refunded: { icon: RotateCcw, title: "Order refunded", tone: "text-status-info bg-status-info-bg" },
};

/** When the order first reached `status`, from its history. */
const reachedAt = (history, status) => history.find((entry) => entry.status === status)?.changedAt;

const OrderTracker = ({ order, compact = false }) => {
  const history = order.statusHistory || [];
  const ended = ENDED[order.status];

  if (ended) {
    const at = reachedAt(history, order.status);
    const note = [...history].reverse().find((entry) => entry.status === order.status)?.note;
    return (
      <div className={cn("flex items-start gap-3 rounded-2xl p-4", ended.tone)}>
        <ended.icon size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{ended.title}</p>
          {at && <p className="type-caption opacity-80">{formatDateTime(at)}</p>}
          {note && <p className="mt-1 type-caption opacity-90">“{note}”</p>}
        </div>
      </div>
    );
  }

  const position = ORDER.indexOf(order.status);
  const reachedIndex = STEPS.reduce(
    (last, step, index) => (ORDER.indexOf(step.status) <= position ? index : last),
    -1
  );
  // The bar fills to the last reached step, plus half a step while packing is underway.
  const inProgress = STEPS.findIndex((step) => step.inProgress === order.status);
  const fill = Math.max(0, inProgress >= 0 ? inProgress - 0.5 : reachedIndex) / (STEPS.length - 1);

  return (
    <div className={cn("relative", compact ? "pt-1" : "pt-2")}>
      {/* Track */}
      <div className="absolute left-[10%] right-[10%] top-[1.375rem] hidden h-1 rounded-full bg-line sm:block">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${fill * 100}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="relative grid gap-3 sm:grid-cols-5 sm:gap-0">
        {STEPS.map((step, index) => {
          const done = index <= reachedIndex;
          const current = index === reachedIndex && order.status !== "delivered";
          const working = index === inProgress;
          const at = reachedAt(history, step.status);
          return (
            <li key={step.status} className="flex items-center gap-3 sm:flex-col sm:text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 400, damping: 22 }}
                className={cn(
                  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-accent bg-accent text-accent-on"
                    : working
                      ? "border-accent bg-surface text-accent-text"
                      : "border-line bg-surface text-content-disabled"
                )}
              >
                {done && !current ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} />}
                {(current || working) && (
                  <span className="absolute inset-0 animate-ping rounded-full border-2 border-accent opacity-40" />
                )}
              </motion.span>
              <div className="sm:mt-2">
                <p className={cn("text-[0.8125rem] font-semibold", done || working ? "text-content" : "text-content-muted")}>
                  {step.label}
                </p>
                <p className="type-caption text-content-muted">
                  {at ? formatDateTime(at) : working ? "In progress" : " "}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTracker;
