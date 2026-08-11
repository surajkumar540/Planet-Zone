import { useRef } from "react";
import cn from "../../../../lib/cn";

/**
 * Segmented one-time-code input.
 *
 * One box per digit, because a six-character code typed into a single field
 * gives no feedback about how much is left. The boxes are separate inputs so
 * the browser's SMS/email autofill can target them, and so a caret lands where
 * the customer taps.
 *
 * The value is owned by the parent as a plain string — the boxes are a view of
 * it, which keeps paste, autofill and backspace from having to reconcile six
 * pieces of independent state.
 */
const OtpInput = ({ value = "", onChange, length = 6, invalid, disabled, autoFocus }) => {
  const refs = useRef([]);

  const digits = Array.from({ length }, (_, index) => value[index] || "");

  const focusBox = (index) => {
    const target = refs.current[Math.min(Math.max(index, 0), length - 1)];
    target?.focus();
    target?.select();
  };

  const setDigit = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (index) => (event) => {
    const typed = event.target.value.replace(/\D/g, "");
    if (!typed) return;

    // Typing into a box with several characters (autofill, or a fast paste
    // into one field) fills forward from here rather than dropping the rest.
    if (typed.length > 1) {
      const merged = (value.slice(0, index) + typed).slice(0, length);
      onChange(merged);
      focusBox(merged.length);
      return;
    }

    setDigit(index, typed);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
        return;
      }
      // Already empty: clear the previous box and step back to it.
      if (index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
        focusBox(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onFocus={(event) => event.target.select()}
          className={cn(
            "h-14 w-full min-w-0 rounded-md border-[1.5px] text-center outline-none",
            "type-numeric text-[1.375rem] font-semibold text-content",
            "transition-[border-color,background-color] duration-150",
            "disabled:opacity-60 disabled:bg-surface-sunken",
            invalid
              ? "border-status-critical bg-surface"
              : cn(
                  "border-line-strong bg-surface-sunken hover:border-content-muted",
                  // A filled box keeps the accent edge, so progress through the
                  // code is legible without counting carets.
                  digit && "border-accent bg-surface",
                  "focus:border-accent focus:bg-surface"
                )
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;
