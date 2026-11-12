import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageSquareText, Package, Phone, RotateCcw, Send, Sparkles } from "lucide-react";

import { contactUsApi } from "../../../api/contactApi";
import { useMutation } from "../../../hooks/useApi";
import { getErrorMessage } from "../../../lib/apiError";
import Button from "../../../components/ui/Button";
import { Input, Textarea } from "../../../components/ui/Field";
import { useToast } from "../../../components/ui/Toast";
import { Doodle, Reveal } from "../../../components/ui/Doodles";
import cn from "../../../lib/cn";
import { useSession } from "../hooks/useStorefront";
import { Container } from "../components/Primitives";

const CHANNELS = [
  { icon: Mail, label: "Email us", value: "support@planet.store", href: "mailto:support@planet.store" },
  { icon: Phone, label: "Call us", value: "1800 000 000", href: "tel:+911800000000" },
  { icon: MapPin, label: "Visit us", value: "Indiranagar, Bengaluru 560038" },
];

const TOPICS = [
  { value: "Order", icon: Package },
  { value: "Product", icon: Sparkles },
  { value: "Return or refund", icon: RotateCcw },
  { value: "Something else", icon: MessageSquareText },
];

const MAX_MESSAGE = 2000;

/** Whether support is open right now: Monday–Saturday, 9am–7pm India time. */
const useSupportHours = () =>
  useMemo(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = now.getDay();
    const hour = now.getHours();
    return day !== 0 && hour >= 9 && hour < 19;
  }, []);

/** An envelope that folds into a paper plane and flies off, drawn with doodles. */
const SentAnimation = () => (
  <div className="relative mx-auto h-28 w-40" aria-hidden="true">
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{ x: [0, 10, 120], y: [0, -10, -80], rotate: [0, -10, -25], scale: [1, 1, 0.6] }}
      transition={{ duration: 1.4, times: [0, 0.3, 1], ease: "easeIn" }}
      className="absolute left-12 top-8 text-accent-text"
    >
      <Doodle type="plane" size={56} strokeWidth={1.8} />
    </motion.div>
    <motion.svg
      viewBox="0 0 160 112"
      className="absolute inset-0 text-accent-text opacity-50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeDasharray="4 6"
      strokeLinecap="round"
    >
      <motion.path
        d="M20 96 C50 90 70 70 92 50 S130 20 150 10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, delay: 0.2 }}
      />
    </motion.svg>
  </div>
);

const Contact = () => {
  const toast = useToast();
  const { user } = useSession();
  const isOpen = useSupportHours();

  const blank = {
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: user?.email || "",
    city: "",
    message: "",
  };
  const [form, setForm] = useState(blank);
  const [topic, setTopic] = useState(TOPICS[0].value);
  const [sent, setSent] = useState(false);

  const send = useMutation(contactUsApi);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await send.mutate({
        ...form,
        // The API stores one message; the topic leads it so staff can triage at a glance.
        message: `[${topic}] ${form.message.trim()}`,
      });
      setSent(true);
    } catch (error) {
      toast.error("Message not sent", getErrorMessage(error, "Please try again in a moment."));
    }
  };

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  return (
    <>
      {/* --------------------------------- Header -------------------------------- */}
      <section className="relative overflow-hidden border-b border-line-subtle bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 18rem at 80% 0%, color-mix(in srgb, var(--brand-leaf-from) 14%, transparent), transparent 70%)",
          }}
        />
        <Container className="relative grid items-center gap-6 py-12 md:grid-cols-[1fr_auto] md:py-16">
          <Reveal>
            <p className="type-overline text-accent-text">We&apos;re here to help</p>
            <h1 className="font-display mt-2 text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-content sm:text-[3rem]">
              Let&apos;s talk.
            </h1>
            <p className="type-description mt-3 max-w-[50ch] text-[1rem]">
              A question about an order, a product or a return? Write to us and a real person
              will reply, usually within one working day.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-sunken px-3 py-1.5 type-caption text-content-secondary">
              <span className="relative flex h-2.5 w-2.5">
                {isOpen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good opacity-60" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                    isOpen ? "bg-status-good" : "bg-content-disabled"
                  )}
                />
              </span>
              {isOpen ? "Support is online now" : "We're offline. Leave a message and we'll reply tomorrow."}
            </p>
          </Reveal>

          {/* Doodle illustration: an envelope surrounded by drawn leaves and sparkles. */}
          <div className="relative hidden h-48 w-64 md:block" aria-hidden="true">
            <Doodle type="envelope" size={120} strokeWidth={1.2} className="absolute left-14 top-10 text-accent-text" />
            <Doodle type="leaf" size={46} float delay={0.4} className="absolute left-2 top-4 text-accent-text opacity-70" />
            <Doodle type="sparkle" size={28} float delay={0.8} className="absolute right-6 top-0 text-status-warning" />
            <Doodle type="heart" size={30} float delay={1.1} className="absolute bottom-2 right-10 text-status-critical opacity-80" />
            <Doodle type="squiggle" size={60} delay={0.6} className="absolute bottom-0 left-0 text-content-muted opacity-60" />
          </div>
        </Container>
      </section>

      <Container className="py-section">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* ---------------------------------- Form --------------------------------- */}
          <Reveal className="relative overflow-hidden rounded-2xl border border-line-subtle bg-surface p-5 shadow-sm sm:p-7">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <SentAnimation />
                  <h2 className="font-display mt-2 text-[1.75rem] font-semibold text-content">
                    Message sent!
                  </h2>
                  <p className="type-description mt-2 max-w-[40ch]">
                    Thanks for writing in. We&apos;ll reply to{" "}
                    <span className="font-medium text-content">{form.email}</span> soon.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => {
                      setForm({ ...blank, name: form.name, email: form.email });
                      setSent(false);
                    }}
                  >
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  onSubmit={submit}
                  className="space-y-4"
                >
                  <div>
                    <p className="type-label mb-2 text-content-secondary">What is it about?</p>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
                      {TOPICS.map((option) => {
                        const selected = topic === option.value;
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTopic(option.value)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                              selected
                                ? "border-accent bg-accent text-accent-on shadow-sm"
                                : "border-line text-content-secondary hover:border-line-strong hover:text-content"
                            )}
                          >
                            <option.icon size={14} />
                            {option.value}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Your name" required autoComplete="name" value={form.name} onChange={set("name")} />
                    <Input
                      label="Email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                    />
                  </div>
                  <Input
                    label="City"
                    required
                    autoComplete="address-level2"
                    placeholder="Bengaluru"
                    value={form.city}
                    onChange={set("city")}
                  />
                  <div>
                    <Textarea
                      label="Message"
                      required
                      rows={5}
                      maxLength={MAX_MESSAGE}
                      placeholder={
                        topic === "Order"
                          ? "Your order number and what went wrong helps us fix it faster."
                          : "Tell us what you need help with."
                      }
                      value={form.message}
                      onChange={set("message")}
                    />
                    <p className="mt-1 text-right type-caption type-numeric text-content-muted">
                      {form.message.length}/{MAX_MESSAGE}
                    </p>
                  </div>

                  <Button type="submit" variant="primary" size="lg" icon={Send} loading={send.loading}>
                    Send message
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>

          {/* -------------------------------- Channels ------------------------------- */}
          <Reveal stagger={0.08} as="aside" className="space-y-3">
            {CHANNELS.map((channel) => {
              const body = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text transition-transform group-hover:-rotate-6 group-hover:scale-110">
                    <channel.icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block type-caption text-content-muted">{channel.label}</span>
                    <span className="block truncate text-[0.9375rem] font-semibold text-content">
                      {channel.value}
                    </span>
                  </span>
                </>
              );
              const className =
                "group flex items-center gap-3 rounded-2xl border border-line-subtle bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md";
              return (
                <Reveal.Item key={channel.label}>
                  {channel.href ? (
                    <a href={channel.href} className={className}>
                      {body}
                    </a>
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                </Reveal.Item>
              );
            })}
            <Reveal.Item className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface-sunken p-4">
              <Clock size={18} className="shrink-0 text-content-muted" />
              <p className="type-caption text-content-secondary">
                Mon–Sat, 9am to 7pm IST. Messages sent outside these hours are answered the next
                working day.
              </p>
            </Reveal.Item>
          </Reveal>
        </div>
      </Container>
    </>
  );
};

export default Contact;
