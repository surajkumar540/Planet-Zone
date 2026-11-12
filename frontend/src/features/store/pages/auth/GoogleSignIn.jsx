import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import axios from "../../../../api/axios";
import { getErrorMessage } from "../../../../lib/apiError";
import { setAdminLogged, setProfile, setUserLogged } from "../../../../redux/reducers/userSlice";
import { setSession } from "../../../../utils/functions";
import { useToast } from "../../../../components/ui/Toast";

/**
 * "Continue with Google", using Google Identity Services (free).
 *
 * Google's own button is rendered (their branding rules require it). When the
 * shopper picks an account, Google hands us a signed ID token, which our API
 * verifies with Google's keys before signing them in or creating their
 * account. Nothing shows until the store has a Google client id configured
 * (GOOGLE_CLIENT_ID on the API).
 */

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise = null;
const loadScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Couldn't reach Google"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

let configPromise = null;
const loadClientId = () => {
  if (!configPromise) {
    configPromise = axios
      .get("/api/auth/google/config")
      .then((response) => response.data?.data?.clientId || "")
      .catch(() => {
        configPromise = null;
        return "";
      });
  }
  return configPromise;
};

const GoogleSignIn = ({ text = "continue_with", onError }) => {
  const holder = useRef(null);
  const [clientId, setClientId] = useState(null);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    let active = true;
    loadClientId().then((id) => active && setClientId(id));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!clientId || !holder.current) return undefined;
    let cancelled = false;

    const onCredential = async ({ credential }) => {
      setBusy(true);
      try {
        const { data: response } = await axios.post("/api/auth/google", { credential });
        setSession({ token: response.token, userId: response.userId, isAdmin: response.isAdmin });
        dispatch(setProfile(response.data || {}));
        dispatch(response.isAdmin ? setAdminLogged() : setUserLogged());
        toast.success(response.created ? "Welcome to Planet Zone!" : "Signed in with Google", response.data?.email);
        navigate(location.state?.from || (response.isAdmin ? "/admin" : "/"), { replace: true });
      } catch (error) {
        const message = getErrorMessage(error, "Google sign-in didn't work. Please try again.");
        if (onError) onError(message);
        else toast.error("Google sign-in failed", message);
      } finally {
        setBusy(false);
      }
    };

    loadScript()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({ client_id: clientId, callback: onCredential, ux_mode: "popup" });
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: document.documentElement.dataset.theme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: Math.min(holder.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setClientId("");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set up once per client id.
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="type-caption text-content-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="relative flex min-h-[44px] justify-center">
        <div ref={holder} className="flex w-full justify-center" />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-surface/80 type-caption font-semibold text-content">
            Signing you in…
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSignIn;
