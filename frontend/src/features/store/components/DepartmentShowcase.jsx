import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Apple,
  ArrowRight,
  Baby,
  BookOpen,
  Droplets,
  Dumbbell,
  LayoutGrid,
  Laptop,
  Leaf,
  Shirt,
  Sofa,
  Sparkles,
  Store,
} from "lucide-react";

import { getAllProducts } from "../../../api/productApi";
import { useApi } from "../../../hooks/useApi";
import { useI18n } from "../../../lib/i18n";
import cn from "../../../lib/cn";
import { img } from "../../../lib/img";

/**
 * Home-page "Shop by category": a mosaic of departments.
 *
 * The first department gets a large tile; every tile shows real product
 * photos from that department, its product count and a few sub-categories
 * to jump straight to. A final tile opens the full shop.
 */

const ICONS = [
  [/natural|organic|food/i, Leaf],
  [/personal|care|bath/i, Droplets],
  [/beauty|fragrance|cosmetic|skin/i, Sparkles],
  [/home|kitchen|furniture|decor/i, Sofa],
  [/electronic|phone|laptop|tech/i, Laptop],
  [/fashion|cloth|apparel|wear/i, Shirt],
  [/grocer|fruit|vegetable/i, Apple],
  [/sport|outdoor|fitness/i, Dumbbell],
  [/toy|kid|baby/i, Baby],
  [/book|station/i, BookOpen],
];
const iconFor = (name) => ICONS.find(([pattern]) => pattern.test(name))?.[1] || Store;
const PALETTES = ["leaf", "dusk", "sun"];

const totalProducts = (node) =>
  (node.productCount || 0) + (node.children || []).reduce((sum, child) => sum + totalProducts(child), 0);

const Tile = ({ dept, index, large }) => {
  const { t } = useI18n();
  const { data: products } = useApi(getAllProducts, { dept: dept._id, limit: large ? 3 : 1, sort: "rating:desc" }, { cacheTime: 10 * 60 * 1000 });
  const photos = (products || []).map((product) => product.image).filter(Boolean);
  const palette = PALETTES[index % PALETTES.length];
  const Icon = iconFor(dept.name);
  const count = totalProducts(dept);
  const children = (dept.children || []).slice(0, large ? 4 : 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-3xl shadow-sm transition-shadow hover:shadow-xl", large ? "col-span-2 row-span-2 min-h-[20rem]" : "min-h-[10.5rem]")}
      style={{ background: `linear-gradient(140deg, var(--promo-${palette}-from), var(--promo-${palette}-to))` }}
    >
      <Link to={`/shop?dept=${dept._id}`} className="absolute inset-0 z-10" aria-label={`${t("Shop")} ${dept.name}`} />

      {/* Product photos, floating on the right */}
      <div className={cn("pointer-events-none absolute", large ? "inset-y-6 right-6 flex w-[46%] items-center" : "bottom-3 right-3 h-[62%] w-[42%]")}>
        {large ? (
          <div className="relative h-full w-full">
            {photos.slice(0, 3).map((src, photo) => (
              <img
                key={src}
                src={img(src, 480)}
                alt=""
                loading="lazy"
                className={cn(
                  "absolute aspect-square w-[62%] rounded-2xl bg-white object-cover shadow-xl ring-4 ring-white/70 transition-transform duration-500",
                  photo === 0 && "right-0 top-0 z-[2] rotate-3 group-hover:rotate-0 group-hover:scale-105",
                  photo === 1 && "bottom-0 left-0 -rotate-6 group-hover:-rotate-2",
                  photo === 2 && "bottom-6 right-4 z-[1] w-[46%] rotate-12 group-hover:rotate-6"
                )}
              />
            ))}
          </div>
        ) : (
          photos[0] && (
            <img
              src={img(photos[0], 320)}
              alt=""
              loading="lazy"
              className="h-full w-full rotate-3 rounded-2xl bg-white object-cover shadow-lg ring-2 ring-white/70 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110"
            />
          )
        )}
      </div>

      {/* Text */}
      <div className={cn("relative flex h-full flex-col text-white", large ? "max-w-[52%] p-6 sm:p-7" : "max-w-[60%] p-4")}>
        <span className={cn("flex items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur", large ? "h-12 w-12" : "h-9 w-9")}>
          <Icon size={large ? 22 : 17} />
        </span>
        <h3 className={cn("font-display mt-3 font-semibold leading-tight", large ? "text-[1.875rem] sm:text-[2.25rem]" : "text-[1.125rem]")}>{dept.name}</h3>
        <p className="mt-0.5 text-[0.8125rem] opacity-85">
          {count} {count === 1 ? t("product") : t("products")}
        </p>

        {large && children.length > 0 && (
          <div className="relative z-20 mt-4 flex flex-wrap gap-1.5">
            {children.map((child) => (
              <Link
                key={child._id}
                to={`/shop?category=${encodeURIComponent(child.name)}`}
                className="rounded-full bg-white/15 px-3 py-1 text-[0.75rem] font-semibold ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white hover:text-[color:var(--promo-leaf-from)]"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        <span className={cn("mt-auto inline-flex items-center gap-1.5 font-semibold", large ? "pt-6 text-[0.9375rem]" : "pt-3 text-[0.8125rem]")}>
          {t("Shop now")}
          <ArrowRight size={large ? 17 : 14} className="transition-transform group-hover:translate-x-1.5" />
        </span>
      </div>
    </motion.div>
  );
};

const DepartmentShowcase = ({ departments }) => {
  const { t } = useI18n();
  const shown = departments.slice(0, 7);
  return (
    <div className="grid auto-rows-[minmax(10.5rem,auto)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {shown.map((dept, index) => (
        <Tile key={dept._id} dept={dept} index={index} large={index === 0} />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ delay: shown.length * 0.06 }}
        className={cn(shown.length % 2 === 0 && "col-span-2 lg:col-span-1")}
      >
        <Link
          to="/shop"
          className="group flex h-full min-h-[10.5rem] flex-col justify-between rounded-3xl border-2 border-dashed border-line bg-surface p-4 transition-colors hover:border-accent hover:bg-accent-subtle"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle text-accent-text transition-transform group-hover:rotate-12">
            <LayoutGrid size={17} />
          </span>
          <span>
            <span className="block text-[1.125rem] font-semibold text-content">{t("All categories")}</span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-accent-text">
              {t("Browse everything")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1.5" />
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  );
};

export default DepartmentShowcase;
