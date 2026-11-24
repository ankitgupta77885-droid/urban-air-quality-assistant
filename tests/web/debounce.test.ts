/**
 * Unit tests for debounce utility using fake timers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '../../src/web/utils/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution until specified delay elapses', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('first');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('coalesces rapid invocations and uses the latest arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('call-1');
    vi.advanceTimersByTime(100);
    debounced('call-2');
    vi.advanceTimersByTime(100);
    debounced('call-3');

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('call-3');
  });

  it('cancels pending invocation when cancel() is called', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 250);

    debounced('test');
    expect(fn).not.toHaveBeenCalled();

    debounced.cancel();
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel() does nothing if no timer is pending', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(() => {
      debounced.cancel();
    }).not.toThrow();
  });
});
