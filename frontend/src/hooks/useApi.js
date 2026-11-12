import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "../lib/apiError";

/* ------------------------------ Request sharing ----------------------------- */

/**
 * In-memory record of reads, keyed by fetcher function and then by params.
 *
 * Two components asking for the same thing at the same time share one
 * request, and a caller that opts into `cacheTime` reuses a recent result
 * instead of another round trip. The database is far from the users, so each
 * avoided request is a visible saving.
 */
const requests = new WeakMap();

const sharedRead = (fetcher, params, { cacheTime, force }) => {
  let byParams = requests.get(fetcher);
  if (!byParams) {
    byParams = new Map();
    requests.set(fetcher, byParams);
  }

  const key = JSON.stringify(params ?? null);
  const existing = byParams.get(key);
  if (!force && existing && (existing.pending || existing.expiresAt > Date.now())) {
    return existing.promise;
  }

  const entry = { pending: true, expiresAt: 0 };
  entry.promise = Promise.resolve()
    .then(() => fetcher(params))
    .then(
      (value) => {
        entry.pending = false;
        entry.expiresAt = Date.now() + cacheTime;
        if (!cacheTime && byParams.get(key) === entry) byParams.delete(key);
        return value;
      },
      (error) => {
        // Failures are never cached; the next caller tries again.
        if (byParams.get(key) === entry) byParams.delete(key);
        throw error;
      }
    );
  byParams.set(key, entry);
  return entry.promise;
};

/**
 * Forgets every cached read. Any successful write calls this, because a write
 * can change data that a cached list or filter depends on.
 */
export const clearApiCache = () => {
  // A WeakMap cannot be iterated, so cached entries are not deleted; bumping
  // the generation makes every hook bypass them on its next read instead.
  requestsGeneration.current += 1;
};
const requestsGeneration = { current: 0 };

/* ---------------------------------- Reads ----------------------------------- */

/**
 * Reads data from an API function, exposing the loading, error and empty
 * states every screen needs.
 *
 * Deliberately small: the app has no server-cache library, and a hand-rolled
 * hook that returns `{ data, loading, error, refetch }` keeps every screen's
 * fetching behaviour identical without adding a dependency.
 *
 * @param {Function} fetcher called with `params`; must return a promise
 * @param {any} params serialised to decide when to refetch
 * @param {{ enabled?: boolean, initialData?: any, cacheTime?: number }} options
 *   `cacheTime` (ms) lets rarely-changing data, such as filter options, be
 *   reused across screens instead of refetched on every visit.
 */
export const useApi = (
  fetcher,
  params,
  { enabled = true, initialData = null, cacheTime = 0 } = {}
) => {
  const [data, setData] = useState(initialData);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Compared by value so a fresh object literal does not trigger a refetch.
  const serialisedParams = JSON.stringify(params ?? null);

  // Kept in a ref so the effect does not re-run when a caller passes an
  // inline arrow function, which would otherwise loop forever.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const requestId = useRef(0);
  const forceNext = useRef(false);
  const quietNext = useRef(false);
  const seenGeneration = useRef(requestsGeneration.current);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const currentRequest = ++requestId.current;
    let active = true;

    // An explicit refetch, or a write since the last read, must skip the cache.
    const force = forceNext.current || seenGeneration.current !== requestsGeneration.current;
    forceNext.current = false;
    seenGeneration.current = requestsGeneration.current;
    const quiet = quietNext.current;
    quietNext.current = false;

    if (!quiet) {
      setLoading(true);
      setError(null);
    }

    sharedRead(fetcherRef.current, params, { cacheTime, force })
      .then((response) => {
        // Discard responses from superseded requests so a slow earlier call
        // cannot overwrite a newer result.
        if (!active || currentRequest !== requestId.current) return;
        setData(response?.data ?? response ?? null);
        setMeta(response?.meta ?? null);
      })
      .catch((caught) => {
        if (!active || currentRequest !== requestId.current) return;
        // A quiet reload that fails keeps what is on screen.
        if (!quiet) setError(getErrorMessage(caught));
      })
      .finally(() => {
        if (active && currentRequest === requestId.current) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params compared by value.
  }, [serialisedParams, enabled, reloadToken]);

  const refetch = useCallback(() => {
    forceNext.current = true;
    setReloadToken((token) => token + 1);
  }, []);

  /**
   * Fresh data without the loading state: what is on screen stays put and is
   * swapped when the response lands. Use after a save, so the page never
   * blanks into skeletons.
   */
  const reload = useCallback(() => {
    forceNext.current = true;
    quietNext.current = true;
    setReloadToken((token) => token + 1);
  }, []);

  return { data, meta, loading, error, refetch, reload, setData };
};

/* ---------------------------------- Writes ---------------------------------- */

/**
 * Runs a write operation, tracking its in-flight and error state.
 *
 * Returns the resolved value so callers can act on the result, and rethrows
 * so a caller can still branch on failure. A successful write invalidates
 * cached reads.
 */
export const useMutation = (mutator) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(...args);
        clearApiCache();
        return result;
      } catch (caught) {
        setError(getErrorMessage(caught));
        throw caught;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, loading, error, setError };
};

/**
 * Delays a rapidly changing value, so typing in a search box issues one
 * request rather than one per keystroke.
 */
export const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/**
 * Bundles the state a paginated, searchable, sortable list needs.
 *
 * Resets to page one whenever a filter changes, so a filtered list can never
 * open on a page that no longer exists.
 */
export const useListParams = ({ limit = 20, sort = "createdAt:desc", ...initialFilters } = {}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState(sort);
  const [filters, setFilters] = useState(initialFilters);

  const debouncedSearch = useDebounced(search);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortValue, filtersKey]);

  const setFilter = useCallback((key, value) => {
    setFilters((current) => {
      const next = { ...current };
      // An empty value clears the filter rather than sending a blank param.
      if (value === "" || value === undefined || value === null) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch("");
  }, []);

  const hasFilters = useMemo(
    () => Boolean(debouncedSearch) || Object.keys(filters).length > 0,
    [debouncedSearch, filters]
  );

  const params = useMemo(
    () => ({
      page,
      limit,
      sort: sortValue,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...filters,
    }),
    [page, limit, sortValue, debouncedSearch, filters]
  );

  return {
    params,
    page,
    setPage,
    search,
    setSearch,
    sort: sortValue,
    setSort: setSortValue,
    filters,
    setFilter,
    clearFilters,
    hasFilters,
  };
};

export default useApi;
