import { useEffect, useState } from "react";
import axios from "../api/axios";

/**
 * Whether the server's local AI features are switched on (AI_FEATURES).
 * Asked once per visit and shared; AI entry points (photo search, "matched
 * by AI" labels) stay hidden when it's off, e.g. on a small free server.
 */
let pending = null;
let known = null;

const fetchStatus = () => {
  if (!pending) {
    pending = axios
      .get("/api/smart/ai-status")
      .then((response) => {
        known = Boolean(response.data?.data?.enabled);
        return known;
      })
      .catch(() => {
        pending = null;
        return false;
      });
  }
  return pending;
};

export const useAiEnabled = () => {
  const [enabled, setEnabled] = useState(known ?? false);
  useEffect(() => {
    let active = true;
    fetchStatus().then((value) => active && setEnabled(value));
    return () => {
      active = false;
    };
  }, []);
  return enabled;
};

export default useAiEnabled;
