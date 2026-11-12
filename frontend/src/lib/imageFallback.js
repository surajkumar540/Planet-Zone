/**
 * Replaces any image that fails to load with a neutral placeholder.
 *
 * Product images come from whatever URL an admin typed in, so some will be
 * wrong or go missing. Handling it once, here, covers every <img> in the app
 * instead of each screen remembering an onError handler. A component with its
 * own fallback (such as Avatar's initials) opts out with data-fallback="off".
 */

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/>' +
      '<path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>'
  );

const FALLBACK_CLASS = "img-fallback";

export const installImageFallback = () => {
  // `error` and `load` do not bubble, so listen in the capture phase.
  document.addEventListener(
    "error",
    (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      if (image.dataset.fallback === "off" || image.src === PLACEHOLDER) return;

      image.classList.add(FALLBACK_CLASS);
      image.src = PLACEHOLDER;
    },
    true
  );

  // React reuses <img> elements, so a later, working image must lose the placeholder styling.
  document.addEventListener(
    "load",
    (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.src !== PLACEHOLDER) {
        image.classList.remove(FALLBACK_CLASS);
      }
    },
    true
  );
};
