import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

import { login } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Checkbox, Input, PasswordInput } from "../../../../components/ui/Field";
import { setAdminLogged, setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import AuthShell, { AuthLink } from "./AuthShell";

/** Shakes the form once when the credentials come back rejected. */
const shake = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    x: [0, -6, 6, -4, 4, 0],
    transition: { x: { duration: 0.4 }, height: { duration: 0.2 } },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.15 } },
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const signIn = useMutation(login);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await signIn.mutate(form);
      if (!response?.status) throw new Error(response?.message || "Unable to sign in");

      setSession({
        token: response.token,
        userId: response.userId,
        isAdmin: response.isAdmin,
      });
      dispatch(setProfile(response.data || {}));
      dispatch(response.isAdmin ? setAdminLogged() : setUserLogged());

      // Return the customer to whatever they were trying to reach, and send
      // staff to the dashboard when they had no particular destination.
      const intended = location.state?.from;
      navigate(intended || (response.isAdmin ? "/admin" : "/"), { replace: true });
    } catch (caught) {
      // The API answers unknown email and wrong password identically, so the
      // message can be shown as-is without leaking which one it was.
      setError(caught?.response?.data?.message || "Those details did not match an account.");
    }
  };

  return (
    <AuthShell
      badge="Sign in"
      title="Welcome back"
      description="Sign in to track orders, save favourites and check out faster."
      footer={
        <>
          New to Planet? <AuthLink to="/signup">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <AnimatePresence>
          {error && (
            <motion.div
              variants={shake}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-start gap-2.5 overflow-hidden rounded-md border border-status-critical bg-status-critical-bg px-3.5 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-px shrink-0 text-status-critical" />
              <p className="type-body text-status-critical">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

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

        <PasswordInput
          label="Password"
          icon={Lock}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />

        <div className="flex items-center justify-between gap-3">
          <Checkbox checked={remember} onChange={setRemember} label="Keep me signed in" />
          <AuthLink to="/change-password" className="type-caption">
            Forgot password?
          </AuthLink>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={signIn.loading}
          iconRight={ArrowRight}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center type-caption text-content-muted">
        By continuing you agree to our terms and privacy policy.
      </p>
    </AuthShell>
  );
};

export default Login;
