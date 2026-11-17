import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Eraser,
  Eye,
  EyeOff,
  ImagePlus,
  Image as ImageIcon,
  Italic,
  Layers,
  Loader2,
  Lock,
  Shapes,
  Sparkles,
  Trash2,
  Type,
  Unlock,
  UploadCloud,
} from "lucide-react";

import cn from "../../../lib/cn";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";
import { FONTS } from "../../../lib/tee/fonts";
import { ART, EMOJI, artByKey } from "../../../lib/tee/art";
import { TEMPLATES } from "../../../lib/tee/templates";
import { artLayer, imageLayer, inkFor, textLayer, withFreshIds } from "../../../lib/tee/model";
import { printQuality, renderMockup } from "../../../lib/tee/render";
import { prepareUpload, removeBackground } from "../../../lib/tee/upload";

export const TABS = [
  { key: "templates", label: "Ideas", icon: Sparkles },
  { key: "text", label: "Text", icon: Type },
  { key: "art", label: "Art", icon: Shapes },
  { key: "upload", label: "Upload", icon: ImagePlus },
  { key: "layers", label: "Layers", icon: Layers },
];

/** New artwork cycles through these, so stacked pieces are easy to tell apart. */
const ART_COLORS = {
  light: ["#16a34a", "#2563eb", "#db2777", "#f59e0b"],
  dark: ["#facc15", "#4ade80", "#f472b6", "#60a5fa"],
};

const INKS = ["#111111", "#ffffff", "#16a34a", "#dc2626", "#2563eb", "#f59e0b", "#db2777", "#7c3aed", "#0891b2", "#92400e", "#facc15", "#9ca3af"];

/* --------------------------------- Controls -------------------------------- */

const Section = ({ title, children, className }) => (
  <section className={cn("space-y-2.5", className)}>
    {title && <h3 className="type-caption font-semibold uppercase tracking-wide text-content-muted">{title}</h3>}
    {children}
  </section>
);

const Slider = ({ label, value, min, max, step = 1, onChange, format = (v) => v }) => (
  <label className="block">
    <span className="mb-1 flex items-center justify-between type-caption text-content-secondary">
      {label}
      <span className="type-numeric text-content">{format(value)}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1.5 w-full cursor-pointer accent-[var(--accent-solid)]"
    />
  </label>
);

const Swatches = ({ value, onChange, label = "Colour" }) => (
  <div>
    <span className="mb-1.5 block type-caption text-content-secondary">{label}</span>
    <div className="flex flex-wrap gap-1.5">
      {INKS.map((ink) => (
        <button
          key={ink}
          type="button"
          onClick={() => onChange(ink)}
          className={cn(
            "h-7 w-7 rounded-full border border-line-strong transition-transform hover:scale-110",
            value?.toLowerCase() === ink && "ring-2 ring-accent ring-offset-2 ring-offset-[var(--surface-default)]"
          )}
          style={{ background: ink }}
          aria-label={`Colour ${ink}`}
          aria-pressed={value?.toLowerCase() === ink}
        />
      ))}
      <label
        className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line-strong"
        style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
        title="Any colour"
      >
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Pick any colour" />
      </label>
    </div>
  </div>
);

const Toggle = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    title={label}
    aria-label={label}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
      active ? "border-accent bg-accent-subtle text-accent-text" : "border-line text-content-secondary hover:bg-surface-hover"
    )}
  >
    <Icon size={16} />
  </button>
);

/* ---------------------------------- Tabs ----------------------------------- */

const TemplatesTab = ({ designer, hex, dark, fontsReady, onApplied }) => {
  const [thumbs, setThumbs] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (!fontsReady) return undefined;
    let cancelled = false;
    (async () => {
      for (const template of TEMPLATES) {
        const src = await renderMockup(hex, template.side, template.build(inkFor(dark), dark), { width: 260, quality: 0.8 }).catch(() => "");
        if (cancelled) return;
        setThumbs((current) => ({ ...current, [template.key]: src }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hex, dark, fontsReady]);

  const apply = (template) => {
    designer.replaceSide(template.side, withFreshIds(template.build(inkFor(dark), dark)));
    designer.setSide(template.side);
    onApplied?.();
    toast.success(`"${template.name}" added`, "Click any part to change the words, colours or size.", {
      action: { label: "Undo", onClick: designer.undo },
    });
  };

  return (
    <Section title="Start from an idea">
      <div className="grid grid-cols-2 gap-2.5">
        {TEMPLATES.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => apply(template)}
            className="group overflow-hidden rounded-lg border border-line-subtle bg-surface-sunken text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
          >
            <div className="aspect-[600/600] w-full overflow-hidden">
              {thumbs[template.key] ? (
                <img src={thumbs[template.key]} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full animate-pulse bg-surface-hover" />
              )}
            </div>
            <p className="flex items-center justify-between px-2.5 py-2 type-caption font-medium text-content">
              {template.name}
              <span className="text-content-muted">{template.side === "back" ? "Back" : "Front"}</span>
            </p>
          </button>
        ))}
      </div>
      <p className="type-caption text-content-muted">Applying an idea replaces that side. You can always undo.</p>
    </Section>
  );
};

const TextTab = ({ designer, dark, textRef }) => {
  const { selected, updateLayer, addLayer } = designer;
  const text = selected?.type === "text" ? selected : null;
  const ink = inkFor(dark);
  const set = (patch, key) => updateLayer(text.id, patch, { coalesce: key || Object.keys(patch)[0] });

  return (
    <div className="space-y-5">
      <Section title="Add text">
        <div className="grid gap-2">
          <button type="button" onClick={() => addLayer(textLayer({ text: "BIG HEADLINE", font: "Anton", size: 46, color: ink }))} className="rounded-md border border-line px-3 py-2.5 text-left transition hover:border-accent hover:bg-surface-hover">
            <span style={{ fontFamily: "Anton" }} className="text-[1.35rem] leading-none text-content">Add a headline</span>
          </button>
          <button type="button" onClick={() => addLayer(textLayer({ text: "A catchy line", font: "Plus Jakarta Sans", bold: true, size: 26, color: ink, y: 200 }))} className="rounded-md border border-line px-3 py-2 text-left transition hover:border-accent hover:bg-surface-hover">
            <span className="text-[1rem] font-bold text-content">Add a subheading</span>
          </button>
          <button type="button" onClick={() => addLayer(textLayer({ text: "Script vibes", font: "Pacifico", size: 34, color: ink, y: 240 }))} className="rounded-md border border-line px-3 py-2 text-left transition hover:border-accent hover:bg-surface-hover">
            <span style={{ fontFamily: "Pacifico" }} className="text-[1.05rem] text-content">Add script text</span>
          </button>
        </div>
      </Section>

      {text ? (
        <>
          <Section title="Edit text">
            <textarea
              ref={textRef}
              value={text.text}
              rows={Math.min(4, text.text.split("\n").length + 1)}
              maxLength={160}
              onChange={(event) => set({ text: event.target.value || " " }, "text")}
              className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 type-body text-content focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
              aria-label="Text"
            />
          </Section>

          <Section title="Font">
            <div className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
              {FONTS.map((font) => (
                <button
                  key={font.family}
                  type="button"
                  onClick={() => set({ font: font.family })}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-left transition",
                    text.font === font.family ? "border-accent bg-accent-subtle" : "border-line-subtle hover:border-line-strong"
                  )}
                >
                  <span className="block truncate text-[1.05rem] leading-tight text-content" style={{ fontFamily: `"${font.family}"` }}>
                    {text.text.split("\n")[0].slice(0, 12) || "Aa"}
                  </span>
                  <span className="type-caption text-content-muted">{font.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Style">
            <Slider label="Size" value={text.size} min={8} max={200} onChange={(size) => set({ size })} />
            <Swatches value={text.color} onChange={(color) => set({ color })} />
            <div className="flex flex-wrap gap-1.5">
              <Toggle icon={Bold} label="Bold" active={text.bold} onClick={() => set({ bold: !text.bold })} />
              <Toggle icon={Italic} label="Italic" active={text.italic} onClick={() => set({ italic: !text.italic })} />
              <span className="mx-1 w-px bg-line" />
              <Toggle icon={AlignLeft} label="Align left" active={text.align === "left"} onClick={() => set({ align: "left" })} />
              <Toggle icon={AlignCenter} label="Align centre" active={text.align === "center"} onClick={() => set({ align: "center" })} />
              <Toggle icon={AlignRight} label="Align right" active={text.align === "right"} onClick={() => set({ align: "right" })} />
            </div>
            <Slider label="Letter spacing" value={text.letterSpacing} min={-5} max={30} onChange={(letterSpacing) => set({ letterSpacing })} />
            {text.text.includes("\n") && text.curve === 0 && (
              <Slider label="Line height" value={text.lineHeight} min={0.7} max={2} step={0.05} onChange={(lineHeight) => set({ lineHeight })} format={(v) => v.toFixed(2)} />
            )}
          </Section>

          <Section title="Effects">
            <Slider
              label="Curve"
              value={text.curve}
              min={-100}
              max={100}
              onChange={(curve) => set({ curve: Math.abs(curve) < 3 ? 0 : curve })}
              format={(v) => (v === 0 ? "Straight" : v > 0 ? `Arch ${v}` : `Smile ${-v}`)}
            />
            <Slider label="Outline" value={text.strokeWidth} min={0} max={12} step={0.5} onChange={(strokeWidth) => set({ strokeWidth })} format={(v) => (v ? v : "None")} />
            {text.strokeWidth > 0 && <Swatches label="Outline colour" value={text.strokeColor} onChange={(strokeColor) => set({ strokeColor })} />}
            <label className="flex cursor-pointer items-center gap-2 type-body text-content">
              <input type="checkbox" checked={text.shadow} onChange={() => set({ shadow: !text.shadow })} className="h-4 w-4 accent-[var(--accent-solid)]" />
              Drop shadow
            </label>
          </Section>
        </>
      ) : (
        <p className="rounded-md bg-surface-sunken px-3 py-2.5 type-caption text-content-secondary">
          Select text on the shirt to change its words, font, colour and curve.
        </p>
      )}
    </div>
  );
};

const ArtTab = ({ designer, dark }) => {
  const { selected, updateLayer, addLayer } = designer;
  const art = selected?.type === "art" ? selected : null;
  const ink = inkFor(dark);
  return (
    <div className="space-y-5">
      <Section title="Artwork">
        <div className="grid grid-cols-5 gap-1.5">
          {ART.map((piece) => (
            <button
              key={piece.key}
              type="button"
              title={piece.label}
              aria-label={`Add ${piece.label}`}
              onClick={() => addLayer(artLayer(piece.key, { color: ART_COLORS[dark ? "dark" : "light"][designer.layers.length % 4] }))}
              className="flex aspect-square items-center justify-center rounded-md border border-line-subtle p-2 text-content transition hover:scale-105 hover:border-accent hover:text-accent-text"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full" fill="currentColor" dangerouslySetInnerHTML={{ __html: piece.body.replace('id="m"', `id="m-${piece.key}"`).replace("url(#m)", `url(#m-${piece.key})`) }} />
            </button>
          ))}
        </div>
      </Section>
      {art && (
        <Section title={`${artByKey[art.art]?.label || "Art"} colour`}>
          <Swatches value={art.color} onChange={(color) => updateLayer(art.id, { color }, { coalesce: "color" })} />
        </Section>
      )}
      <Section title="Emoji stickers">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addLayer(textLayer({ text: emoji, font: "Plus Jakarta Sans", size: 80, y: 160 }))}
              className="flex aspect-square items-center justify-center rounded-md text-[1.4rem] transition hover:scale-125 hover:bg-surface-hover"
              aria-label={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};

const QUALITY = {
  great: { label: "Prints sharp", tone: "text-status-good bg-status-good-bg" },
  ok: { label: "Prints fine", tone: "text-status-warning bg-status-warning-bg" },
  low: { label: "May look blurry: make it smaller", tone: "text-status-critical bg-status-critical-bg" },
};

const UploadTab = ({ designer }) => {
  const { selected, updateLayer, addLayer, layers } = designer;
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const photo = selected?.type === "image" ? selected : null;
  const quality = photo ? printQuality(photo) : null;

  const add = async (file) => {
    if (!file) return;
    if (layers.filter((layer) => layer.type === "image").length >= 3) {
      toast.warning("Up to 3 photos per side", "Remove one to add another.");
      return;
    }
    setBusy(true);
    try {
      const prepared = await prepareUpload(file);
      addLayer(imageLayer(prepared));
    } catch (error) {
      toast.error("Couldn't add that image", error.message);
    } finally {
      setBusy(false);
    }
  };

  const clearBackground = async () => {
    setBusy(true);
    try {
      const result = await removeBackground(photo.src);
      updateLayer(photo.id, { src: result.src, naturalWidth: result.naturalWidth });
      toast.success("Background removed", "Not quite right? Undo brings it back.", { action: { label: "Undo", onClick: designer.undo } });
    } catch (error) {
      toast.info("Nothing removed", error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Section title="Your photo or logo">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            add(event.dataTransfer.files?.[0]);
          }}
          disabled={busy}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-7 text-center transition",
            dragging ? "border-accent bg-accent-subtle" : "border-line hover:border-accent hover:bg-surface-hover"
          )}
        >
          {busy ? <Loader2 size={26} className="animate-spin text-accent-text" /> : <UploadCloud size={26} className="text-accent-text" />}
          <span className="type-body-strong text-content">{busy ? "Preparing your image…" : "Drop an image or click to upload"}</span>
          <span className="type-caption text-content-muted">PNG, JPG or WebP. Transparent PNGs print best.</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            add(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <p className="type-caption text-content-muted">Photos stay private to you and our print team. Only upload images you have the right to print.</p>
      </Section>

      {photo && (
        <Section title="Selected photo">
          <div className="flex items-center gap-3">
            <img src={photo.src} alt="" className="h-14 w-14 rounded-md border border-line-subtle bg-surface-sunken object-contain" />
            <div className="min-w-0">
              <span className={cn("inline-flex rounded-full px-2 py-0.5 type-caption font-medium", QUALITY[quality.level].tone)}>{QUALITY[quality.level].label}</span>
              <p className="mt-1 type-caption text-content-muted">About {quality.dpi} dpi at this size</p>
            </div>
          </div>
          <Button variant="secondary" icon={Eraser} onClick={clearBackground} loading={busy} fullWidth>
            Remove plain background
          </Button>
        </Section>
      )}
    </div>
  );
};

const layerLabel = (layer) => {
  if (layer.type === "text") return layer.text.replace(/\n/g, " ").slice(0, 28) || "Text";
  if (layer.type === "art") return artByKey[layer.art]?.label || "Art";
  return "Photo";
};

const LAYER_ICON = { text: Type, art: Shapes, image: ImageIcon };

const LayersTab = ({ designer }) => {
  const { layers, selectedId, select, updateLayer, reorder, removeLayer } = designer;
  if (layers.length === 0) {
    return <p className="rounded-md bg-surface-sunken px-3 py-2.5 type-caption text-content-secondary">Nothing on this side yet.</p>;
  }
  return (
    <Section title={`${layers.length} element${layers.length === 1 ? "" : "s"} · top first`}>
      <ul className="space-y-1.5">
        {[...layers].reverse().map((layer, index) => {
          const Icon = LAYER_ICON[layer.type];
          return (
            <li
              key={layer.id}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5 transition",
                selectedId === layer.id ? "border-accent bg-accent-subtle" : "border-line-subtle hover:bg-surface-hover",
                layer.hidden && "opacity-60"
              )}
            >
              <button type="button" onClick={() => select(layer.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-surface-sunken" style={layer.type !== "image" ? { color: layer.color } : undefined}>
                  {layer.type === "image" ? <img src={layer.src} alt="" className="h-full w-full rounded object-cover" /> : <Icon size={14} />}
                </span>
                <span className="truncate type-caption text-content" style={layer.type === "text" ? { fontFamily: `"${layer.font}"` } : undefined}>
                  {layerLabel(layer)}
                </span>
              </button>
              <Button size="icon-sm" variant="ghost" icon={ArrowUp} aria-label="Bring forward" disabled={index === 0} onClick={() => reorder(layer.id, 1)} />
              <Button size="icon-sm" variant="ghost" icon={ArrowDown} aria-label="Send backward" disabled={index === layers.length - 1} onClick={() => reorder(layer.id, -1)} />
              <Button size="icon-sm" variant="ghost" icon={layer.hidden ? EyeOff : Eye} aria-label={layer.hidden ? "Show" : "Hide"} onClick={() => updateLayer(layer.id, { hidden: !layer.hidden })} />
              <Button size="icon-sm" variant="ghost" icon={layer.locked ? Lock : Unlock} aria-label={layer.locked ? "Unlock" : "Lock"} onClick={() => updateLayer(layer.id, { locked: !layer.locked })} />
              <Button size="icon-sm" variant="ghost" icon={Trash2} aria-label="Delete" onClick={() => removeLayer(layer.id)} />
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

/** Opacity and rotation for whatever is selected. */
const ArrangeSection = ({ designer }) => {
  const { selected, updateLayer } = designer;
  if (!selected) return null;
  return (
    <Section title="Arrange" className="border-t border-line-subtle pt-4">
      <Slider label="Rotate" value={selected.rotation || 0} min={-180} max={180} onChange={(rotation) => updateLayer(selected.id, { rotation }, { coalesce: "rotation" })} format={(v) => `${v}°`} />
      <Slider label="Opacity" value={Math.round((selected.opacity ?? 1) * 100)} min={10} max={100} onChange={(v) => updateLayer(selected.id, { opacity: v / 100 }, { coalesce: "opacity" })} format={(v) => `${v}%`} />
    </Section>
  );
};

const ToolPanel = ({ tab, setTab, designer, hex, dark, fontsReady, textRef }) => (
  <div className="flex h-full flex-col">
    <div role="tablist" aria-label="Design tools" className="grid grid-cols-5 gap-1 rounded-lg bg-surface-sunken p-1">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={tab === key}
          onClick={() => setTab(key)}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 type-caption font-medium transition",
            tab === key ? "bg-surface text-accent-text shadow-sm" : "text-content-secondary hover:text-content"
          )}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
    <div className="mt-4 space-y-5" role="tabpanel">
      {tab === "templates" && <TemplatesTab designer={designer} hex={hex} dark={dark} fontsReady={fontsReady} onApplied={() => setTab("text")} />}
      {tab === "text" && <TextTab designer={designer} dark={dark} textRef={textRef} />}
      {tab === "art" && <ArtTab designer={designer} dark={dark} />}
      {tab === "upload" && <UploadTab designer={designer} />}
      {tab === "layers" && <LayersTab designer={designer} />}
      {tab !== "layers" && tab !== "templates" && <ArrangeSection designer={designer} />}
    </div>
  </div>
);

export default ToolPanel;
