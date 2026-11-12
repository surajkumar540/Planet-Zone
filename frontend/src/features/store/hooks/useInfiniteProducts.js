import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProducts } from "../../../api/productApi";
import { getErrorMessage } from "../../../lib/apiError";

/**
 * Product list that grows as the shopper scrolls.
 *
 * Changing filters or sort starts over from page one, but the previous items
 * stay on screen (dimmed by the caller) until the new first page arrives, so
 * the grid never flashes empty. Responses for an outdated filter set are
 * ignored, which keeps a slow earlier request from overwriting newer results.
 */
const useInfiniteProducts = (query, pageSize = 12) => {
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const key = JSON.stringify(query);
  const generation = useRef(0);

  const fetchPage = useCallback(
    async (pageNumber, gen) => {
      const response = await getAllProducts({ ...query, page: pageNumber, limit: pageSize });
      if (gen !== generation.current) return null;
      return response;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the query is compared by value.
    [key, pageSize]
  );

  // New filters: start again from the first page.
  useEffect(() => {
    const gen = ++generation.current;
    setLoading(true);
    setError(null);
    fetchPage(1, gen)
      .then((response) => {
        if (!response) return;
        setItems(response.data || []);
        setTotal(response.meta?.total ?? 0);
        setPage(1);
      })
      .catch((caught) => gen === generation.current && setError(getErrorMessage(caught)))
      .finally(() => gen === generation.current && setLoading(false));
  }, [fetchPage]);

  const hasMore = items !== null && items.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const gen = generation.current;
    setLoadingMore(true);
    fetchPage(page + 1, gen)
      .then((response) => {
        if (!response) return;
        setItems((current) => {
          // Guard against duplicates if the catalogue shifted between pages.
          const seen = new Set(current.map((item) => item._id));
          return [...current, ...(response.data || []).filter((item) => !seen.has(item._id))];
        });
        setTotal(response.meta?.total ?? total);
        setPage((current) => current + 1);
      })
      .catch((caught) => gen === generation.current && setError(getErrorMessage(caught)))
      .finally(() => gen === generation.current && setLoadingMore(false));
  }, [fetchPage, hasMore, loading, loadingMore, page, total]);

  const retry = useCallback(() => {
    setError(null);
    if (!items) generation.current += 0;
    loadMore();
  }, [items, loadMore]);

  return { items, total, loading, loadingMore, hasMore, error, loadMore, retry };
};

export default useInfiniteProducts;
