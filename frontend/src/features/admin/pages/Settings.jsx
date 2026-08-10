import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Monitor, Moon, Palette, RotateCcw, Store, Sun, Truck, User } from "lucide-react";
import { getSettings, updateSettings } from "../../../api/adminApi";
import { getProfile, setProfile } from "../../../api/userApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { useTheme } from "../../../theme/ThemeProvider";
import { ACCENT_PRESETS, DENSITIES, FONT_SIZES } from "../../../theme/presets";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tabs from "../../../components/ui/Tabs";
import { Input, Switch } from "../../../components/ui/Field";
import { SkeletonText } from "../../../components/ui/Skeleton";
import cn from "../../../lib/cn";

/* ------------------------------- Appearance -------------------------------- */

const MODE_CARDS = [
  { value: "light", label: "Light", icon: Sun, description: "Bright surfaces" },
  { value: "dark", label: "Dark", icon: Moon, description: "Low-light surfaces" },
  { value: "system", label: "System", icon: Monitor, description: "Follow your device" },
];

/** A selectable card, used for every appearance choice so they read as one set. */
const OptionCard = ({ selected, onClick, className, children, label }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    aria-label={label}
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all",
      selected
        ? "border-[var(--accent-solid)] bg-accent-subtle"
        : "border-line hover:border-line-strong bg-surface",
      className
    )}
  >
    {selected && (
      <span
        className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-accent-on grid place-items-center"
        aria-hidden="true"
      >
        <Check size={11} strokeWidth={3} />
      </span>
    )}
    {children}
  </button>
);

/**
 * Appearance controls.
 *
 * Changes apply immediately to the live interface rather than on save — the
 * whole point is to see the result, so a preview pane would be a worse version
 * of the page you are already looking at.
 */
const AppearanceSettings = () => {
  const { appearance, setThemeMode, setAccentColor, setFontSize, setDensity, reset } = useTheme();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Theme"
          description="Choose how the interface looks. Changes apply instantly."
        />
        <CardBody>
          <div role="radiogroup" aria-label="Theme mode" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODE_CARDS.map((mode) => (
              <OptionCard
                key={mode.value}
                label={`${mode.label} theme`}
                selected={appearance.themeMode === mode.value}
                onClick={() => setThemeMode(mode.value)}
              >
                <mode.icon
                  size={18}
                  className={cn(
                    appearance.themeMode === mode.value ? "text-accent-text" : "text-content-muted"
                  )}
                  aria-hidden="true"
                />
                <span className="type-body-strong text-content">{mode.label}</span>
                <span className="type-caption">{mode.description}</span>
              </OptionCard>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Accent colour" description="Used for buttons, links and highlights." />
        <CardBody>
          <div
            role="radiogroup"
            aria-label="Accent colour"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {ACCENT_PRESETS.map((preset) => (
              <OptionCard
                key={preset.id}
                label={preset.name}
                selected={appearance.accentColor === preset.id}
                onClick={() => setAccentColor(preset.id)}
                className="items-center"
              >
                <span
                  className="w-8 h-8 rounded-full shadow-sm self-center"
                  style={{ backgroundColor: preset.swatch }}
                  aria-hidden="true"
                />
                <span className="type-caption text-content font-medium self-center">
                  {preset.name}
                </span>
              </OptionCard>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Text size" description="Scales the entire interface." />
          <CardBody>
            <div role="radiogroup" aria-label="Text size" className="grid grid-cols-3 gap-3">
              {Object.keys(FONT_SIZES).map((size) => (
                <OptionCard
                  key={size}
                  label={`${size} text`}
                  selected={appearance.fontSize === size}
                  onClick={() => setFontSize(size)}
                  className="items-center"
                >
                  <span
                    className="text-content font-semibold self-center"
                    style={{ fontSize: `${FONT_SIZES[size]}px` }}
                    aria-hidden="true"
                  >
                    Aa
                  </span>
                  <span className="type-caption self-center capitalize">
                    {size === "sm" ? "Small" : size === "md" ? "Default" : "Large"}
                  </span>
                </OptionCard>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Density" description="How much breathing room rows and controls get." />
          <CardBody>
            <div role="radiogroup" aria-label="Density" className="grid grid-cols-3 gap-3">
              {Object.keys(DENSITIES).map((density) => (
                <OptionCard
                  key={density}
                  label={`${density} density`}
                  selected={appearance.density === density}
                  onClick={() => setDensity(density)}
                  className="items-center"
                >
                  <span className="flex flex-col gap-0.5 self-center py-1" aria-hidden="true">
                    {[0, 1, 2].map((line) => (
                      <span
                        key={line}
                        className="w-7 h-1 rounded-full bg-content-muted"
                        style={{ marginBottom: `${DENSITIES[density] * 2}px` }}
                      />
                    ))}
                  </span>
                  <span className="type-caption self-center capitalize">{density}</span>
                </OptionCard>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="type-body-strong text-content">Reset appearance</p>
            <p className="type-caption">Restore the default theme, colour, size and density.</p>
          </div>
          <Button variant="secondary" icon={RotateCcw} onClick={reset}>
            Reset to defaults
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

/* ---------------------------------- Store ---------------------------------- */

const StoreSettings = () => {
  const toast = useToast();
  const { data, loading, refetch } = useApi(getSettings, null);
  const { mutate: save, loading: saving } = useMutation(updateSettings);
  const [form, setForm] = useState(null);

  // Seed the form once the settings arrive, then leave it under user control.
  useEffect(() => {
    if (data && !form) {
      setForm({
        store: { ...data.store },
        orders: { ...data.orders },
        inventory: { ...data.inventory },
      });
    }
  }, [data, form]);

  if (loading || !form) {
    return (
      <Card>
        <CardBody>
          <SkeletonText lines={8} />
        </CardBody>
      </Card>
    );
  }

  const setSection = (section, field) => (value) =>
    setForm((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));

  const handleSave = async () => {
    try {
      await save(form);
      toast.success("Settings saved");
      refetch();
    } catch (caught) {
      toast.error("Could not save settings", caught?.response?.data?.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Store details" description="Shown to customers across the storefront." />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Store name"
            value={form.store.name || ""}
            onChange={(event) => setSection("store", "name")(event.target.value)}
          />
          <Input
            label="Tagline"
            value={form.store.tagline || ""}
            onChange={(event) => setSection("store", "tagline")(event.target.value)}
          />
          <Input
            label="Support email"
            type="email"
            value={form.store.email || ""}
            onChange={(event) => setSection("store", "email")(event.target.value)}
          />
          <Input
            label="Support phone"
            value={form.store.phone || ""}
            onChange={(event) => setSection("store", "phone")(event.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Checkout" description="How orders can be paid for and cancelled." />
        <CardBody className="space-y-4">
          <Switch
            label="Cash on delivery"
            description="Let customers pay when the order arrives"
            checked={form.orders.allowCashOnDelivery}
            onChange={setSection("orders", "allowCashOnDelivery")}
          />
          <Switch
            label="Online payment"
            description="Accept card and UPI payments at checkout"
            checked={form.orders.allowOnlinePayment}
            onChange={setSection("orders", "allowOnlinePayment")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Minimum order value"
              type="number"
              min="0"
              suffix="₹"
              value={form.orders.minOrderAmount ?? 0}
              onChange={(event) => setSection("orders", "minOrderAmount")(Number(event.target.value))}
            />
            <Input
              label="Cancellation window"
              type="number"
              min="0"
              suffix="hrs"
              value={form.orders.cancellationWindowHours ?? 24}
              onChange={(event) =>
                setSection("orders", "cancellationWindowHours")(Number(event.target.value))
              }
              hint="How long customers may cancel after ordering"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Inventory" description="How stock is tracked and displayed." />
        <CardBody className="space-y-4">
          <Switch
            label="Track inventory"
            description="Reserve stock at checkout and block overselling"
            checked={form.inventory.trackInventory}
            onChange={setSection("inventory", "trackInventory")}
          />
          <Switch
            label="Hide out-of-stock products"
            description="Remove them from the storefront instead of showing them unavailable"
            checked={form.inventory.hideOutOfStockProducts}
            onChange={setSection("inventory", "hideOutOfStockProducts")}
          />
          <Input
            label="Low stock threshold"
            type="number"
            min="0"
            className="sm:max-w-[220px]"
            value={form.inventory.lowStockThreshold ?? 5}
            onChange={(event) =>
              setSection("inventory", "lowStockThreshold")(Number(event.target.value))
            }
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------- Profile --------------------------------- */

const ProfileSettings = () => {
  const toast = useToast();
  const { data, loading, refetch } = useApi(getProfile, null);
  const { mutate: save, loading: saving } = useMutation(setProfile);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (data && !form) {
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
      });
    }
  }, [data, form]);

  if (loading || !form) {
    return (
      <Card>
        <CardBody>
          <SkeletonText lines={5} />
        </CardBody>
      </Card>
    );
  }

  const handleSave = async () => {
    try {
      await save(form);
      toast.success("Profile updated");
      refetch();
    } catch (caught) {
      toast.error("Could not update profile", caught?.response?.data?.message);
    }
  };

  return (
    <Card>
      <CardHeader title="Your profile" description={data?.email} />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
          />
        </div>
        <Input
          label="Phone"
          className="sm:max-w-xs"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save profile
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

/* ---------------------------------- Page ----------------------------------- */

const TABS = [
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "store", label: "Store", icon: Store },
  { value: "profile", label: "Profile", icon: User },
];

const Settings = () => {
  // The tab lives in the URL so a link can point straight at a section.
  const [searchParams, setSearchParams] = useSearchParams();
  const active = TABS.some((tab) => tab.value === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "appearance";

  return (
    <div className="space-y-section">
      <PageHeader title="Settings" description="Configure your store and workspace." />

      <Tabs
        tabs={TABS}
        value={active}
        onChange={(value) => setSearchParams({ tab: value }, { replace: true })}
      />

      {active === "appearance" && <AppearanceSettings />}
      {active === "store" && <StoreSettings />}
      {active === "profile" && <ProfileSettings />}
    </div>
  );
};

export default Settings;
