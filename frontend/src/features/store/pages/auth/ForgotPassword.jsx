import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { changePassword, forgetOtp } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import AuthShell from "./AuthShell";

/**
 * Password reset.
 *
 * Two steps on one screen: request a code, then set a new password with it.
 * The request step always reports success, matching the API, which does not
 * reveal whether an account exists for the address.
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState("request");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const request = useMutation(forgetOtp);
  const reset = useMutation(changePassword);

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await request.mutate({ email: form.email });
      toast.success("Check your inbox", "If an account exists, a reset code is on its way.");
      setStep("reset");
    } catch (caught) {
      setError(caught?.response?.data?.message || "Could not send a reset code");
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("The two passwords do not match");
      return;
    }

    try {
      await reset.mutate(form);
      toast.success("Password updated", "You can sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (caught) {
      setError(caught?.response?.data?.message || "Could not reset your password");
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description={
        step === "request"
          ? "Tell us the email on your account and we will send a code."
          : "Enter the code we emailed you, then choose a new password."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="text-accent-text hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {step === "request" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={error || undefined}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={request.loading}>
            Send reset code
          </Button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4">
          <Input
            label="Reset code"
            inputMode="numeric"
            maxLength={6}
            required
            value={form.otp}
            onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, "") })}
            className="type-numeric tracking-[0.4em]"
          />
          <Input
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 8 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            autoComplete="new-password"
            error={error || undefined}
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={reset.loading}>
            Set new password
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setStep("request")}>
            Use a different email
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
