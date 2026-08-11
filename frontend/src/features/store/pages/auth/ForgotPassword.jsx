import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, KeyRound, Lock, Mail } from "lucide-react";

import { changePassword, forgetOtp } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input, PasswordInput } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import cn from "../../../../lib/cn";
import AuthShell, { AuthLink } from "./AuthShell";
import OtpInput from "./OtpInput";

const STEPS = [
  { id: "request", label: "Your email" },
  { id: "reset", label: "New password" },
];

/** Two dots and a connecting line — enough to show there is an end in sight. */
const StepIndicator = ({ current }) => (
  <ol className="mb-7 flex items-center gap-3">
    {STEPS.map((step, index) => {
      const active = STEPS.findIndex((item) => item.id === current) === index;
      const done = STEPS.findIndex((item) => item.id === current) > index;

      return (
        <li key={step.id} className="flex flex-1 items-center gap-3">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full type-caption font-semibold transition-colors",
                done && "bg-status-good text-white",
                active && "bg-accent text-accent-on",
                !done && !active && "bg-surface-sunken text-content-muted"
              )}
            >
              {done ? <Check size={13} strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "type-caption transition-colors",
                active ? "font-medium text-content" : "text-content-muted"
              )}
            >
              {step.label}
            </span>
          </span>
          {index < STEPS.length - 1 && (
            <span className={cn("h-px flex-1", done ? "bg-status-good" : "bg-line")} />
          )}
        </li>
      );
    })}
  </ol>
);

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

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
      badge="Reset"
      title="Reset your password"
      description={
        step === "request"
          ? "Tell us the email on your account and we will send a code."
          : "Enter the code we emailed you, then choose a new password."
      }
      footer={
        <>
          Remembered it? <AuthLink to="/login">Back to sign in</AuthLink>
        </>
      }
    >
      <StepIndicator current={step} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-4 flex items-start gap-2.5 overflow-hidden rounded-md border border-status-critical bg-status-critical-bg px-3.5 py-3"
          >
            <AlertCircle size={16} className="mt-px shrink-0 text-status-critical" />
            <p className="type-body text-status-critical">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "request" ? (
          <motion.form
            key="request"
            {...slide}
            onSubmit={requestCode}
            className="space-y-5"
          >
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              required
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={request.loading}
              iconRight={ArrowRight}
            >
              Send reset code
            </Button>
          </motion.form>
        ) : (
          <motion.form key="reset" {...slide} onSubmit={submitReset} className="space-y-5">
            <div>
              <span className="type-label mb-1.5 flex items-center gap-1.5 text-content-secondary">
                <KeyRound size={13} />
                Reset code
              </span>
              <OtpInput
                value={form.otp}
                onChange={(otp) => setForm({ ...form, otp })}
                invalid={Boolean(error)}
                autoFocus
              />
            </div>

            <PasswordInput
              label="New password"
              icon={Lock}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <PasswordInput
              label="Confirm new password"
              icon={Lock}
              required
              autoComplete="new-password"
              placeholder="Type it once more"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={reset.loading}
              disabled={form.otp.length < 6}
            >
              Set new password
            </Button>

            <Button variant="ghost" fullWidth onClick={() => setStep("request")}>
              Use a different email
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
};

export default ForgotPassword;
