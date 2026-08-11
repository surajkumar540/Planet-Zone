import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import { createAccount } from "../../../../redux/reducers/userSlice";
import AuthShell from "./AuthShell";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
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
      setErrors({ email: caught?.response?.data?.message || "Could not create your account" });
    }
  };

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (event) => setForm({ ...form, [key]: event.target.value }),
  });

  return (
    <AuthShell
      title="Create your account"
      description="It takes a minute, and your bag comes with you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" required autoComplete="given-name" {...field("firstName")} />
          <Input label="Last name" autoComplete="family-name" {...field("lastName")} />
        </div>
        <Input label="Email" type="email" required autoComplete="email" {...field("email")} />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters"
          {...field("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          {...field("confirmPassword")}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={register.loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignUp;
