/**
 * Ready-made starting points. Each builds layers for the current shirt, so
 * ink colours suit light and dark fabrics. Customers edit them freely.
 */
import { artLayer, textLayer } from "./model";

const accent = (dark) => (dark ? "#facc15" : "#16a34a");

export const TEMPLATES = [
  {
    key: "vibes",
    name: "Good vibes",
    side: "front",
    build: (ink, dark) => [
      artLayer("sun", { x: 150, y: 150, width: 120, color: dark ? "#fbbf24" : "#f59e0b" }),
      textLayer({ text: "GOOD VIBES", font: "Righteous", size: 40, color: ink, curve: 45, x: 150, y: 70, letterSpacing: 2 }),
      textLayer({ text: "only", font: "Pacifico", size: 38, color: accent(dark), x: 150, y: 250 }),
    ],
  },
  {
    key: "plant",
    name: "Plant parent",
    side: "front",
    build: (ink, dark) => [
      artLayer("leaf", { x: 150, y: 120, width: 110, color: dark ? "#4ade80" : "#15803d", rotation: -8 }),
      textLayer({ text: "PLANT\nPARENT", font: "Bebas Neue", size: 66, color: ink, x: 150, y: 245, lineHeight: 0.95, letterSpacing: 3 }),
    ],
  },
  {
    key: "est",
    name: "Your name, est.",
    side: "front",
    build: (ink) => [
      artLayer("badge", { x: 150, y: 160, width: 230, color: ink }),
      artLayer("crown", { x: 150, y: 92, width: 54, color: ink }),
      textLayer({ text: "YOUR NAME", font: "Abril Fatface", size: 30, color: ink, x: 150, y: 152 }),
      textLayer({ text: "EST. 2026", font: "Space Mono", size: 15, bold: true, color: ink, x: 150, y: 190, letterSpacing: 5 }),
    ],
  },
  {
    key: "explore",
    name: "Born to explore",
    side: "front",
    build: (ink, dark) => [
      artLayer("mountain", { x: 150, y: 135, width: 170, color: dark ? "#93c5fd" : "#1e3a8a" }),
      textLayer({ text: "BORN TO EXPLORE", font: "Anton", size: 30, color: ink, x: 150, y: 245, letterSpacing: 2 }),
      textLayer({ text: "Himalaya trail club", font: "Caveat", size: 26, color: accent(dark), x: 150, y: 282 }),
    ],
  },
  {
    key: "team",
    name: "Team jersey",
    side: "back",
    build: (ink, dark) => [
      textLayer({ text: "SHARMA", font: "Anton", size: 46, color: ink, x: 150, y: 70, curve: 30, letterSpacing: 4 }),
      textLayer({ text: "07", font: "Anton", size: 190, color: ink, x: 150, y: 215, strokeWidth: 3, strokeColor: accent(dark) }),
    ],
  },
  {
    key: "coffee",
    name: "Coffee first",
    side: "front",
    build: (ink, dark) => [
      textLayer({ text: "☕", size: 90, font: "Plus Jakarta Sans", color: ink, x: 150, y: 110 }),
      textLayer({ text: "But first,", font: "Lobster", size: 34, color: accent(dark), x: 150, y: 190 }),
      textLayer({ text: "COFFEE", font: "Bangers", size: 74, color: ink, x: 150, y: 245, letterSpacing: 3, shadow: true }),
    ],
  },
];
