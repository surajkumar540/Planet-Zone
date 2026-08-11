import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, MailCheck, RotateCcw } from "lucide-react";

import { otpVerify, signup } from "../../../../api/userApi";
import { useMutation } from "../../../../hooks/useApi";
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

  // Typing the last digit clears a stale error so the boxes stop looking wrong
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
      setCode("");
      toast.success("Code sent again", `Check ${email} for a new code.`);
    } catch (caught) {
      toast.error(caught?.response?.data?.message || "Could not resend the code");
    }
  };

  const progress = ((RESEND_SECONDS - seconds) / RESEND_SECONDS) * 100;

  return (
    <AuthShell
      badge="Almost there"
      title="Verify your email"
      description={
        <>
          Enter the {CODE_LENGTH}-digit code we sent to{" "}
          <span className="font-medium text-content">{email}</span>.
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          confirm(code);
        }}
        className="space-y-5"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent-text"
        >
          <MailCheck size={22} />
        </motion.div>

        <motion.div
          // A rejected code shakes the whole row rather than colouring one box,
          // since the customer cannot know which digit was wrong.
          animate={error ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
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
              className="flex items-center justify-center gap-1.5 type-caption text-status-critical"
            >
              <AlertCircle size={13} />
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
          Verify and continue
        </Button>

        <div className="text-center">
          {seconds > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <p className="type-caption text-content-muted">
                Didn&apos;t get it? You can ask for a new code in {seconds}s
              </p>
              {/* A filling bar reads faster than a number counting down alone. */}
              <div className="h-0.5 w-32 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button variant="link" icon={RotateCcw} onClick={sendAgain} loading={resend.loading}>
              Send a new code
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center type-caption text-content-muted">
        Wrong address? <AuthLink to="/signup">Start over</AuthLink>
      </p>
    </AuthShell>
  );
};

export default OtpVerify;
