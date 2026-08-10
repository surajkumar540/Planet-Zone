import { useState } from "react";
import { initialsOf } from "../../lib/format";
import cn from "../../lib/cn";

const SIZES = {
  xs: "w-6 h-6 text-caption",
  sm: "w-8 h-8 text-caption",
  md: "w-10 h-10 text-label",
  lg: "w-12 h-12 text-card",
};

/**
 * Falls back to initials when there is no image, or when the image fails to
 * load — a broken image icon in a customer list looks like a bug.
 */
const Avatar = ({ src, firstName, lastName, name, size = "md", className }) => {
  const [failed, setFailed] = useState(false);
  const initials = name ? initialsOf(...name.split(" ")) : initialsOf(firstName, lastName);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden",
        "bg-accent-subtle text-accent-text font-semibold select-none",
        SIZES[size] || SIZES.md,
        className
      )}
      aria-hidden="true"
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
};

export default Avatar;
