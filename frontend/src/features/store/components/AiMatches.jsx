import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { formatCurrency } from "../../../lib/format";
import { img } from "../../../lib/img";

/**
 * "AI found these by meaning": products the local AI model matched to the
 * search even though the words differ ("cooking" → wok, spatula). Shown above
 * the keyword results, without repeating any of them.
 */
const AiMatches = ({ query, products, keywordCount }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--promo-dusk-to)_35%,transparent)] bg-[color-mix(in_srgb,var(--promo-dusk-to)_6%,var(--surface-default))] p-4"
  >
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-bold text-white"
        style={{ background: "linear-gradient(120deg, var(--promo-dusk-from), var(--promo-dusk-to))" }}
      >
        <Sparkles size={12} /> AI
      </span>
      <p className="text-[0.9375rem] font-semibold text-content">
        {keywordCount ? "More that match the meaning of" : "No exact matches. AI found these by meaning for"} “{query}”
      </p>
    </div>
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="group w-36 shrink-0 overflow-hidden rounded-xl border border-line-subtle bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="bg-white">
            <img src={img(product.image, 320)} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="p-2.5">
            <p className="line-clamp-2 text-[0.75rem] font-semibold leading-snug text-content group-hover:text-accent-text">{product.name}</p>
            <p className="mt-0.5 type-numeric text-[0.8125rem] font-bold text-content">{formatCurrency(product.totalPrice)}</p>
          </div>
        </Link>
      ))}
    </div>
  </motion.section>
);

export default AiMatches;
