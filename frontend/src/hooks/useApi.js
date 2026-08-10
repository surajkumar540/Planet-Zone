import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
 * @param {{ enabled?: boolean, initialData?: any }} options
 */
export const useApi = (fetcher, params, { enabled = true, initialData = null } = {}) => {
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
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const currentRequest = ++requestId.current;
    let active = true;

    setLoading(true);
    setError(null);

    Promise.resolve(fetcherRef.current(params))
      .then((response) => {
        // Discard responses from superseded requests so a slow earlier call
        // cannot overwrite a newer result.
        if (!active || currentRequest !== requestId.current) return;
        setData(response?.data ?? response ?? null);
        setMeta(response?.meta ?? null);
      })
      .catch((caught) => {
        if (!active || currentRequest !== requestId.current) return;
        setError(
          caught?.response?.data?.message || caught?.message || "Something went wrong."
        );
      })
      .finally(() => {
        if (active && currentRequest === requestId.current) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params compared by value.
  }, [serialisedParams, enabled, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, meta, loading, error, refetch, setData };
};

/**
 * Runs a write operation, tracking its in-flight and error state.
 *
 * Returns the resolved value so callers can act on the result, and rethrows
 * so a caller can still branch on failure.
 */
export const useMutation = (mutator) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await mutator(...args);
      } catch (caught) {
        const message =
          caught?.response?.data?.message || caught?.message || "Something went wrong.";
        setError(message);
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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortValue, JSON.stringify(filters)]);

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
