import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ImagePlus, Palette, Type } from "lucide-react";

import Button from "../../../components/ui/Button";
import { PRINT_BOX, SHIRT_H, SHIRT_W, luminance, shirtSvg } from "../../../lib/tee/shirt";

/** Shirt colours and slogans the promo cycles through. */
const LOOKS = [
  { hex: "#1c1c1e", line1: "GOOD", line2: "VIBES", script: "only" },
  { hex: "#2f5d3a", line1: "PLANT", line2: "PARENT", script: "since 2026" },
  { hex: "#e0a526", line1: "BORN TO", line2: "EXPLORE", script: "the hills" },
  { hex: "#1f2a44", line1: "YOUR", line2: "NAME", script: "right here" },
  { hex: "#f7f7f5", line1: "BUT FIRST", line2: "COFFEE", script: "always" },
];

const pct = (value, total) => `${(value / total) * 100}%`;

/**
 * Home-page band for the T-shirt studio: a shirt that keeps changing colour
 * and slogan, so the idea ("make it yours") is obvious before reading a word.
 */
const StudioPromo = () => {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const look = LOOKS[index];
  const ink = luminance(look.hex) < 0.45 ? "#ffffff" : "#111111";
  const box = PRINT_BOX.front;

  useEffect(() => {
    if (reduce) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % LOOKS.length), 2400);
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl text-white"
      style={{ background: "linear-gradient(120deg, var(--promo-dusk-from), var(--promo-dusk-to))" }}
    >
      <div className="grid items-center gap-6 p-6 sm:p-10 md:grid-cols-2">
        <div>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-widest text-white" style={{ opacity: 0.8 }}>
            New · Planet Studio
          </p>
          <h2 className="mt-2 font-display text-[2rem] font-semibold leading-tight sm:text-[2.5rem]">Design your own T-shirt</h2>
          <p className="mt-3 max-w-md text-[1.0625rem]" style={{ opacity: 0.88 }}>
            Add your words, photos and art, see it on the shirt instantly, and we print it on soft cotton for you.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              [Type, "12 fonts & curved text"],
              [ImagePlus, "Your photos & logos"],
              [Palette, "8 colours · front & back"],
            ].map(([Icon, label]) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-white" style={{ background: "rgba(255,255,255,0.16)" }}>
                <Icon size={14} /> {label}
              </li>
            ))}
          </ul>
          <Button as={Link} to="/customize" size="lg" iconRight={ArrowRight} className="mt-6 bg-white text-[#312e81] hover:bg-white hover:opacity-90">
            Start designing · from ₹399
          </Button>
        </div>

        <Link to="/customize" aria-label="Open the T-shirt studio" className="relative mx-auto w-full max-w-[380px]" style={{ aspectRatio: `${SHIRT_W} / ${SHIRT_H}` }}>
          <motion.div
            className="absolute inset-0"
            animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -1.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: shirtSvg(look.hex, "front", "promo") }} />
            <div
              className="absolute flex flex-col items-center justify-center text-center"
              style={{ left: pct(box.x, SHIRT_W), top: pct(box.y, SHIRT_H), width: pct(box.width, SHIRT_W), height: pct(box.height * 0.8, SHIRT_H) }}
            >
              <motion.div
                  key={index}
                  initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ color: ink }}
                >
                  <p className="text-[clamp(1rem,2.7vw,1.65rem)] font-extrabold leading-[0.95] tracking-wide">{look.line1}</p>
                  <p className="text-[clamp(1rem,2.7vw,1.65rem)] font-extrabold leading-[0.95] tracking-wide">{look.line2}</p>
                  <p className="mt-1 font-display text-[clamp(0.75rem,1.6vw,1rem)] italic" style={{ color: luminance(look.hex) < 0.45 ? "#facc15" : "#16a34a" }}>
                    {look.script}
                  </p>
                </motion.div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default StudioPromo;
