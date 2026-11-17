import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "../../lib/cn";

/**
 * A horizontal row that scrolls (tabs, chips).
 *
 * - Arrow buttons and faded edges appear only on the side with more to see.
 * - A vertical mouse wheel scrolls it sideways.
 * - The element marked `data-active="true"` is scrolled fully into view
 *   whenever `activeKey` changes, so a tab clicked at the edge never stays
 *   half hidden.
 */
const ScrollRail = ({ children, activeKey, className, innerClassName, label }) => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    setEdges({
      left: node.scrollLeft > 2,
      right: node.scrollLeft + node.clientWidth < node.scrollWidth - 2,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    const node = ref.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [measure, children]);

  // Bring the active item fully into view (with a little room either side).
  useEffect(() => {
    const node = ref.current;
    const active = node?.querySelector('[data-active="true"]');
    if (!node || !active) return;
    const pad = 48;
    const left = active.offsetLeft - node.offsetLeft;
    const right = left + active.offsetWidth;
    if (left - pad < node.scrollLeft) node.scrollTo({ left: Math.max(0, left - pad), behavior: "smooth" });
    else if (right + pad > node.scrollLeft + node.clientWidth) node.scrollTo({ left: right + pad - node.clientWidth, behavior: "smooth" });
  }, [activeKey]);

  // Vertical wheel → sideways scroll, but only while there is room to move.
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) return;
      const atStart = node.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = node.scrollLeft >= max - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const page = (direction) => {
    const node = ref.current;
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.7, behavior: "smooth" });
  };

  const mask =
    edges.left && edges.right
      ? "linear-gradient(to right, transparent, #000 56px, #000 calc(100% - 56px), transparent)"
      : edges.left
        ? "linear-gradient(to right, transparent, #000 56px)"
        : edges.right
          ? "linear-gradient(to right, #000 calc(100% - 56px), transparent)"
          : undefined;

  const arrow = "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-content shadow-md transition hover:border-accent hover:text-accent-text sm:flex";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        onScroll={measure}
        role="group"
        aria-label={label}
        className={cn("flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", innerClassName)}
        style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
      >
        {children}
      </div>
      {edges.left && (
        <button type="button" onClick={() => page(-1)} className={cn(arrow, "-left-3")} aria-label="Scroll left">
          <ChevronLeft size={16} />
        </button>
      )}
      {edges.right && (
        <button type="button" onClick={() => page(1)} className={cn(arrow, "-right-3")} aria-label="Scroll right">
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default ScrollRail;
