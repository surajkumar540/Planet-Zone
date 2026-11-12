import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";

import { otpVerify, signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
import { getErrorMessage } from "../../../../lib/apiError";
import Button from "../../../../components/ui/Button";
import { useToast } from "../../../../components/ui/Toast";
import { setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import AuthShell, { AuthLink } from "./AuthShell";
import OtpInput from "./OtpInput";

const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

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

  // Editing the code clears a stale error so the boxes stop looking wrong
  // while the customer is fixing them.
  useEffect(() => {
    if (code.length < CODE_LENGTH) setError("");
  }, [code]);

  if (!email) return <Navigate to="/signup" replace />;

  const confirm = async (submitted) => {
    setError("");
    try {
      const response = await verify.mutate({ email, otp: submitted });
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
      setError(getErrorMessage(caught, "That code is not valid. Try again."));
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
      setCode("");
      toast.success("Code sent again", `Check ${email} for a new code.`);
    } catch (caught) {
      toast.error(getErrorMessage(caught, "Could not resend the code"));
    }
  };

  return (
    <AuthShell
      title="Check your email"
      description={
        <>
          Enter the {CODE_LENGTH}-digit code sent to{" "}
          <span className="font-medium text-content break-all">{email}</span>
        </>
      }
      footer={
        <>
          Wrong email? <AuthLink to="/signup">Start over</AuthLink>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          confirm(code);
        }}
        className="space-y-3.5"
      >
        <motion.div
          // A rejected code shakes the whole row rather than colouring one box,
          // since the customer cannot know which digit was wrong.
          animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <OtpInput
            value={code}
            onChange={setCode}
            length={CODE_LENGTH}
            invalid={Boolean(error)}
            disabled={verify.loading}
            autoFocus
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="text-center type-caption text-status-critical"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={verify.loading}
          disabled={code.length < CODE_LENGTH}
          iconRight={ArrowRight}
        >
          Verify
        </Button>

        <div className="flex h-7 items-center justify-center">
          {seconds > 0 ? (
            <p className="type-caption text-content-muted">
              Resend code in <span className="tabular-nums">{seconds}s</span>
            </p>
          ) : (
            <Button
              variant="link"
              size="sm"
              icon={RotateCcw}
              onClick={sendAgain}
              loading={resend.loading}
            >
              Send a new code
            </Button>
          )}
        </div>
      </form>
    </AuthShell>
  );
};

export default OtpVerify;
