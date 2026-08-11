import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import { setAdminLogged, setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import AuthShell from "./AuthShell";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
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
      setError(caught?.response?.data?.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track orders and pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          error={error || undefined}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />

        <div className="flex justify-end">
          <Link to="/change-password" className="type-caption text-accent-text hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={signIn.loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
