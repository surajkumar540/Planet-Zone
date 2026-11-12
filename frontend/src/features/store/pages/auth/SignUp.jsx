import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Lock, Mail } from "lucide-react";

import { signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import { getErrorMessage } from "../../../../lib/apiError";
import Button from "../../../../components/ui/Button";
import { Input, PasswordInput } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import { createAccount } from "../../../../redux/reducers/userSlice";
import cn from "../../../../lib/cn";
import AuthShell, { AuthError, AuthLink } from "./AuthShell";
import GoogleSignIn from "./GoogleSignIn";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/** Four named steps, each tied to a rule; the API itself requires only the first. */
const RULES = [
  { id: "length", hint: "use 8+ characters", test: (value) => value.length >= 8 },
  { id: "case", hint: "mix upper and lower case", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "number", hint: "add a number", test: (value) => /\d/.test(value) },
  { id: "symbol", hint: "add a symbol", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const STRENGTH = [
  { label: "Too short", tone: "bg-status-critical", text: "text-status-critical" },
  { label: "Weak", tone: "bg-status-critical", text: "text-status-critical" },
  { label: "Fair", tone: "bg-status-warning", text: "text-status-warning" },
  { label: "Good", tone: "bg-status-info", text: "text-status-info" },
  { label: "Strong", tone: "bg-status-good", text: "text-status-good" },
];

/**
 * One line instead of a four-item checklist: the bar, its label, and only the
 * next thing to fix. The checklist took four rows to say what one hint can.
 */
const PasswordMeter = ({ value }) => {
  const missing = useMemo(() => RULES.filter((rule) => !rule.test(value)), [value]);
  const score = RULES.length - missing.length;
  const level = STRENGTH[score];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 pt-1.5">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {RULES.map((rule, index) => (
            <span
              key={rule.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                index < score ? level.tone : "bg-line"
              )}
            />
          ))}
        </div>
        <span className={cn("type-caption font-medium", level.text)}>{level.label}</span>
      </div>
      <p className="mt-1 type-caption text-content-muted" aria-live="polite">
        {missing.length ? (
          <>Tip: {missing[0].hint}</>
        ) : (
          <span className="inline-flex items-center gap-1 text-status-good">
            <Check size={12} strokeWidth={3} /> Great password
          </span>
        )}
      </p>
    </motion.div>
  );
};

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const register = useMutation(signup);

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "The two passwords do not match" });
      return;
    }

    try {
      await register.mutate(form);
      // The account is not usable until the emailed code is verified, so the
      // draft is kept in the store for the OTP screen to resend from.
      dispatch(createAccount(form));
      toast.success("Check your inbox", "We sent a verification code to your email.");
      navigate("/otp");
    } catch (caught) {
      const issues = caught?.response?.data?.errors;
      if (Array.isArray(issues)) {
        setErrors(
          Object.fromEntries(
            issues.map((issue) => [String(issue.field).replace("body.", ""), issue.message])
          )
        );
        return;
      }
      setErrors({ form: getErrorMessage(caught, "Could not create your account") });
    }
  };

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (event) => setForm({ ...form, [key]: event.target.value }),
  });

  const matches = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <AuthShell
      title="Create your account"
      description="We'll email you a 6-digit code to confirm it's you."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3.5">
        <AnimatePresence>{errors.form && <AuthError>{errors.form}</AuthError>}</AnimatePresence>

        {/* Side by side even on a phone: two short names fit, and it saves a row. */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            required
            autoFocus
            autoComplete="given-name"
            placeholder="Aditi"
            {...field("firstName")}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            placeholder="Sharma"
            {...field("lastName")}
          />
        </div>

        <Input
          label="Email"
          type="email"
          icon={Mail}
          required
          autoComplete="email"
          placeholder="you@example.com"
          {...field("email")}
        />

        <div>
          <PasswordInput
            label="Password"
            icon={Lock}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...field("password")}
          />
          <AnimatePresence>
            {form.password.length > 0 && <PasswordMeter value={form.password} />}
          </AnimatePresence>
        </div>

        <PasswordInput
          label="Confirm password"
          icon={Lock}
          required
          autoComplete="new-password"
          placeholder="Type it again"
          hint={matches ? "Passwords match" : undefined}
          {...field("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={register.loading}
          iconRight={ArrowRight}
        >
          Create account
        </Button>
      </form>
      <GoogleSignIn text="signup_with" />
    </AuthShell>
  );
};

export default SignUp;
