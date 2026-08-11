import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { otpVerify, signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import { useToast } from "../../../../components/ui/Toast";
import { setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import AuthShell from "./AuthShell";

const RESEND_SECONDS = 60;

/**
 * Email verification.
 *
 * The address being verified comes from the sign-up draft in the store, so a
 * visitor who lands here directly is sent back to sign up rather than shown a
 * form that cannot succeed.
 */
const OtpVerify = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const draft = useSelector((state) => state.user.userObj);
  const email = draft?.email;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  const verify = useMutation(otpVerify);
  const resend = useMutation(signup);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  if (!email) return <Navigate to="/signup" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await verify.mutate({ email, otp: code });
      if (!response?.token) throw new Error(response?.message || "Verification failed");

      setSession({
        token: response.token,
        userId: response.userId,
        isAdmin: response.isAdmin,
      });
      dispatch(setProfile(response.data || {}));
      dispatch(setUserLogged());
      toast.success("Email verified", "Your account is ready.");
      navigate("/", { replace: true });
    } catch (caught) {
      setError(caught?.response?.data?.message || "That code is not valid. Try again.");
    }
  };

  const sendAgain = async () => {
    try {
      await resend.mutate({
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        password: draft.password,
        confirmPassword: draft.password,
      });
      setSeconds(RESEND_SECONDS);
      toast.success("Code sent again");
    } catch (caught) {
      toast.error(caught?.response?.data?.message || "Could not resend the code");
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      description={`Enter the six-digit code we sent to ${email}.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          required
          autoComplete="one-time-code"
          error={error || undefined}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          className="type-numeric tracking-[0.4em]"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={verify.loading}>
          Verify and continue
        </Button>

        <div className="text-center">
          {seconds > 0 ? (
            <p className="type-caption text-content-muted">
              Resend the code in {seconds}s
            </p>
          ) : (
            <Button variant="link" onClick={sendAgain} loading={resend.loading}>
              Send a new code
            </Button>
          )}
        </div>
      </form>
    </AuthShell>
  );
};

export default OtpVerify;
