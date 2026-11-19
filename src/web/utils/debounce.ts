/**
 * Debounce utility.
 *
 * Returns a debounced version of the given function that delays
 * invocation until after the specified wait period.
 */

/**
 * Creates a debounced function that delays invoking the provided function.
 * @param fn - Function to debounce.
 * @param delayMs - Delay in milliseconds.
 * @returns Debounced function with a cancel method.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
