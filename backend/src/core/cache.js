/**
 * Small in-process TTL cache for read-heavy aggregations.
 *
 * Deliberately not a distributed cache: entries are cheap to recompute and
 * short-lived, so a per-instance copy is acceptable. Swap the implementation
 * for Redis if the API is ever scaled beyond a single process and staleness
 * between instances starts to matter.
 */
const store = new Map();

const MAX_ENTRIES = 500;

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

const set = (key, value, ttlMs) => {
  // Bounded so a high-cardinality key space cannot grow without limit.
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

/** Returns the cached value, computing and storing it on a miss. */
const remember = async (key, ttlMs, producer) => {
  const hit = get(key);
  if (hit !== undefined) return hit;
  return set(key, await producer(), ttlMs);
};

/** Drops entries whose key starts with `prefix`, or the whole cache. */
const invalidate = (prefix) => {
  if (!prefix) return store.clear();
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  return undefined;
};

module.exports = { get, set, remember, invalidate };
