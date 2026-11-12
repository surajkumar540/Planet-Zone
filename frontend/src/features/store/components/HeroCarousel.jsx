import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Doodle } from "../../../components/ui/Doodles";
import cn from "../../../lib/cn";

/**
 * Home-page banner carousel.
 *
 * - advances every few seconds, and pauses while hovered or focused so nobody
 *   has a slide pulled away mid-read;
 * - swipes on touch screens and drags with a mouse;
 * - each slide's palette comes from --promo-* tokens, which have separate,
 *   deeper steps for the dark theme so the banners never glare at night.
 *
 * A slide is `{ id, palette: "leaf"|"sun"|"dusk", eyebrow, title, body, cta: { label, to }, images: [] }`.
 */

const SLIDE_MS = 6000;

const slideVariants = {
  enter: (direction) => ({ x: direction >= 0 ? "100%" : "-100%", opacity: 0.6 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction >= 0 ? "-25%" : "25%", opacity: 0 }),
};

/** Per-slide doodle layouts, so each banner gets its own scatter. */
const DOODLES = {
  leaf: [
    { type: "leaf", size: 54, className: "right-[46%] top-8 rotate-12", delay: 0.2 },
    { type: "sparkle", size: 26, className: "left-[42%] bottom-10", delay: 0.6 },
    { type: "squiggle", size: 70, className: "right-6 bottom-6 opacity-70", delay: 0.4 },
  ],
  sun: [
    { type: "sparkle", size: 34, className: "right-[44%] top-10", delay: 0.2 },
    { type: "swirl", size: 46, className: "left-[40%] bottom-8", delay: 0.5 },
    { type: "star", size: 24, className: "right-10 top-8", delay: 0.8 },
  ],
  dusk: [
    { type: "circle", size: 60, className: "right-[45%] bottom-10", delay: 0.3 },
    { type: "arrow", size: 52, className: "left-[38%] top-10 -rotate-12", delay: 0.5 },
    { type: "dots", size: 40, className: "right-8 bottom-8", delay: 0.7 },
  ],
};

const Slide = ({ slide }) => (
  <div className="relative grid h-full items-center gap-6 px-6 py-10 sm:px-12 lg:grid-cols-[1.1fr_1fr]">
    {(DOODLES[slide.palette] || []).map((doodle) => (
      <Doodle
        key={`${doodle.type}-${doodle.className}`}
        type={doodle.type}
        size={doodle.size}
        delay={doodle.delay}
        float
        className={cn("absolute hidden text-white/30 sm:block", doodle.className)}
      />
    ))}

    <div className="relative z-10 max-w-xl">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-white/25 backdrop-blur"
      >
        {slide.eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="font-display mt-4 text-[2.125rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[3rem]"
      >
        {slide.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-3 max-w-[38ch] text-[1rem] leading-relaxed text-white/85"
      >
        {slide.body}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.45 }}
        className="mt-7"
      >
        <Link
          to={slide.cta.to}
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-semibold shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
          style={{ color: `var(--promo-${slide.palette}-from)` }}
        >
          {slide.cta.label}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>

    {/* A fanned stack of real products, so the banner shows things you can buy. */}
    <div className="relative hidden h-full min-h-[18rem] lg:block" aria-hidden="true">
      {slide.images.slice(0, 3).map((image, index) => {
        const placement = [
          "left-[8%] top-[16%] w-[44%] -rotate-[8deg]",
          "left-[40%] top-[4%] w-[46%] rotate-[4deg] z-10",
          "left-[30%] top-[46%] w-[38%] rotate-[10deg]",
        ][index];
        return (
          <motion.div
            key={`${slide.id}-${image}-${index}`}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
            transition={{
              opacity: { delay: 0.3 + index * 0.12, duration: 0.5 },
              scale: { delay: 0.3 + index * 0.12, duration: 0.5 },
              y: { delay: 0.8 + index * 0.4, duration: 5 + index, repeat: Infinity, ease: "easeInOut" },
            }}
            className={cn(
              "absolute aspect-square overflow-hidden rounded-2xl border-4 border-white/90 bg-white shadow-2xl",
              placement
            )}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </motion.div>
        );
      })}
    </div>
  </div>
);

const HeroCarousel = ({ slides }) => {
  const [[index, direction], setPosition] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (delta) => setPosition(([current]) => [(current + delta + count) % count, delta]),
    [count]
  );
  const goTo = (target) => setPosition(([current]) => [target, target > current ? 1 : -1]);

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const timer = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, paused, count, go]);

  if (!count) return null;
  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
      className="relative h-[25rem] overflow-hidden rounded-[1.75rem] shadow-xl sm:h-[26rem] lg:h-[28rem]"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 240, damping: 32 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -70 || velocity.x < -500) go(1);
            else if (offset.x > 70 || velocity.x > 500) go(-1);
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            background: `radial-gradient(40rem 20rem at 85% 15%, rgba(255,255,255,0.16), transparent 60%), linear-gradient(120deg, var(--promo-${slide.palette}-from), var(--promo-${slide.palette}-to))`,
          }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}: ${slide.title}`}
        >
          <Slide slide={slide} />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2 sm:left-12">
            {slides.map((item, dot) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(dot)}
                aria-label={`Show slide ${dot + 1}`}
                aria-current={dot === index}
                className={cn(
                  "relative h-2 overflow-hidden rounded-full bg-white/35 transition-all duration-300",
                  dot === index ? "w-10" : "w-2 hover:bg-white/60"
                )}
              >
                {dot === index && (
                  <span
                    key={`${index}-progress`}
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white"
                    style={{
                      animation: `promo-progress ${SLIDE_MS}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 right-5 z-20 hidden gap-2 sm:flex">
            {[
              { label: "Previous slide", icon: ChevronLeft, delta: -1 },
              { label: "Next slide", icon: ChevronRight, delta: 1 },
            ].map((control) => (
              <button
                key={control.label}
                type="button"
                onClick={() => go(control.delta)}
                aria-label={control.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/35"
              >
                <control.icon size={18} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
