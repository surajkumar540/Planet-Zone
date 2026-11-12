import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Check,
  Heart,
  Home,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-react";

import { changeAccountPassword, getProfile, setProfile } from "../../../api/userApi";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "../../../api/storeApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { getErrorMessage } from "../../../lib/apiError";
import { useI18n } from "../../../lib/i18n";
import { formatDate } from "../../../lib/format";
import Button from "../../../components/ui/Button";
import { Input, PasswordInput } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { Doodle } from "../../../components/ui/Doodles";
import { setProfile as setProfileAction } from "../../../redux/reducers/userSlice";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";
import AddressForm from "../components/AddressForm";
import { useWishlistToggle } from "../hooks/useWishlist";

const TABS = [
  { value: "details", label: "Personal details", icon: User },
  { value: "addresses", label: "Addresses", icon: MapPin },
  { value: "security", label: "Security", icon: Lock },
];

const LABEL_ICONS = { home: Home, work: Briefcase, other: MapPin };

const Profile = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState("details");
  const profile = useApi(getProfile, null);
  const { items: wishlist } = useWishlistToggle();
  const user = profile.data;

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <Container className="py-8">
      {/* ------------------------------- Identity card ------------------------------ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-3xl border border-line-subtle bg-surface p-6 shadow-sm sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(36rem 14rem at 100% 0%, color-mix(in srgb, var(--brand-leaf-from) 16%, transparent), transparent 70%)" }}
        />
        <Doodle type="leaf" size={60} float className="absolute right-8 top-6 hidden text-accent-text opacity-25 sm:block" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.loading && !user ? (
            <Skeleton className="h-20 w-20 rounded-full" />
          ) : (
            <motion.span
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[1.75rem] font-semibold text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--brand-leaf-to), var(--brand-leaf-from))" }}
            >
              {initials}
            </motion.span>
          )}

          <div className="min-w-0 flex-1">
            <p className="type-overline text-accent-text">{t("Your account")}</p>
            <h1 className="font-display mt-1 truncate text-[1.875rem] font-semibold leading-tight tracking-tight text-content">
              {user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : " "}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 type-caption text-content-secondary">
              {user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={13} /> {user.email}
                </span>
              )}
              {user?.emailVerify && (
                <span className="inline-flex items-center gap-1 rounded-full bg-status-good-bg px-2 py-0.5 font-semibold text-status-good">
                  <BadgeCheck size={12} /> {t("Verified email")}
                </span>
              )}
              {user?.createdAt && <span>· {t("Member since {date}", { date: formatDate(user.createdAt) })}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-64">
            <Link to="/orders" className="group rounded-2xl border border-line-subtle bg-surface-sunken p-3 transition-colors hover:border-accent">
              <Package size={17} className="text-accent-text transition-transform group-hover:-rotate-6" />
              <p className="mt-1.5 text-[0.875rem] font-semibold text-content">{t("Orders")}</p>
            </Link>
            <Link to="/wishlist" className="group rounded-2xl border border-line-subtle bg-surface-sunken p-3 transition-colors hover:border-accent">
              <Heart size={17} className="text-status-critical transition-transform group-hover:scale-110" />
              <p className="mt-1.5 text-[0.875rem] font-semibold text-content">
                {t("Wishlist")} <span className="type-numeric text-content-muted">{wishlist.length}</span>
              </p>
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* ------------------------------------ Nav ------------------------------------ */}
        <LayoutGroup id="profile-tabs">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-line-subtle bg-surface p-1.5 lg:h-fit lg:flex-col" aria-label="Account sections">
            {TABS.map((item) => {
              const selected = item.value === tab;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[0.875rem] font-semibold transition-colors",
                    selected ? "text-accent-on" : "text-content-secondary hover:bg-surface-hover hover:text-content"
                  )}
                >
                  {selected && (
                    <motion.span layoutId="profile-tab" className="absolute inset-0 rounded-xl bg-accent shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <item.icon size={16} className="relative" />
                  <span className="relative">{t(item.label)}</span>
                </button>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* ---------------------------------- Content ---------------------------------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "details" && <DetailsTab profile={profile} />}
            {tab === "addresses" && <AddressesTab />}
            {tab === "security" && <SecurityTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Container>
  );
};

/* ---------------------------------- Details --------------------------------- */

const Panel = ({ icon: Icon, title, description, children, action }) => (
  <section className="rounded-2xl border border-line-subtle bg-surface p-5 shadow-xs sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-[1.0625rem] font-semibold text-content">{title}</h2>
          {description && <p className="type-caption mt-0.5 text-content-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const DetailsTab = ({ profile }) => {
  const { t } = useI18n();
  const toast = useToast();
  const dispatch = useDispatch();
  const save = useMutation(setProfile);
  const user = profile.data;

  const initial = useMemo(
    () => ({ firstName: user?.firstName || "", lastName: user?.lastName || "", phone: user?.phone || "" }),
    [user]
  );
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  // The form mirrors the server copy until the customer edits it.
  useEffect(() => setForm(initial), [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const phoneDigits = form.phone.replace(/\D/g, "");
  const phoneError = form.phone && !/^(91)?[6-9]\d{9}$/.test(phoneDigits) ? "Enter a 10-digit mobile number" : undefined;

  const submit = async (event) => {
    event.preventDefault();
    if (phoneError || !form.firstName.trim()) return;
    try {
      const response = await save.mutate({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      // Keep the header's greeting in step with what was just saved.
      dispatch(setProfileAction(response?.data || {}));
      toast.success("Profile updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      profile.refetch();
    } catch (error) {
      toast.error("Not saved", getErrorMessage(error, "Could not save your details"));
    }
  };

  if (profile.loading && !user) return <Skeleton className="h-72 w-full rounded-2xl" />;

  return (
    <Panel icon={User} title={t("Personal details")} description="This is how we'll greet you and reach you about orders.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("First name")}
            icon={User}
            required
            autoComplete="given-name"
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
          />
          <Input
            label={t("Last name")}
            autoComplete="family-name"
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
          />
          <Input
            label={t("Mobile number")}
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={form.phone}
            error={phoneError}
            onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/[^\d+\s-]/g, "").slice(0, 16) })}
          />
          <Input label={t("Email")} icon={Mail} value={user?.email || ""} disabled hint={t("Email can't be changed")} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line-subtle pt-4">
          <Button type="submit" variant="primary" loading={save.loading} disabled={!dirty || Boolean(phoneError)} icon={saved ? Check : undefined}>
            {saved ? "Saved" : t("Save changes")}
          </Button>
          {dirty && (
            <>
              <Button variant="ghost" onClick={() => setForm(initial)}>
                Discard
              </Button>
              <span className="inline-flex items-center gap-1.5 type-caption text-status-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-status-warning" /> Unsaved changes
              </span>
            </>
          )}
        </div>
      </form>
    </Panel>
  );
};

/* --------------------------------- Addresses -------------------------------- */

const AddressesTab = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { data: addresses, loading, refetch } = useApi(getAddresses, null);
  const create = useMutation(createAddress);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);

  const submit = async (value) => {
    try {
      await create.mutate(value);
      toast.success("Address added");
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Not saved", getErrorMessage(error, "Could not save that address"));
    }
  };

  const run = async (id, work, message) => {
    setBusy(id);
    try {
      await work();
      toast.success(message);
      refetch();
    } catch (error) {
      toast.error("Something went wrong", getErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const makeDefault = (entry) =>
    run(
      entry._id,
      () => updateAddress(entry._id, { ...entry.shippingAddress, label: entry.label, isDefault: true }),
      "Default address updated"
    );

  if (loading) return <Skeleton className="h-56 w-full rounded-2xl" />;
  const list = addresses || [];

  return (
    <Panel
      icon={MapPin}
      title={t("Saved addresses")}
      description="Pick a default and checkout will use it automatically."
      action={
        !open && list.length > 0 ? (
          <Button size="sm" variant="primary" icon={Plus} onClick={() => setOpen(true)}>
            {t("Add an address")}
          </Button>
        ) : null
      }
    >
      {list.length === 0 && !open && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
          <div className="relative">
            <Doodle type="circle" size={76} className="text-accent-text opacity-40" />
            <MapPin size={26} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-text" />
          </div>
          <p className="mt-3 text-[1rem] font-semibold text-content">{t("No addresses yet")}</p>
          <p className="mt-1 type-caption text-content-muted">{t("Save one now and checkout will be one tap faster.")}</p>
          <Button variant="primary" icon={Plus} className="mt-4" onClick={() => setOpen(true)}>
            {t("Add an address")}
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {list.map((entry) => {
            const LabelIcon = LABEL_ICONS[entry.label] || MapPin;
            return (
              <motion.div
                layout
                key={entry._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative rounded-2xl border p-4 transition-colors",
                  entry.isDefault ? "border-accent bg-accent-subtle" : "border-line-subtle bg-surface hover:border-line"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[0.75rem] font-semibold capitalize text-content-secondary ring-1 ring-line">
                    <LabelIcon size={12} /> {entry.label || "home"}
                  </span>
                  {entry.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] font-bold text-accent-on">
                      <Star size={11} className="fill-current" /> {t("Default")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[0.9375rem] font-semibold text-content">{entry.shippingAddress.fullName}</p>
                <p className="mt-0.5 type-body text-content-secondary">
                  {entry.shippingAddress.address}
                  {entry.shippingAddress.landMark ? `, ${entry.shippingAddress.landMark}` : ""}, {entry.shippingAddress.city},{" "}
                  {entry.shippingAddress.state} – {entry.shippingAddress.pinCode}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 type-caption type-numeric text-content-muted">
                  <Phone size={12} /> {entry.shippingAddress.phoneNo}
                </p>
                <div className="mt-3 flex gap-1 border-t border-line-subtle pt-2.5">
                  {!entry.isDefault && (
                    <Button variant="ghost" size="sm" icon={Star} loading={busy === entry._id} onClick={() => makeDefault(entry)}>
                      Make default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="ml-auto hover:text-status-critical"
                    onClick={() => run(entry._id, () => deleteAddress(entry._id), "Address removed")}
                  >
                    {t("Remove")}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-line-subtle bg-surface-sunken p-5">
              <h3 className="mb-4 text-[0.9375rem] font-semibold text-content">{t("New address")}</h3>
              <AddressForm
                onSubmit={submit}
                loading={create.loading}
                showDefaultToggle
                initialValue={{ isDefault: list.length === 0 }}
                onCancel={() => setOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
};

/* --------------------------------- Security --------------------------------- */

const strengthOf = (value) =>
  [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;

const STRENGTH = [
  { label: "Too short", tone: "bg-status-critical" },
  { label: "Weak", tone: "bg-status-critical" },
  { label: "Fair", tone: "bg-status-warning" },
  { label: "Good", tone: "bg-status-info" },
  { label: "Strong", tone: "bg-status-good" },
];

const SecurityTab = () => {
  const { t } = useI18n();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const change = useMutation(changeAccountPassword);

  const score = strengthOf(form.newPassword);
  const mismatch = form.confirm && form.confirm !== form.newPassword ? "The two passwords don't match" : undefined;

  const submit = async (event) => {
    event.preventDefault();
    if (mismatch) return;
    try {
      // The endpoint validates the confirmation itself, so all three fields go.
      await change.mutate({
        currentPassword: form.currentPassword,
        password: form.newPassword,
        confirmPassword: form.confirm,
      });
      toast.success("Password updated", "Use your new password next time you sign in.");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      toast.error("Not updated", getErrorMessage(error, "Could not update your password"));
    }
  };

  return (
    <Panel icon={ShieldCheck} title={t("Change password")} description="Use at least 8 characters. A mix of letters, numbers and symbols is strongest.">
      <form onSubmit={submit} className="max-w-md space-y-4">
        <PasswordInput
          label={t("Current password")}
          icon={KeyRound}
          required
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
        />
        <div>
          <PasswordInput
            label={t("New password")}
            icon={Lock}
            required
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          />
          {form.newPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className={cn("h-1 flex-1 rounded-full transition-colors", index < score ? STRENGTH[score].tone : "bg-line")} />
                ))}
              </div>
              <span className="type-caption font-medium text-content-secondary">{STRENGTH[score].label}</span>
            </div>
          )}
        </div>
        <PasswordInput
          label={t("Confirm new password")}
          icon={Lock}
          required
          autoComplete="new-password"
          error={mismatch}
          value={form.confirm}
          onChange={(event) => setForm({ ...form, confirm: event.target.value })}
        />
        <Button type="submit" variant="primary" loading={change.loading} disabled={Boolean(mismatch) || form.newPassword.length < 8}>
          {t("Update password")}
        </Button>
      </form>
    </Panel>
  );
};

export default Profile;
