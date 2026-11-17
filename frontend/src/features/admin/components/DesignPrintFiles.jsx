import { useState } from "react";
import { Download, Palette } from "lucide-react";

import { getDesign } from "../../../api/designApi";
import { getErrorMessage } from "../../../lib/apiError";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";

const sideName = (side) => (side === "front" ? "Front" : "Back");

/**
 * Custom T-shirt line on an order: the mockups, and print-ready files.
 *
 * Print files are drawn in the browser from the saved layers with the same
 * renderer the customer designed with: a transparent 2400 x 3200 PNG per side
 * (12 x 16 in at 200 dpi).
 */
const DesignPrintFiles = ({ item, orderNumber }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const custom = item.customization || {};
  const sides = custom.sides || ["front"];
  const preview = (side) => item.image.replace(/\/preview\/front$/, `/preview/${side}`);

  const download = async (side) => {
    setBusy(side);
    try {
      const [{ data }, { loadStudioFonts }, { renderPrintFile }] = await Promise.all([
        getDesign(item.design),
        import("../../../lib/tee/fonts"),
        import("../../../lib/tee/render"),
      ]);
      await loadStudioFonts();
      const blob = await renderPrintFile(data.layers[side] || []);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber || "order"}-${(custom.name || "design").replace(/[^\w-]+/g, "-")}-${side}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (caught) {
      toast.error("Couldn't make the print file", getErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2 rounded-md border border-line-subtle bg-surface-sunken p-3">
      <p className="flex items-center gap-1.5 type-caption font-semibold text-content">
        <Palette size={13} className="text-accent-text" /> Custom design “{custom.name || "Design"}” · {custom.color} shirt
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        {sides.map((side) => (
          <div key={side} className="flex flex-col items-start gap-1.5">
            <a href={preview(side)} target="_blank" rel="noreferrer">
              <img src={preview(side)} alt={`${sideName(side)} mockup`} className="h-28 w-[102px] rounded-md border border-line-subtle object-cover" loading="lazy" />
            </a>
            <Button size="sm" variant="secondary" icon={Download} loading={busy === side} onClick={() => download(side)}>
              {sideName(side)} PNG
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignPrintFiles;
