import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Lock, MapPin, Plus, Trash2, User } from "lucide-react";

import { getProfile, setProfile } from "../../../api/userApi";
import { createAddress, deleteAddress, getAddresses } from "../../../api/storeApi";
import axios from "../../../api/axios";
import { useApi, useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import Tabs from "../../../components/ui/Tabs";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { setProfile as setProfileAction } from "../../../redux/reducers/userSlice";
import { Container } from "../components/Primitives";

const TABS = [
  { value: "details", label: "Your details", icon: User },
  { value: "addresses", label: "Addresses", icon: MapPin },
  { value: "security", label: "Security", icon: Lock },
];

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
].map((state) => ({ value: state, label: state }));

/** Account settings: identity, saved addresses and password. */
const Profile = () => {
  const [tab, setTab] = useState("details");

  return (
    <Container className="py-8">
      <h1 className="type-page-title mb-6 text-content">Your account</h1>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      {tab === "details" && <DetailsTab />}
      {tab === "addresses" && <AddressesTab />}
      {tab === "security" && <SecurityTab />}
    </Container>
  );
};

/* ---------------------------------- Details --------------------------------- */

const DetailsTab = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { data: profile, loading, refetch } = useApi(getProfile, null);
  const save = useMutation(setProfile);

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  // The form mirrors the server copy until the customer edits it.
  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
    });
  }, [profile]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await save.mutate(form);
      // Keep the header's greeting in step with what was just saved.
      dispatch(setProfileAction(response?.data || {}));
      toast.success("Profile updated");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save your details");
    }
  };

  if (loading) return <Skeleton className="h-64 w-full max-w-xl rounded-lg" />;

  return (
    <form
      onSubmit={submit}
      className="grid max-w-xl gap-4 rounded-lg border border-line-subtle bg-surface p-5 sm:grid-cols-2"
    >
      <Input
        label="First name"
        required
        value={form.firstName}
        onChange={(event) => setForm({ ...form, firstName: event.target.value })}
      />
      <Input
        label="Last name"
        value={form.lastName}
        onChange={(event) => setForm({ ...form, lastName: event.target.value })}
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={(event) => setForm({ ...form, phone: event.target.value })}
      />
      <Input label="Email" value={profile?.email || ""} disabled hint="Email cannot be changed" />

      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" loading={save.loading}>
          Save changes
        </Button>
      </div>
    </form>
  );
};

/* --------------------------------- Addresses -------------------------------- */

const EMPTY_ADDRESS = {
  fullName: "",
  phoneNo: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  landMark: "",
};

const AddressesTab = () => {
  const toast = useToast();
  const { data: addresses, loading, refetch } = useApi(getAddresses, null);
  const create = useMutation(createAddress);

  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [open, setOpen] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await create.mutate(draft);
      toast.success("Address added");
      setDraft(EMPTY_ADDRESS);
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save that address");
    }
  };

  const remove = async (id) => {
    try {
      await deleteAddress(id);
      toast.success("Address removed");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not remove that address");
    }
  };

  if (loading) return <Skeleton className="h-40 w-full max-w-3xl rounded-lg" />;

  return (
    <div className="max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {(addresses || []).map((entry) => (
          <div key={entry._id} className="rounded-lg border border-line-subtle bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="type-body-strong text-content">{entry.shippingAddress.fullName}</p>
              {entry.isDefault && (
                <span className="rounded-sm bg-accent-subtle px-2 py-0.5 type-caption text-accent-text">
                  Default
                </span>
              )}
            </div>
            <p className="type-body mt-1 text-content-secondary">
              {entry.shippingAddress.address}, {entry.shippingAddress.city},{" "}
              {entry.shippingAddress.state} — {entry.shippingAddress.pinCode}
            </p>
            <p className="type-caption type-numeric mt-1 text-content-muted">
              {entry.shippingAddress.phoneNo}
            </p>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="mt-3"
              onClick={() => remove(entry._id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {open ? (
        <form
          onSubmit={submit}
          className="mt-4 grid gap-4 rounded-lg border border-line-subtle bg-surface p-5 sm:grid-cols-2"
        >
          <Input
            label="Full name"
            required
            value={draft.fullName}
            onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
          />
          <Input
            label="Phone number"
            required
            inputMode="numeric"
            value={draft.phoneNo}
            onChange={(event) => setDraft({ ...draft, phoneNo: event.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              required
              value={draft.address}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
            />
          </div>
          <Input
            label="City"
            required
            value={draft.city}
            onChange={(event) => setDraft({ ...draft, city: event.target.value })}
          />
          <Select
            label="State"
            required
            placeholder="Select a state"
            options={STATES}
            value={draft.state}
            onChange={(event) => setDraft({ ...draft, state: event.target.value })}
          />
          <Input
            label="PIN code"
            required
            inputMode="numeric"
            value={draft.pinCode}
            onChange={(event) => setDraft({ ...draft, pinCode: event.target.value })}
          />
          <Input
            label="Landmark"
            hint="Optional"
            value={draft.landMark}
            onChange={(event) => setDraft({ ...draft, landMark: event.target.value })}
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="primary" loading={create.loading}>
              Save address
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button icon={Plus} className="mt-4" onClick={() => setOpen(true)}>
          Add an address
        </Button>
      )}
    </div>
  );
};

/* --------------------------------- Security --------------------------------- */

const SecurityTab = () => {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const change = useMutation((body) => axios.post("/api/account/password", body));

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error("The two new passwords do not match");
      return;
    }
    try {
      // The endpoint validates the confirmation itself, so all three fields go.
      await change.mutate({
        currentPassword: form.currentPassword,
        password: form.newPassword,
        confirmPassword: form.confirm,
      });
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update your password");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid max-w-md gap-4 rounded-lg border border-line-subtle bg-surface p-5"
    >
      <Input
        label="Current password"
        type="password"
        required
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
      />
      <Input
        label="New password"
        type="password"
        required
        autoComplete="new-password"
        hint="At least 8 characters"
        value={form.newPassword}
        onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
      />
      <Input
        label="Confirm new password"
        type="password"
        required
        autoComplete="new-password"
        value={form.confirm}
        onChange={(event) => setForm({ ...form, confirm: event.target.value })}
      />
      <Button type="submit" variant="primary" loading={change.loading}>
        Update password
      </Button>
    </form>
  );
};

export default Profile;
