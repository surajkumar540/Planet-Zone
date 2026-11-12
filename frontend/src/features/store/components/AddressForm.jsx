import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Check, Home, Loader2, MapPin, Phone, User } from "lucide-react";

import Button from "../../../components/ui/Button";
import { Checkbox, Input, Select } from "../../../components/ui/Field";
import { INDIA_STATE_OPTIONS, normaliseState } from "../../../lib/indiaStates";
import cn from "../../../lib/cn";

/**
 * Delivery address form, shared by checkout and the profile page.
 *
 * Built to be filled in quickly and correctly:
 * - the PIN code is asked early and fills in city and state by itself
 *   (India Post's public lookup), so most people type only street and name;
 * - phone and PIN are checked as you go, with a plain-language message,
 *   rather than failing on the server after submit;
 * - a Home / Work / Other tag makes saved addresses easy to tell apart.
 */

const EMPTY = {
  label: "home",
  fullName: "",
  phoneNo: "",
  pinCode: "",
  address: "",
  landMark: "",
  city: "",
  state: "",
  isDefault: false,
};

const LABELS = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];

/** Keeps the last 10 digits, so "+91 98765-43210" and "098765 43210" both work. */
const cleanPhone = (value) => value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

const validate = (form) => {
  const errors = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter the recipient's full name";
  if (!/^[6-9]\d{9}$/.test(cleanPhone(form.phoneNo))) {
    errors.phoneNo = "Enter a 10-digit mobile number";
  }
  if (!/^[1-9]\d{5}$/.test(form.pinCode)) errors.pinCode = "PIN codes have 6 digits";
  if (form.address.trim().length < 5) errors.address = "Add the house number and street";
  if (!form.city.trim()) errors.city = "Enter the city";
  if (!form.state) errors.state = "Choose the state";
  return errors;
};

/** Looks up a PIN with India Post. Resolves to null when unknown or unreachable. */
const lookupPin = async (pin, signal) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
    const [result] = await response.json();
    const office = result?.Status === "Success" ? result.PostOffice?.[0] : null;
    return office ? { city: office.District, state: normaliseState(office.State) } : null;
  } catch {
    return null;
  }
};

const AddressForm = ({
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save address",
  showDefaultToggle = false,
  initialValue,
  className,
}) => {
  const [form, setForm] = useState({ ...EMPTY, ...initialValue });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [pinStatus, setPinStatus] = useState("idle"); // idle | looking | found | unknown
  const lookup = useRef(null);

  // Live checks only for fields the customer has already left, so nothing
  // turns red while they are still typing it for the first time.
  useEffect(() => {
    const all = validate(form);
    setErrors(Object.fromEntries(Object.entries(all).filter(([key]) => touched[key])));
  }, [form, touched]);

  // A complete PIN fills city and state in the background.
  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(form.pinCode)) {
      setPinStatus("idle");
      return undefined;
    }
    lookup.current?.abort();
    const controller = new AbortController();
    lookup.current = controller;
    setPinStatus("looking");

    lookupPin(form.pinCode, controller.signal).then((place) => {
      if (controller.signal.aborted) return;
      if (!place) {
        setPinStatus("unknown");
        return;
      }
      setPinStatus("found");
      setForm((current) => ({ ...current, city: place.city, state: place.state }));
    });
    return () => controller.abort();
  }, [form.pinCode]);

  const set = (key) => (event) => {
    let value = event.target.value;
    if (key === "pinCode") value = value.replace(/\D/g, "").slice(0, 6);
    if (key === "phoneNo") value = value.replace(/[^\d+\s-]/g, "").slice(0, 16);
    setForm((current) => ({ ...current, [key]: value }));
  };
  const blur = (key) => () => setTouched((current) => ({ ...current, [key]: true }));

  const submit = (event) => {
    event.preventDefault();
    const all = validate(form);
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((key) => [key, true])));
    if (Object.keys(all).length) {
      // Focus the first problem so keyboard and screen-reader users land on it.
      const first = event.currentTarget.querySelector(`[name="${Object.keys(all)[0]}"]`);
      first?.focus();
      return;
    }
    onSubmit({
      ...form,
      fullName: form.fullName.trim(),
      address: form.address.trim(),
      landMark: form.landMark.trim(),
      city: form.city.trim(),
      phoneNo: cleanPhone(form.phoneNo),
    });
  };

  const stateOptions = INDIA_STATE_OPTIONS.some((option) => option.value === form.state) || !form.state
    ? INDIA_STATE_OPTIONS
    : [...INDIA_STATE_OPTIONS, { value: form.state, label: form.state }];

  return (
    <motion.form
      noValidate
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("space-y-4", className)}
    >
      {/* Address type */}
      <div>
        <p className="type-label mb-1.5 text-content-secondary">Save as</p>
        <div className="flex gap-2" role="radiogroup" aria-label="Address type">
          {LABELS.map((option) => {
            const selected = form.label === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm((current) => ({ ...current, label: option.value }))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 type-button transition-all",
                  selected
                    ? "border-accent bg-accent-subtle text-accent-text shadow-xs"
                    : "border-line text-content-secondary hover:border-line-strong hover:text-content"
                )}
              >
                <option.icon size={14} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Contact</legend>
        <Input
          name="fullName"
          label="Full name"
          icon={User}
          required
          autoComplete="name"
          placeholder="Who should receive it?"
          value={form.fullName}
          onChange={set("fullName")}
          onBlur={blur("fullName")}
          error={errors.fullName}
        />
        <Input
          name="phoneNo"
          label="Mobile number"
          icon={Phone}
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={form.phoneNo}
          onChange={set("phoneNo")}
          onBlur={blur("phoneNo")}
          error={errors.phoneNo}
          hint="For delivery updates only"
        />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <legend className="sr-only">Address</legend>
        <Input
          name="pinCode"
          label="PIN code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="560001"
          value={form.pinCode}
          onChange={set("pinCode")}
          onBlur={blur("pinCode")}
          error={errors.pinCode}
          trailing={
            pinStatus === "looking" ? (
              <Loader2 size={15} className="animate-spin text-content-muted" />
            ) : pinStatus === "found" ? (
              <Check size={15} className="text-status-good" />
            ) : null
          }
        />
        <Input
          name="address"
          label="House, building, street"
          required
          autoComplete="street-address"
          placeholder="Flat 4B, Green Residency, MG Road"
          value={form.address}
          onChange={set("address")}
          onBlur={blur("address")}
          error={errors.address}
        />
      </fieldset>

      <p
        className={cn(
          "-mt-1 type-caption",
          pinStatus === "found" ? "text-status-good" : "text-content-muted"
        )}
        aria-live="polite"
      >
        {pinStatus === "looking" && "Finding your city…"}
        {pinStatus === "found" && `Found ${form.city}, ${form.state}. You can still edit them.`}
        {pinStatus === "unknown" && "We couldn't find that PIN, so please fill in city and state."}
        {pinStatus === "idle" && "Enter your PIN and we'll fill in the city and state."}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          name="city"
          label="City"
          required
          autoComplete="address-level2"
          value={form.city}
          onChange={set("city")}
          onBlur={blur("city")}
          error={errors.city}
        />
        <Select
          name="state"
          label="State"
          required
          placeholder="Choose state"
          options={stateOptions}
          value={form.state}
          onChange={(event) => {
            setForm((current) => ({ ...current, state: event.target.value }));
            setTouched((current) => ({ ...current, state: true }));
          }}
          error={errors.state}
        />
        <Input
          name="landMark"
          label="Landmark"
          hint="Optional"
          placeholder="Near City Park"
          value={form.landMark}
          onChange={set("landMark")}
        />
      </div>

      {showDefaultToggle && (
        <Checkbox
          checked={form.isDefault}
          onChange={(checked) => setForm((current) => ({ ...current, isDefault: checked }))}
          label="Use as my default address"
        />
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" variant="primary" loading={loading} icon={Check}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  );
};

export default AddressForm;
