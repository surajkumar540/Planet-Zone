// Combining diacritical marks, expressed as escapes so the source stays ASCII.
const DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

/** Converts arbitrary text into a URL-safe slug. */
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    // Decomposing first turns an accented character into base + mark, so the
    // marks can be stripped and the base letter kept.
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(NON_ALPHANUMERIC, "-")
    .replace(EDGE_DASHES, "");

/**
 * Returns a slug that does not yet exist, appending `-2`, `-3`, … as needed.
 *
 * @param {string} value text to slugify
 * @param {(slug: string) => Promise<boolean>} exists collision predicate
 */
const uniqueSlug = async (value, exists) => {
  const base = slugify(value) || "item";
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-await-in-loop -- each probe depends on the last.
  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
};

module.exports = { slugify, uniqueSlug };
