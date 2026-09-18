/**
 * Throttle function call according to UI update cycle (requestAnimationFrame based).
 *
 * @param  {Function} fn
 *
 * @return {Function} throttled fn
 */
export default function throttle(fn) {
  let active = false;

  let lastArgs = [];
  let lastThis;

  return function (...args) {
    lastArgs = args;
    // eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
    lastThis = this;

    if (active) {
      return;
    }

    active = true;

    fn.apply(lastThis, lastArgs);

    window.requestAnimationFrame(() => {
      lastArgs = lastThis = active = undefined;
    });
  };
}
