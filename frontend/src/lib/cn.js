/**
 * Joins class names, dropping falsy values.
 *
 * Keeps conditional classes readable at call sites without pulling in a
 * dependency for what is a three-line function.
 */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

export default cn;
