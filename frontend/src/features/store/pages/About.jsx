import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, ShieldCheck, Users } from "lucide-react";

import Button from "../../../components/ui/Button";
import { Container, SectionHeading } from "../components/Primitives";

const VALUES = [
  {
    icon: Leaf,
    title: "Sourced responsibly",
    body: "We buy direct from producers and publish where every product comes from.",
  },
  {
    icon: ShieldCheck,
    title: "Honest listings",
    body: "What you read on a product page is what arrives — no padded specifications.",
  },
  {
    icon: Users,
    title: "People first",
    body: "Support answers within a working day, and returns need no explanation.",
  },
  {
    icon: Heart,
    title: "Built to last",
    body: "We stock fewer things, chosen because they hold up over time.",
  },
];

const About = () => (
  <>
    <section className="border-b border-line-subtle bg-surface">
      <Container className="max-w-3xl py-16 text-center">
        <p className="type-overline mb-3 text-accent-text">Our story</p>
        <h1 className="type-display text-[2.25rem] leading-tight text-content sm:text-[3rem]">
          A shop that keeps its promises.
        </h1>
        <p className="type-description mx-auto mt-4 max-w-[58ch] text-[1rem]">
          Planet started with a simple frustration: online shops that describe products
          generously and deliver something else. We stock a smaller catalogue so we can stand
          behind every item in it.
        </p>
        <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-8" iconRight={ArrowRight}>
          See what we stock
        </Button>
      </Container>
    </section>

    <Container className="py-section">
      <SectionHeading
        eyebrow="What we hold ourselves to"
        title="Four things we do not compromise on"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-lg border border-line-subtle bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent-text">
              <value.icon size={19} />
            </span>
            <h3 className="type-card-title text-content">{value.title}</h3>
            <p className="type-description mt-1.5">{value.body}</p>
          </div>
        ))}
      </div>
    </Container>

    <Container className="pb-section">
      <div className="grid gap-6 rounded-xl border border-line-subtle bg-surface p-8 sm:grid-cols-3">
        {[
          { value: "2019", label: "Founded" },
          { value: "120+", label: "Cities delivered to" },
          { value: "4.6/5", label: "Average product rating" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="type-numeric text-[2rem] font-semibold text-content">{stat.value}</p>
            <p className="type-caption mt-1 text-content-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </Container>
  </>
);

export default About;
