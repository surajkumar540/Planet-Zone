import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag, Truck } from "lucide-react";

/**
 * Shared frame for the sign-in, sign-up, OTP and password screens.
 *
 * The form column is deliberately narrow and centred; the panel beside it
 * carries the reassurance a customer wants at the moment they hand over
 * credentials, and collapses away entirely on small screens.
 */
const AuthShell = ({ title, description, children, footer }) => (
  <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
    <div className="flex items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on">
            <ShoppingBag size={17} />
          </span>
          <span className="type-section-title text-[1.0625rem] text-content">Planet</span>
        </Link>

        <h1 className="type-page-title text-content">{title}</h1>
        {description && <p className="type-description mt-1.5">{description}</p>}

        <div className="mt-7">{children}</div>

        {footer && <div className="mt-6 type-body text-content-secondary">{footer}</div>}
      </div>
    </div>

    <aside className="hidden bg-surface-inverse lg:flex lg:items-center lg:justify-center lg:p-12">
      <div className="max-w-sm text-content-inverse">
        <p className="type-overline mb-3 opacity-70">Why shop with us</p>
        <p className="type-display text-[1.75rem] leading-snug">
          A smaller catalogue, chosen so we can stand behind every item in it.
        </p>

        <ul className="mt-8 space-y-4">
          {[
            { icon: Truck, text: "Free delivery on orders above ₹499" },
            { icon: ShieldCheck, text: "Payments secured by Razorpay" },
            { icon: ShoppingBag, text: "7-day returns, no explanation needed" },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-3 type-body opacity-90">
              <item.icon size={17} className="shrink-0 opacity-70" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  </div>
);

export default AuthShell;
