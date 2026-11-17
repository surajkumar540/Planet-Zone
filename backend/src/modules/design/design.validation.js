const { z } = require("zod");
const { idParam, uuid } = require("../../utils/schemas");
const { TEE_COLORS, SIDES } = require("../../constants/customTee");

/** Fonts the studio offers; the print shop has the same set. */
const FONTS = [
  "Plus Jakarta Sans",
  "Bebas Neue",
  "Anton",
  "Playfair Display",
  "Pacifico",
  "Lobster",
  "Permanent Marker",
  "Bangers",
  "Caveat",
  "Space Mono",
  "Righteous",
  "Abril Fatface",
];

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid colour");
/** Positions are in print-area units (300 x 400); a little overhang is allowed. */
const coord = z.number().min(-300).max(700);

const base = {
  id: z.string().trim().min(1).max(40),
  x: coord,
  y: coord,
  rotation: z.number().min(-360).max(360).default(0),
  opacity: z.number().min(0.1).max(1).default(1),
  flipX: z.boolean().default(false),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
};

const textLayer = z.object({
  ...base,
  type: z.literal("text"),
  text: z.string().max(160).refine((value) => value.trim().length > 0, "Text can't be empty"),
  font: z.enum(FONTS),
  size: z.number().min(6).max(260),
  color: hex,
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  align: z.enum(["left", "center", "right"]).default("center"),
  letterSpacing: z.number().min(-10).max(40).default(0),
  lineHeight: z.number().min(0.7).max(2.5).default(1.15),
  strokeColor: hex.default("#000000"),
  strokeWidth: z.number().min(0).max(16).default(0),
  curve: z.number().min(-100).max(100).default(0),
  shadow: z.boolean().default(false),
});

/** A photo or logo the customer uploaded, resized in the browser (max ~1.2 MB). */
const imageLayer = z.object({
  ...base,
  type: z.literal("image"),
  src: z
    .string()
    .max(1_700_000, "That image is too large")
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Unsupported image"),
  width: z.number().min(8).max(700),
  aspect: z.number().min(0.05).max(20),
  naturalWidth: z.number().int().min(1).max(5000),
});

/** Built-in artwork (an SVG drawn by the studio), recoloured by the customer. */
const artLayer = z.object({
  ...base,
  type: z.literal("art"),
  art: z.string().trim().regex(/^[a-z0-9-]{1,40}$/),
  color: hex,
  width: z.number().min(8).max(700),
});

const layer = z.discriminatedUnion("type", [textLayer, imageLayer, artLayer]);
const sideLayers = z.array(layer).max(30, "Up to 30 elements per side");

const jpegPreview = z
  .string()
  .max(900_000)
  .regex(/^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid preview");

const createDesignSchema = z
  .object({
    name: z.string().trim().max(60).default("My design"),
    color: z.enum(TEE_COLORS.map((color) => color.code)),
    layers: z.object({ front: sideLayers.default([]), back: sideLayers.default([]) }),
    previewFront: jpegPreview,
    // Empty when only the front is printed.
    previewBack: z.union([jpegPreview, z.literal("")]).optional().default(""),
  })
  .superRefine((value, ctx) => {
    const visible = SIDES.filter((side) => value.layers[side].some((item) => !item.hidden));
    if (visible.length === 0) {
      ctx.addIssue({ code: "custom", path: ["layers"], message: "Add some text, art or a photo first" });
    }
    const images = SIDES.flatMap((side) => value.layers[side]).filter((item) => item.type === "image");
    if (images.length > 6) {
      ctx.addIssue({ code: "custom", path: ["layers"], message: "Up to 6 photos per shirt" });
    }
    if (value.layers.back.some((item) => !item.hidden) && !value.previewBack) {
      ctx.addIssue({ code: "custom", path: ["previewBack"], message: "Back preview missing" });
    }
  });

const previewParams = z.object({ id: uuid, side: z.enum(SIDES) });

module.exports = {
  FONTS,
  createDesignSchema,
  previewParams,
  designIdParam: idParam("id"),
};
