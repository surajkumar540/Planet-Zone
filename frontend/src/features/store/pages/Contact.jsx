import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

import { contactUsApi } from "../../../api/contactApi";
import { useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Input, Textarea } from "../../../components/ui/Field";
import { useToast } from "../../../components/ui/Toast";
import { useSession } from "../hooks/useStorefront";
import { Container } from "../components/Primitives";

const CHANNELS = [
  { icon: Mail, label: "Email", value: "support@planet.store", href: "mailto:support@planet.store" },
  { icon: Phone, label: "Phone", value: "1800 000 000", href: "tel:+911800000000" },
  { icon: MapPin, label: "Office", value: "Indiranagar, Bengaluru 560038" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 9am to 7pm IST" },
];

const Contact = () => {
  const toast = useToast();
  const { user } = useSession();

  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    message: "",
  });

  const send = useMutation(contactUsApi);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await send.mutate({
        ...form,
        // Fall back to the signed-in identity when the fields are left blank.
        name: form.name || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
        email: form.email || user?.email || "",
      });
      toast.success("Message sent", "We usually reply within one working day.");
      setForm({ name: "", email: "", city: "", message: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send your message");
    }
  };

  return (
    <Container className="py-section">
      <div className="mb-8 max-w-2xl">
        <h1 className="type-page-title text-content">Get in touch</h1>
        <p className="type-description mt-1">
          Questions about an order, a product or a return — write to us and a person will reply.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-line-subtle bg-surface p-6 sm:grid-cols-2"
        >
          <Input
            label="Your name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Message"
              required
              rows={6}
              placeholder="Tell us what you need help with"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" icon={Send} loading={send.loading}>
              Send message
            </Button>
          </div>
        </form>

        <aside className="space-y-3">
          {CHANNELS.map((channel) => (
            <div
              key={channel.label}
              className="flex gap-3 rounded-lg border border-line-subtle bg-surface p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent-text">
                <channel.icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="type-label text-content-muted">{channel.label}</p>
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="type-body text-content hover:text-accent-text"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className="type-body text-content">{channel.value}</p>
                )}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </Container>
  );
};

export default Contact;
