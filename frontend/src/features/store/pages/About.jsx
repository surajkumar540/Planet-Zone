import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView } from "framer-motion";
import { ArrowRight, Heart, Leaf, PackageCheck, RotateCcw, ShieldCheck, ShoppingBag, Truck, Users } from "lucide-react";

import { getAllProducts, getProductFacets } from "../../../api/productApi";
import { useApi } from "../../../hooks/useApi";
import { useI18n } from "../../../lib/i18n";
import Button from "../../../components/ui/Button";
import { Doodle, Reveal } from "../../../components/ui/Doodles";
import { Container, SectionHeading } from "../components/Primitives";
import { img } from "../../../lib/img";

const VALUES = [
  { icon: Leaf, title: "Sourced responsibly", body: "We buy from producers we know and say where every product comes from." },
  { icon: ShieldCheck, title: "Honest listings", body: "What you read on a product page is what arrives. Reviews come only from verified buyers." },
  { icon: Users, title: "People first", body: "A real person answers support within a working day, and returns need no explanation." },
  { icon: Heart, title: "Built to last", body: "We stock fewer things, chosen because they hold up over time." },
];

const STEPS = [
  { icon: ShoppingBag, title: "You order", body: "Pay by card, UPI, net banking, or cash on delivery." },
  { icon: PackageCheck, title: "We check and pack", body: "Every item is inspected before it leaves us." },
  { icon: Truck, title: "On its way", body: "Tracked delivery, with updates at every step." },
  { icon: RotateCcw, title: "Easy returns", body: "Not right? Send it back within 7 days." },
];

/** Counts up from zero the first time it scrolls into view. */
const CountUp = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || !value) return undefined;
    const controls = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (latest) => setShown(Math.round(latest)) });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{value ? shown : "–"}</span>;
};

const About = () => {
  const { t } = useI18n();
  const { data: facets } = useApi(getProductFacets, {}, { cacheTime: 5 * 60 * 1000 });
  const products = useApi(getAllProducts, { limit: 6, sort: "createdAt:desc" }, { cacheTime: 5 * 60 * 1000 });

  // Everything here is counted from the live catalogue, not written by hand.
  const stats = [
    { value: products.meta?.total, label: "Products on the shelf" },
    { value: facets?.departments?.length, label: "Departments" },
    { value: facets?.categories?.length, label: "Categories" },
    { value: facets?.brands?.length, label: "Brands" },
  ];
  const collage = (products.data || []).slice(0, 4);

  return (
    <>
      {/* ----------------------------------- Hero ----------------------------------- */}
      <section className="relative overflow-hidden border-b border-line-subtle bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50rem 22rem at 20% -10%, color-mix(in srgb, var(--brand-leaf-from) 15%, transparent), transparent 70%)" }}
        />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <Reveal>
            <p className="type-overline text-accent-text">{t("Our story")}</p>
            <h1 className="font-display mt-3 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-content sm:text-[3.5rem]">
              {t("A shop that keeps its promises.")}
            </h1>
            <p className="type-description mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed">
              Planet Zone started with a simple frustration: online shops that describe products generously and
              deliver something else. We keep a smaller, carefully chosen catalogue so we can stand behind every
              item in it, and we only show reviews from people who actually bought the product.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/shop" variant="primary" size="lg" iconRight={ArrowRight}>
                {t("See what we stock")}
              </Button>
              <Button as={Link} to="/contact" size="lg" variant="ghost">
                {t("Contact")}
              </Button>
            </div>
          </Reveal>

          {/* A tilted collage of real products, framed by doodles. */}
          <div className="relative mx-auto hidden h-[22rem] w-full max-w-md lg:block" aria-hidden="true">
            <Doodle type="sprout" size={64} float className="absolute -left-4 top-0 text-accent-text" />
            <Doodle type="sparkle" size={30} float delay={0.6} className="absolute right-2 top-4 text-status-warning" />
            <Doodle type="squiggle" size={80} delay={0.4} className="absolute -bottom-2 left-6 text-content-muted opacity-60" />
            <Doodle type="heart" size={32} float delay={1} className="absolute bottom-6 right-4 text-status-critical opacity-80" />
            {collage.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: [0, -6, 0], rotate: [-8, 5, -3, 8][index] }}
                transition={{
                  opacity: { delay: 0.2 + index * 0.12 },
                  rotate: { delay: 0.2 + index * 0.12, type: "spring", stiffness: 120 },
                  y: { duration: 5 + index, repeat: Infinity, ease: "easeInOut", delay: 1 + index * 0.3 },
                }}
                className="absolute w-[44%] overflow-hidden rounded-2xl border-4 border-surface bg-surface shadow-xl"
                style={{ left: ["4%", "50%", "14%", "54%"][index], top: ["10%", "4%", "50%", "46%"][index] }}
              >
                <img src={img(product.image, 320)} alt="" className="aspect-square w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------- Values ---------------------------------- */}
      <Container className="py-section">
        <SectionHeading eyebrow={t("What we hold ourselves to")} title={t("Four things we don't compromise on")} />
        <Reveal stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <Reveal.Item key={value.title}>
              <motion.div
                whileHover={{ y: -6, rotate: -0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full rounded-2xl border border-line-subtle bg-surface p-6 shadow-xs transition-shadow hover:shadow-lg"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-subtle text-accent-text">
                  <value.icon size={22} />
                </span>
                <h3 className="text-[1.0625rem] font-semibold text-content">{t(value.title)}</h3>
                <p className="type-description mt-2 leading-relaxed">{value.body}</p>
              </motion.div>
            </Reveal.Item>
          ))}
        </Reveal>
      </Container>

      {/* ----------------------------------- Stats ----------------------------------- */}
      <Container className="pb-section">
        <Reveal className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl sm:p-10" >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}
          />
          <Doodle type="leaf" size={90} float className="absolute -right-4 -top-4 text-white opacity-20" />
          <Doodle type="dots" size={60} className="absolute bottom-4 left-6 text-white opacity-30" />
          <p className="relative type-overline text-white opacity-80">{t("The shop today")}</p>
          <div className="relative mt-4 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-[2.5rem] font-semibold leading-none tabular-nums sm:text-[3rem]">
                  <CountUp value={stat.value} />
                </p>
                <p className="mt-2 text-[0.875rem] opacity-85">{t(stat.label)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>

      {/* --------------------------------- Timeline --------------------------------- */}
      <Container className="pb-section">
        <SectionHeading eyebrow={t("About")} title={t("How an order reaches you")} />
        <div className="relative">
          {/* A dashed line that draws itself behind the steps on wide screens. */}
          <svg className="absolute left-0 right-0 top-7 hidden h-4 w-full lg:block" viewBox="0 0 1000 16" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M60 8 C 250 0, 350 16, 500 8 S 800 0, 940 8"
              fill="none"
              stroke="var(--accent-solid)"
              strokeWidth="2"
              strokeDasharray="6 8"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </svg>
          <Reveal stagger={0.15} className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Reveal.Item key={step.title} className="flex flex-col items-start lg:items-center lg:text-center">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-surface text-accent-text shadow-md">
                  <step.icon size={22} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[0.75rem] font-bold text-accent-on">
                    {index + 1}
                  </span>
                </span>
                <h3 className="mt-4 text-[1rem] font-semibold text-content">{step.title}</h3>
                <p className="mt-1 max-w-[26ch] type-description">{step.body}</p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </Container>
    </>
  );
};

export default About;
