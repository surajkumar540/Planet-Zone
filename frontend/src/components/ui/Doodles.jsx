import { motion } from "framer-motion";
import cn from "../../lib/cn";

/**
 * Hand-drawn decorations.
 *
 * Every doodle is a stroked path that "draws itself" the first time it scrolls
 * into view, and can optionally bob gently afterwards. They use currentColor,
 * so a parent sets the colour with a text-* class and they follow the theme.
 * Purely decorative: hidden from assistive tech, and framer's reduced-motion
 * setting (MotionConfig in StoreLayout) turns the movement off.
 */
const PATHS = {
  leaf: ["M4 20 C3 11 9 4 20 4 C20 15 13 21 4 20 Z", "M4 20 C8 15 12 11 16 8"],
  sparkle: ["M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z"],
  squiggle: ["M2 12 C5 6 8 6 11 12 S17 18 20 12 S23 8 24 9"],
  swirl: ["M12 12 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0"],
  circle: ["M12 3 C17 3 21 7 21 12 C21 17 17 21 12 21 C6.5 21 3 17 3 12 C3 8 5.5 4 10 3.2"],
  heart: ["M12 20 C4 14 2 10 4.5 6.5 C6.5 4 10 4.5 12 7.5 C14 4.5 17.5 4 19.5 6.5 C22 10 20 14 12 20 Z"],
  star: ["M12 3 L14.5 9 L21 9.5 L16 13.8 L17.6 20.2 L12 16.8 L6.4 20.2 L8 13.8 L3 9.5 L9.5 9 Z"],
  arrow: ["M3 16 C8 6 15 5 20 8", "M16 4.5 L20.5 8 L16.5 11"],
  plane: ["M2 11 L22 3 L15 21 L11 13 Z", "M11 13 L22 3"],
  envelope: ["M3 6 H21 V18 H3 Z", "M3 6 L12 13 L21 6"],
  sprout: ["M12 21 V11", "M12 13 C12 8 8 6 4 6 C4 10 7 13 12 13", "M12 11 C12 6 15 3 20 3 C20 8 17 11 12 11"],
  dots: ["M4 4 h0.01", "M12 4 h0.01", "M20 4 h0.01", "M4 12 h0.01", "M12 12 h0.01", "M20 12 h0.01"],
};

export const Doodle = ({
  type = "leaf",
  size = 32,
  className,
  delay = 0,
  float = false,
  strokeWidth = 1.6,
  style,
}) => {
  const paths = PATHS[type] || PATHS.leaf;
  const isDots = type === "dots";

  return (
    <motion.svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={isDots ? 2.6 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("pointer-events-none shrink-0", className)}
      style={style}
      animate={float ? { y: [0, -6, 0], rotate: [0, 3, 0] } : undefined}
      transition={
        float ? { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay } : undefined
      }
    >
      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, delay: delay + index * 0.15, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
  );
};

/**
 * Fades and lifts its children into place the first time they scroll into
 * view. `stagger` makes direct <Reveal.Item> children arrive one after another.
 */
export const Reveal = ({ children, className, delay = 0, as = "div", stagger = 0 }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: stagger ? {} : { opacity: 0, y: 18 },
        visible: stagger
          ? { transition: { staggerChildren: stagger, delayChildren: delay } }
          : { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </Component>
  );
};

/** A child of a staggered <Reveal>. */
const RevealItem = ({ children, className, as = "div" }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </Component>
  );
};
Reveal.Item = RevealItem;

export default Doodle;
