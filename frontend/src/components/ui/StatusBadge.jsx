import {
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import Badge from "./Badge";
import { humanise } from "../../lib/format";

/**
 * Order and payment status badges.
 *
 * Each status ships with an icon and its label, so the state is legible
 * without relying on the colour being distinguishable.
 */
const ORDER_STATUS = {
  pending: { tone: "warning", icon: Clock },
  confirmed: { tone: "info", icon: CheckCircle2 },
  processing: { tone: "info", icon: Clock },
  packed: { tone: "info", icon: PackageCheck },
  shipped: { tone: "accent", icon: Truck },
  out_for_delivery: { tone: "accent", icon: Truck },
  delivered: { tone: "good", icon: CheckCircle2 },
  cancelled: { tone: "critical", icon: Ban },
  returned: { tone: "serious", icon: RotateCcw },
  refunded: { tone: "neutral", icon: RotateCcw },
};

const PAYMENT_STATUS = {
  pending: { tone: "warning", icon: Clock },
  paid: { tone: "good", icon: CheckCircle2 },
  failed: { tone: "critical", icon: Ban },
  refunded: { tone: "neutral", icon: RotateCcw },
  partially_refunded: { tone: "serious", icon: CreditCard },
};

export const OrderStatusBadge = ({ status, size }) => {
  const config = ORDER_STATUS[status] || { tone: "neutral", icon: Clock };
  return (
    <Badge tone={config.tone} icon={config.icon} size={size}>
      {humanise(status)}
    </Badge>
  );
};

export const PaymentStatusBadge = ({ status, size }) => {
  const config = PAYMENT_STATUS[status] || { tone: "neutral", icon: Clock };
  return (
    <Badge tone={config.tone} icon={config.icon} size={size}>
      {humanise(status)}
    </Badge>
  );
};

export default OrderStatusBadge;
