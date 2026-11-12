import { forwardRef, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import cn from "../../../lib/cn";
import { img } from "../../../lib/img";

/**
 * A product image that magnifies under the pointer.
 *
 * Hovering zooms in 2.5× with the zoom centred on the cursor, so moving the
 * mouse pans across the detail you are looking at. Touch screens get no zoom
 * (they have pinch-to-zoom), so the image never gets stuck enlarged.
 */
const ZOOM = 2.5;

const ZoomImage = forwardRef(({ src, alt, className }, ref) => {
  const frame = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const track = (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = frame.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };

  return (
    <div
      ref={frame}
      onPointerEnter={(event) => event.pointerType === "mouse" && setZoomed(true)}
      onPointerLeave={() => setZoomed(false)}
      onPointerMove={track}
      className={cn("group relative overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in", className)}
    >
      <img
        ref={ref}
        src={img(src, 1200)}
        alt={alt}
        draggable={false}
        className="aspect-square w-full select-none object-contain transition-transform duration-200 ease-out"
        style={{ transform: zoomed ? `scale(${ZOOM})` : "scale(1)", transformOrigin: origin }}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-surface-inverse px-2.5 py-1 text-[0.75rem] font-medium text-content-inverse shadow-md transition-opacity sm:flex",
          zoomed ? "opacity-0" : "opacity-80"
        )}
      >
        <ZoomIn size={13} /> Hover to zoom
      </span>
    </div>
  );
});

ZoomImage.displayName = "ZoomImage";

export default ZoomImage;
