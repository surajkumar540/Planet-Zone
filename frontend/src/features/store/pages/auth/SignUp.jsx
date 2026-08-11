import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Lock, Mail, User } from "lucide-react";

import { signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input, PasswordInput } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import { createAccount } from "../../../../redux/reducers/userSlice";
import cn from "../../../../lib/cn";
import AuthShell, { AuthLink } from "./AuthShell";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/**
 * Password strength, scored on the rules the API actually enforces plus the
 * two that matter most in practice.
 *
 * Deliberately not a percentage: a bar that creeps to 63% invites the customer
 * to wonder what the missing 37% is. Four named steps, each tied to a rule the
 * checklist below spells out.
 */
const RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "case", label: "Upper and lower case", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "number", label: "A number", test: (value) => /\d/.test(value) },
  { id: "symbol", label: "A symbol", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const STRENGTH = [
  { label: "Too short", tone: "bg-status-critical", text: "text-status-critical" },
  { label: "Weak", tone: "bg-status-critical", text: "text-status-critical" },
  { label: "Fair", tone: "bg-status-warning", text: "text-status-warning" },
  { label: "Good", tone: "bg-status-info", text: "text-status-info" },
  { label: "Strong", tone: "bg-status-good", text: "text-status-good" },
];

const PasswordMeter = ({ value }) => {
  const passed = useMemo(() => RULES.filter((rule) => rule.test(value)), [value]);
  const score = passed.length;
  const level = STRENGTH[score];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="pt-1">
        <div className="flex items-center justify-between gap-3">
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

        <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
          {RULES.map((rule) => {
            const met = rule.test(value);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-1.5 type-caption transition-colors",
                  met ? "text-status-good" : "text-content-muted"
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors",
                    met ? "bg-status-good-bg" : "bg-surface-sunken"
                  )}
                >
                  {met && <Check size={9} strokeWidth={3.5} />}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      </div>
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
      setErrors({ form: caught?.response?.data?.message || "Could not create your account" });
    }
  };

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (event) => setForm({ ...form, [key]: event.target.value }),
  });

  const matches =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <AuthShell
      badge="Create account"
      title="Start shopping in a minute"
      description="One account for orders, saved items and faster checkout."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <AnimatePresence>
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2.5 overflow-hidden rounded-md border border-status-critical bg-status-critical-bg px-3.5 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-px shrink-0 text-status-critical" />
              <p className="type-body text-status-critical">{errors.form}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            icon={User}
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
          label="Email address"
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
            placeholder="Choose a strong password"
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
          placeholder="Type it once more"
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

      <p className="mt-6 text-center type-caption text-content-muted">
        We will email you a six-digit code to confirm your address.
      </p>
    </AuthShell>
  );
};

export default SignUp;
