import { useCallback, useEffect, useState } from "react";

/**
 * Recently viewed products, kept only in this browser.
 *
 * The list never goes to our servers on its own: recommendations send the
 * ids with the request that needs them and the API does not store them.
 * Shoppers can clear it, or pause it so nothing new is recorded.
 */
const KEY = "planet.recentlyViewed";
const PAUSE_KEY = "planet.recentlyViewed.paused";
const MAX = 12;
const EVENT = "planet:recently-viewed";

const read = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
};

const write = (ids) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    // Private mode or storage full: history simply isn't kept.
  }
  window.dispatchEvent(new Event(EVENT));
};

export const isHistoryPaused = () => {
  try {
    return localStorage.getItem(PAUSE_KEY) === "1";
  } catch {
    return false;
  }
};

/** Moves `id` to the front (most recent first). */
export const recordView = (id) => {
  if (!id || isHistoryPaused()) return;
  write([id, ...read().filter((item) => item !== id)]);
};

export const clearHistory = () => write([]);

export const setHistoryPaused = (paused) => {
  try {
    if (paused) localStorage.setItem(PAUSE_KEY, "1");
    else localStorage.removeItem(PAUSE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
};

/** The current list, kept in sync across components and tabs. */
export const useRecentlyViewed = () => {
  const [ids, setIds] = useState(read);
  const [paused, setPaused] = useState(isHistoryPaused);

  useEffect(() => {
    const sync = () => {
      setIds(read());
      setPaused(isHistoryPaused());
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const clear = useCallback(() => clearHistory(), []);
  const togglePaused = useCallback(() => setHistoryPaused(!isHistoryPaused()), []);
  return { ids, paused, clear, togglePaused };
};
