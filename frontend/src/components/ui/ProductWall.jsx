import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Gamepad2, Glasses, Headphones, Laptop, Shirt, ShoppingBag, Smartphone, Watch } from "lucide-react";

import { getAllProducts } from "../../api/productApi";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../lib/format";
import cn from "../../lib/cn";

/**
 * A living wall of the store's own products behind the auth screens.
 *
 * Rows of product cards stream sideways forever, alternating direction and
 * speed, on a plane tilted in 3D. The whole wall leans a little towards the
 * pointer. A spotlight and an edge fade in the page colour keep the form
 * readable in both themes. Until the catalogue loads (or if it can't), the
 * rows show icon cards so the wall is never empty. Reduced-motion users get
 * the same wall standing still.
 */

const PALETTES = ["leaf", "sun", "dusk"];
const ROWS = 6;
const PER_ROW = 9;
const PLACEHOLDER_ICONS = [Headphones, Shirt, Watch, Smartphone, Laptop, ShoppingBag, Glasses, Gamepad2];

/** Card tint from the promo palettes, light enough that products stay crisp. */
const tint = (index) => {
  const palette = PALETTES[index % PALETTES.length];
  return `linear-gradient(150deg, color-mix(in srgb, var(--promo-${palette}-from) 20%, white), color-mix(in srgb, var(--promo-${palette}-to) 36%, white))`;
};

// Cards stay light in both themes (they frame product photos), so their text
// colours are fixed rather than theme tokens.
const Card = ({ item, index }) => (
  <div className="w-[8.5rem] shrink-0 overflow-hidden rounded-2xl bg-white/70 p-1.5 shadow-lg ring-1 ring-black/5 sm:w-[10rem]">
    <div className="aspect-square overflow-hidden rounded-xl" style={{ background: tint(index) }}>
      {item.image ? (
        // Multiply turns each photo's white background into the card's tint.
        <img src={item.image} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover mix-blend-multiply" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-black/40">
          <item.icon size={44} strokeWidth={1.4} />
        </span>
      )}
    </div>
    <div className="px-1.5 pb-1 pt-2">
      <p className="truncate text-[0.75rem] font-semibold text-neutral-800">{item.name}</p>
      <p className="mt-0.5 flex items-center justify-between">
        <span className="text-[0.75rem] font-bold text-neutral-900">{item.price}</span>
        {item.discount > 0 && (
          <span className="rounded-full bg-status-good px-1.5 py-px text-[0.625rem] font-bold text-white">−{item.discount}%</span>
        )}
      </p>
    </div>
  </div>
);

const ProductWall = () => {
  const still = useReducedMotion();
  const { data } = useApi(getAllProducts, { limit: 60, sort: "rating:desc" }, { cacheTime: 10 * 60 * 1000 });

  // Six rows of nine, shuffled per row so neighbours differ.
  const rows = useMemo(() => {
    const products = (data || [])
      .filter((product) => product.image)
      .map((product) => ({
        id: product._id,
        image: product.image,
        name: product.name,
        price: formatCurrency(product.totalPrice),
        discount: Math.round(product.discount || 0),
      }));
    const pool = products.length
      ? products
      : PLACEHOLDER_ICONS.map((icon, index) => ({ id: `p${index}`, icon, name: "New arrival", price: "₹—", discount: 0 }));
    return Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: PER_ROW }, (_, column) => pool[(row * 7 + column * 3) % pool.length])
    );
  }, [data]);

  // The wall leans towards the pointer, smoothed by a spring.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 40, damping: 16 });
  const smoothY = useSpring(pointerY, { stiffness: 40, damping: 16 });
  const rotateY = useTransform(smoothX, (value) => value * 6);
  const rotateX = useTransform(smoothY, (value) => 22 - value * 6);

  useEffect(() => {
    if (still) return undefined;
    const onMove = (event) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, pointerX, pointerY]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "1400px" }}>
      <motion.div
        className="absolute left-1/2 top-1/2 flex w-[170vw] flex-col gap-4 sm:gap-5"
        style={{ x: "-50%", y: "-50%", rotateX, rotateY, rotateZ: -12, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {rows.map((items, row) => (
          <div key={row} className={cn("flex", row > 3 && "hidden sm:flex")}>
            {/* Two copies back to back; sliding by one copy's width loops seamlessly. */}
            <div
              className={cn("flex shrink-0 gap-4 pr-4 sm:gap-5 sm:pr-5", !still && "wall-row")}
              style={{
                animationDuration: `${70 + (row % 3) * 18}s`,
                animationDirection: row % 2 ? "reverse" : "normal",
              }}
            >
              {[...items, ...items].map((item, index) => (
                <Card key={`${item.id}-${index}`} item={item} index={row + index} />
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Readability: a dark wash over the wall, deepest behind the form and at
          the edges, so the card stands out clearly in both themes. */}
      <div className="absolute inset-0" style={{ background: "rgba(5, 10, 8, 0.55)" }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(34rem 30rem at 50% 50%, rgba(3, 7, 5, 0.55) 0%, rgba(3, 7, 5, 0.25) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3,7,5,0.85) 0%, transparent 18%, transparent 82%, rgba(3,7,5,0.85) 100%), linear-gradient(to right, rgba(3,7,5,0.7) 0%, transparent 12%, transparent 88%, rgba(3,7,5,0.7) 100%)",
        }}
      />
    </div>
  );
};

export default ProductWall;
