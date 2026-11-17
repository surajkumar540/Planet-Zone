/**
 * Fonts the studio offers (the same list the API accepts).
 *
 * They are loaded only when the studio opens, then awaited before drawing, so
 * the canvas never measures text with a fallback font.
 */
export const FONTS = [
  { family: "Plus Jakarta Sans", label: "Clean", weights: [400, 700] },
  { family: "Bebas Neue", label: "Tall caps", weights: [400] },
  { family: "Anton", label: "Bold poster", weights: [400] },
  { family: "Playfair Display", label: "Elegant", weights: [400, 700], italic: true },
  { family: "Abril Fatface", label: "Fashion", weights: [400] },
  { family: "Pacifico", label: "Surf script", weights: [400] },
  { family: "Lobster", label: "Retro script", weights: [400] },
  { family: "Caveat", label: "Handwritten", weights: [400, 700] },
  { family: "Permanent Marker", label: "Marker", weights: [400] },
  { family: "Bangers", label: "Comic", weights: [400] },
  { family: "Righteous", label: "Groovy", weights: [400] },
  { family: "Space Mono", label: "Typewriter", weights: [400, 700], italic: true },
];

const familyParam = ({ family, weights, italic }) => {
  const name = family.replace(/ /g, "+");
  if (italic) {
    const pairs = [0, 1].flatMap((i) => weights.map((w) => `${i},${w}`));
    return `family=${name}:ital,wght@${pairs.join(";")}`;
  }
  return weights.length > 1 ? `family=${name}:wght@${weights.join(";")}` : `family=${name}`;
};

let ready = null;

/** Adds the stylesheet once and resolves when every studio font can be drawn. */
export const loadStudioFonts = () => {
  if (ready) return ready;
  const id = "studio-fonts";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${FONTS.filter((f) => f.family !== "Plus Jakarta Sans")
      .map(familyParam)
      .join("&")}&display=swap`;
    document.head.appendChild(link);
  }
  ready = Promise.all(
    FONTS.flatMap((font) =>
      font.weights.map((weight) => document.fonts.load(`${weight} 40px "${font.family}"`).catch(() => null))
    )
  ).then(() => document.fonts.ready);
  return ready;
};
