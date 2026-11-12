import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Timer } from "lucide-react";

import Button from "../../../components/ui/Button";
import { Doodle, Reveal } from "../../../components/ui/Doodles";
import { Price, Rating } from "./Primitives";
import { useCart } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";
import { useToast } from "../../../components/ui/Toast";
import { useI18n } from "../../../lib/i18n";

/** Time left until local midnight, as zero-padded [hours, minutes, seconds]. */
const untilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const total = Math.max(0, Math.floor((midnight - now) / 1000));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((part) =>
    String(part).padStart(2, "0")
  );
};

/** A digit pair that rolls when it changes. */
const Unit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-inverse text-content-inverse shadow-sm">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="type-numeric text-[1.25rem] font-bold"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="mt-1 text-[0.6875rem] font-medium uppercase tracking-wide text-content-muted">
      {label}
    </span>
  </div>
);

/**
 * A single highlighted product with a countdown to midnight.
 *
 * Labelled as a deal only when the product genuinely carries a discount;
 * otherwise it is presented as the day's pick, so the page never claims a
 * saving that does not exist.
 */
const DealOfTheDay = ({ product }) => {
  const { add } = useCart();
  const notifyAdded = useCartFeedback();
  const toast = useToast();
  const { t } = useI18n();
  const imageRef = useRef(null);
  const [time, setTime] = useState(untilMidnight);

  useEffect(() => {
    const timer = setInterval(() => setTime(untilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!product) return null;
  const discount = product.discount > 0 ? Math.round(product.discount) : 0;
  const soldOut = !product.hasVariants && product.countInStock <= 0;

  return (
    <Reveal className="relative grid overflow-hidden rounded-[1.75rem] border border-line-subtle bg-surface shadow-md md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <Link
        to={`/product/${product._id}`}
        className="group relative block aspect-[4/3] overflow-hidden bg-accent-subtle md:aspect-auto"
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: -12 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.3 }}
            className="absolute left-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-status-critical text-white shadow-lg"
          >
            <span className="text-[1.125rem] font-extrabold leading-none">{discount}%</span>
            <span className="text-[0.625rem] font-bold uppercase">off</span>
          </motion.span>
        )}
      </Link>

      <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-9">
        <Doodle type="sparkle" size={30} float className="absolute right-6 top-6 text-accent-text opacity-60" />
        <Doodle type="squiggle" size={64} delay={0.4} className="absolute bottom-5 right-8 hidden text-accent-text opacity-40 sm:block" />

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-accent-text">
          <Timer size={13} />
          {discount > 0 ? t("Deal of the day") : t("Pick of the day")}
        </span>

        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-content-muted">
            {product.brand}
          </p>
          <h3 className="font-display mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight text-content sm:text-[2rem]">
            {product.name}
          </h3>
          <Rating value={product.rating} count={product.numReviews} className="mt-2" />
        </div>

        <Price value={product.totalPrice} compareAt={discount ? product.price : 0} size="lg" />

        <div>
          <p className="mb-2 type-caption text-content-secondary">
            {discount > 0 ? t("Offer refreshes in") : t("Next pick in")}
          </p>
          <div className="flex items-start gap-2">
            <Unit value={time[0]} label={t("hrs")} />
            <span className="mt-2.5 text-[1.25rem] font-bold text-content-muted">:</span>
            <Unit value={time[1]} label={t("min")} />
            <span className="mt-2.5 text-[1.25rem] font-bold text-content-muted">:</span>
            <Unit value={time[2]} label={t("sec")} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {product.hasVariants ? (
            <Button as={Link} to={`/product/${product._id}`} variant="primary" size="lg" iconRight={ArrowRight}>
              {t("Choose options")}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={ShoppingBag}
              disabled={soldOut}
              onClick={() => {
                const result = add(product, 1);
                if (!result.added) {
                  toast.info(t("Already in your bag"), t("You have all {n} in stock in your bag.", { n: result.inBag }));
                  return;
                }
                notifyAdded({ product, qty: result.added, inBag: result.inBag, sourceEl: imageRef.current });
              }}
            >
              {soldOut ? t("Sold out") : t("Add to bag")}
            </Button>
          )}
          <Button as={Link} to={`/product/${product._id}`} size="lg" variant="ghost">
            {t("View details")}
          </Button>
        </div>
      </div>
    </Reveal>
  );
};

export default DealOfTheDay;
