import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import {
  Gift,
  Headphones,
  Heart,
  Package,
  Percent,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Truck,
  Watch,
} from "lucide-react";

import cn from "../../lib/cn";

/**
 * A playful "shopping world" behind the auth screens.
 *
 * Layers of outline doodles (bags, carts, gifts, parcels…) drift and turn,
 * each layer shifting with the pointer by a different amount for depth; price
 * tags swing on their strings; a delivery van drives a dashed road; a route
 * draws itself across the page; sparkles twinkle; and a soft glow follows the
 * cursor. Everything is faint and token-coloured so the card stays the focus
 * in both themes, items thin out on phones, and it all holds still for
 * reduced-motion users.
 */

/** x/y in % of the screen, kept clear of the centred card. */
const ITEMS = [
  { icon: ShoppingBag, x: 7, y: 14, size: 54, depth: 3, rotate: -12, drift: 14 },
  { icon: ShoppingCart, x: 84, y: 11, size: 58, depth: 2, rotate: 8, drift: 12 },
  { icon: Gift, x: 14, y: 62, size: 46, depth: 2, rotate: 10, drift: 10, mobile: false },
  { icon: Package, x: 88, y: 58, size: 50, depth: 3, rotate: -8, drift: 16 },
  { icon: Heart, x: 26, y: 30, size: 28, depth: 1, rotate: -6, drift: 8, mobile: false },
  { icon: Star, x: 74, y: 33, size: 26, depth: 1, rotate: 14, drift: 9, mobile: false },
  { icon: Headphones, x: 5, y: 40, size: 40, depth: 2, rotate: 6, drift: 12, mobile: false },
  { icon: Shirt, x: 93, y: 36, size: 40, depth: 1, rotate: -10, drift: 10, mobile: false },
  { icon: Watch, x: 78, y: 80, size: 34, depth: 1, rotate: 12, drift: 8, mobile: false },
  { icon: Percent, x: 22, y: 84, size: 30, depth: 2, rotate: -14, drift: 10 },
  { icon: Sparkles, x: 64, y: 6, size: 26, depth: 1, rotate: 0, drift: 6, mobile: false },
  { icon: Tag, x: 36, y: 8, size: 30, depth: 2, rotate: 18, drift: 8, mobile: false },
];

const TAGS = [
  { label: "SALE", x: 18, y: 4, delay: 0 },
  { label: "−50%", x: 80, y: 0, delay: 0.7 },
  { label: "₹99", x: 66, y: 66, delay: 1.3, mobile: false },
];

const SPARKLES = [
  { x: 33, y: 22, size: 10, delay: 0 },
  { x: 70, y: 18, size: 8, delay: 1.1 },
  { x: 12, y: 50, size: 9, delay: 0.5 },
  { x: 90, y: 72, size: 11, delay: 1.7 },
  { x: 40, y: 92, size: 8, delay: 0.9 },
  { x: 60, y: 88, size: 10, delay: 2.2 },
];

/** One floating doodle; its layer depth sets how far it follows the pointer. */
const Floater = ({ item, index, pointerX, pointerY, still }) => {
  const shift = item.depth * 14;
  const x = useTransform(pointerX, (value) => value * shift);
  const y = useTransform(pointerY, (value) => value * shift);
  const Icon = item.icon;
  return (
    <motion.div
      className={cn("absolute", item.mobile === false && "hidden sm:block")}
      style={{ left: `${item.x}%`, top: `${item.y}%`, x, y, opacity: 0.22 + item.depth * 0.08 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: item.rotate - 30 }}
        animate={
          still
            ? { opacity: 1, scale: 1, rotate: item.rotate }
            : {
                opacity: 1,
                scale: 1,
                rotate: [item.rotate, item.rotate + 8, item.rotate - 6, item.rotate],
                y: [0, -item.drift, item.drift * 0.4, 0],
              }
        }
        transition={{
          opacity: { delay: 0.15 + index * 0.06, duration: 0.5 },
          scale: { delay: 0.15 + index * 0.06, type: "spring", stiffness: 200, damping: 14 },
          rotate: { duration: 9 + (index % 4) * 2, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6 + (index % 5), repeat: Infinity, ease: "easeInOut" },
        }}
        className="text-accent-text"
      >
        <Icon size={item.size} strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
};

/** A paper price tag swinging on its string. */
const SwingTag = ({ tag, still }) => (
  <motion.div
    className={cn("absolute", tag.mobile === false && "hidden sm:block")}
    style={{ left: `${tag.x}%`, top: `${tag.y}%`, transformOrigin: "50% 0%", opacity: 0.75 }}
    initial={{ opacity: 0, y: -30 }}
    animate={still ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, rotate: [-9, 9, -9] }}
    transition={{
      opacity: { delay: 0.4 + tag.delay * 0.3, duration: 0.4 },
      y: { delay: 0.4 + tag.delay * 0.3, type: "spring", stiffness: 160, damping: 9 },
      rotate: { duration: 3.4, delay: tag.delay, repeat: Infinity, ease: "easeInOut" },
    }}
  >
    {/* string */}
    <span className="mx-auto block h-10 w-px bg-line-strong" />
    <span className="relative -mt-0.5 block rounded-md border-2 border-dashed border-accent bg-surface px-2.5 py-1 text-[0.75rem] font-bold tracking-wide text-accent-text shadow-sm">
      <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-accent bg-surface-canvas" />
      {tag.label}
    </span>
  </motion.div>
);

const ShopDoodleField = () => {
  const still = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Springs smooth the pointer so the layers glide rather than jitter.
  const pointerX = useSpring(rawX, { stiffness: 60, damping: 18 });
  const pointerY = useSpring(rawY, { stiffness: 60, damping: 18 });
  const glowX = useMotionValue(-1000);
  const glowY = useMotionValue(-1000);
  const glow = useTransform(
    [glowX, glowY],
    ([gx, gy]) => `radial-gradient(22rem 22rem at ${gx}px ${gy}px, color-mix(in srgb, var(--brand-leaf-from) 14%, transparent), transparent 70%)`
  );

  useEffect(() => {
    if (still) return undefined;
    const onMove = (event) => {
      rawX.set(event.clientX / window.innerWidth - 0.5);
      rawY.set(event.clientY / window.innerHeight - 0.5);
      glowX.set(event.clientX);
      glowY.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, rawX, rawY, glowX, glowY]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cursor glow */}
      {!still && <motion.div className="absolute inset-0" style={{ background: glow }} />}

      {/* A delivery route drawing itself across the page */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[
          "M -5 30 C 15 10, 30 45, 50 25 S 85 5, 105 35",
          "M -5 75 C 20 95, 40 60, 60 80 S 90 95, 105 70",
        ].map((d, index) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="var(--accent-solid)"
            strokeOpacity={0.16 - index * 0.03}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 9"
            vectorEffect="non-scaling-stroke"
            className={still ? undefined : "route-march"}
            style={{ animationDuration: `${18 + index * 6}s` }}
          />
        ))}
      </svg>

      {/* Floating doodles */}
      {ITEMS.map((item, index) => (
        <Floater key={index} item={item} index={index} pointerX={pointerX} pointerY={pointerY} still={still} />
      ))}

      {/* Swinging price tags */}
      {TAGS.map((tag) => (
        <SwingTag key={tag.label} tag={tag} still={still} />
      ))}

      {/* Twinkles */}
      {SPARKLES.map((sparkle, index) => (
        <motion.span
          key={index}
          className="absolute text-accent-text"
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
          animate={still ? { opacity: 0.3 } : { opacity: [0, 0.55, 0], scale: [0.4, 1.1, 0.4], rotate: [0, 90, 180] }}
          transition={{ duration: 2.6, delay: sparkle.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={sparkle.size} height={sparkle.size} viewBox="0 0 10 10">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="currentColor" />
          </svg>
        </motion.span>
      ))}

      {/* Delivery road with a van driving along it */}
      <div className="absolute inset-x-0 bottom-6 h-10 sm:bottom-8">
        <div className="absolute inset-x-0 bottom-1 border-t-2 border-dashed border-line-strong opacity-60" />
        <motion.div
          className="absolute bottom-1.5 text-accent-text"
          initial={{ left: "-8%" }}
          animate={still ? { left: "12%" } : { left: ["-8%", "108%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
        >
          <motion.div
            animate={still ? {} : { y: [0, -2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative opacity-50"
          >
            <Truck size={34} strokeWidth={1.6} />
            {/* speed lines */}
            <span className="absolute -left-5 top-2 h-0.5 w-4 rounded-full bg-accent opacity-60" />
            <span className="absolute -left-7 top-4 h-0.5 w-5 rounded-full bg-accent opacity-40" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopDoodleField;
