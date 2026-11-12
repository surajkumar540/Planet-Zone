import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { login } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import { getErrorMessage } from "../../../../lib/apiError";
import Button from "../../../../components/ui/Button";
import { Checkbox, Input, PasswordInput } from "../../../../components/ui/Field";
import { setAdminLogged, setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import AuthShell, { AuthError, AuthLink } from "./AuthShell";
import GoogleSignIn from "./GoogleSignIn";

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
      setError(getErrorMessage(caught, "Those details did not match an account."));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track orders and check out faster."
      footer={
        <>
          New to Planet Zone? <AuthLink to="/signup">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3.5">
        <AnimatePresence>{error && <AuthError>{error}</AuthError>}</AnimatePresence>

        <Input
          label="Email"
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
          placeholder="Your password"
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
      <GoogleSignIn text="continue_with" />
    </AuthShell>
  );
};

export default Login;
