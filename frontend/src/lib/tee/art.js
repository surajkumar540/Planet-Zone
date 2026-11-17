/**
 * Built-in artwork for the studio. Each piece is SVG markup in a 100 x 100
 * box using `currentColor`, so the customer can recolour it, and it is drawn
 * on the canvas as an image (crisp at any print size).
 */
const sunRays = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r, d) => `${(50 + r * Math.cos(a + d)).toFixed(1)} ${(50 + r * Math.sin(a + d)).toFixed(1)}`;
  return `M${p(30, -0.12)} L${p(47, 0)} L${p(30, 0.12)} Z`;
}).join(" ");

export const ART = [
  { key: "heart", label: "Heart", body: `<path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"/>` },
  { key: "star", label: "Star", body: `<path d="M50 5 L61.5 37.5 L95.5 38 L68.5 59 L78.5 92 L50 72.5 L21.5 92 L31.5 59 L4.5 38 L38.5 37.5 Z"/>` },
  { key: "sparkle", label: "Sparkle", body: `<path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z"/>` },
  { key: "bolt", label: "Lightning", body: `<path d="M60 3 L16 57 H45 L37 97 L84 39 H54 L64 3 Z"/>` },
  { key: "leaf", label: "Leaf", body: `<path d="M88 8 C40 8 10 36 10 70 C10 80 13 87 17 93 C22 79 35 59 60 45 C41 62 29 78 25 95 C31 97 37 97 43 97 C76 97 93 66 88 8 Z"/>` },
  { key: "flame", label: "Flame", body: `<path d="M50 3 C57 24 80 35 80 63 C80 83 66 97 50 97 C34 97 20 83 20 63 C20 48 29 39 36 30 C36 44 42 52 48 55 C43 38 45 18 50 3 Z"/>` },
  { key: "crown", label: "Crown", body: `<path d="M8 28 L29 52 L50 16 L71 52 L92 28 L84 78 H16 Z"/><rect x="16" y="84" width="68" height="10" rx="3"/>` },
  { key: "sun", label: "Sun", body: `<circle cx="50" cy="50" r="22"/><path d="${sunRays}"/>` },
  { key: "moon", label: "Moon", body: `<path d="M62 5 C38 9 19 30 19 55 C19 79 39 97 64 97 C76 97 86 93 94 85 C88 87 82 88 76 88 C52 88 34 70 34 46 C34 28 46 12 62 5 Z"/>` },
  { key: "planet", label: "Planet", body: `<circle cx="50" cy="50" r="25"/><ellipse cx="50" cy="50" rx="46" ry="13" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(-20 50 50)"/>` },
  { key: "mountain", label: "Mountains", body: `<path d="M2 88 L36 28 L52 54 L68 34 L98 88 Z"/><circle cx="80" cy="16" r="9"/>` },
  { key: "wave", label: "Wave", body: `<path d="M4 62 C18 30 38 26 50 44 C58 56 70 56 76 46 C66 48 60 40 66 30 C76 16 96 26 96 46 C96 70 76 88 50 88 C30 88 12 80 4 62 Z"/>` },
  { key: "music", label: "Music", body: `<path d="M36 18 L86 6 V68 A13 11 0 1 1 77 58 V29 L45 37 V78 A13 11 0 1 1 36 68 Z"/>` },
  { key: "paw", label: "Paw", body: `<ellipse cx="50" cy="68" rx="22" ry="19"/><ellipse cx="22" cy="44" rx="9" ry="12"/><ellipse cx="38" cy="24" rx="9" ry="12"/><ellipse cx="62" cy="24" rx="9" ry="12"/><ellipse cx="78" cy="44" rx="9" ry="12"/>` },
  {
    key: "smile",
    label: "Smiley",
    body: `<mask id="m"><rect width="100" height="100" fill="#fff"/><circle cx="35" cy="40" r="6" fill="#000"/><circle cx="65" cy="40" r="6" fill="#000"/><path d="M28 58 Q50 82 72 58" stroke="#000" stroke-width="7" fill="none" stroke-linecap="round"/></mask><circle cx="50" cy="50" r="45" mask="url(#m)"/>`,
  },
  { key: "peace", label: "Peace", body: `<g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"><circle cx="50" cy="50" r="40"/><path d="M50 10 V90 M50 52 L22 78 M50 52 L78 78"/></g>` },
  { key: "badge", label: "Badge ring", body: `<g fill="none" stroke="currentColor"><circle cx="50" cy="50" r="44" stroke-width="5"/><circle cx="50" cy="50" r="36" stroke-width="2"/></g>` },
  { key: "ribbon", label: "Banner", body: `<path d="M0 34 H16 V24 H84 V34 H100 L90 50 L100 66 H84 V76 H16 V66 H0 L10 50 Z"/>` },
  { key: "arrow", label: "Arrow", body: `<path d="M6 60 C20 26 52 16 78 30 L80 18 L96 42 L70 52 L74 40 C54 30 30 36 16 64 Z"/>` },
  { key: "flower", label: "Flower", body: `${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="50" cy="26" rx="15" ry="22" transform="rotate(${r} 50 50)"/>`).join("")}<circle cx="50" cy="50" r="12" fill="#fff" fill-opacity="0.6"/>` },
];

export const artByKey = Object.fromEntries(ART.map((piece) => [piece.key, piece]));

/** The piece as a standalone SVG in a given colour. */
export const artSvg = (key, color = "#111111") => {
  const piece = artByKey[key] || ART[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400" color="${color}" fill="${color}">${piece.body}</svg>`;
};

/** Quick emoji stickers (drawn as text, with the device's colour emoji font). */
export const EMOJI = ["😎", "🔥", "🌿", "🌈", "⚡", "🎧", "☕", "🚀", "🐾", "🌸", "🏏", "🎮", "💚", "🌍", "✨", "🦋"];
