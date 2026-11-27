/**
 * Debounce utility.
 *
 * Returns a debounced version of the given function that delays
 * invocation until after the specified wait period.
 */

/** Debounced function signature with an explicit cancellation hook. */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

/**
 * Creates a debounced function that delays invoking the provided function.
 * @param fn - Function to debounce.
 * @param delayMs - Delay in milliseconds.
 * @returns Debounced function with a cancel method.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const trigger = (...args: Args): void => {
    cancel();
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delayMs);
  };

  return Object.assign(trigger, { cancel });
}
