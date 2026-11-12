import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages } from "lucide-react";

import { useI18n } from "../../../lib/i18n";
import cn from "../../../lib/cn";

/** Header language menu. The choice is remembered in this browser. */
const LanguageSwitcher = () => {
  const { lang, setLang, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const current = languages.find((language) => language.code === lang);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("Language")}: ${current?.native}`}
        className="flex h-control items-center gap-1 rounded-md px-2 text-content-secondary transition-colors hover:bg-surface-hover hover:text-content"
      >
        <Languages size={18} />
        <span className="text-[0.75rem] font-bold uppercase">{lang}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            className="absolute right-0 top-full z-50 mt-1 max-h-[70vh] w-60 overflow-y-auto rounded-xl border border-line bg-surface-overlay p-1 shadow-lg"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                role="menuitemradio"
                aria-checked={language.code === lang}
                onClick={() => {
                  setLang(language.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.875rem] transition-colors",
                  language.code === lang ? "bg-accent-subtle font-semibold text-accent-text" : "text-content hover:bg-surface-hover"
                )}
              >
                <span className="min-w-0">
                  <span className="block">
                    {language.native} <span className="text-content-muted">-</span>{" "}
                    <span className="text-[0.75rem] font-bold uppercase tracking-wide">{language.code}</span>
                  </span>
                  {language.translate && (
                    <span className="block text-[0.75rem] font-normal text-content-muted">{language.translate}</span>
                  )}
                </span>
                {language.code === lang && <Check size={15} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
