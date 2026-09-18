/**
 * Merge two strings, representing lists separated by a separator,
 * ensuring that entries within both lists only appear once in the final result.
 *
 * Optionally sort the entries.
 *
 * @param {string} target
 * @param {string} source
 * @param {string} separator
 * @param {boolean} [sort=false]
 *
 * @return {string} merged list
 */
export function mergeList(target, source, separator, sort = false) {
  if (!target) {
    return source;
  }

  if (!source) {
    return target;
  }

  // merge both source and target, ensuring no duplicate values
  const existing = new Set([
    ...target.split(separator),
    ...source.split(separator)
  ]);

  const merged = Array.from(existing);

  if (sort) {
    merged.sort();
  }

  return merged.join(separator);
}