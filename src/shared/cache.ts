/* v8 ignore start -- top JSDoc anchors TypeScript ESM preamble sourcemaps */
/**
 * Generic in-memory TTL cache.
 *
 * Stores key-value pairs with automatic expiration and maximum-size
 * LRU eviction (least recently accessed entries evicted first).
 */
/* v8 ignore stop */

import { MAX_CACHE_ENTRIES } from './constants.js';

/** A cached entry with its expiration timestamp. */
interface CacheEntry<T> {
  /** The cached value. */
  readonly value: T;
  /** Absolute expiration time (Date.now() + TTL). */
  readonly expiresAt: number;
}

/**
 * In-memory cache with time-to-live expiration and size limits.
 * @typeParam T - Type of cached values.
 */
export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  /**
   * Creates a new TTL cache.
   * @param ttlMs - Time-to-live for entries in milliseconds.
   * @param maxEntries - Maximum number of entries before eviction.
   */
  constructor(ttlMs: number, maxEntries: number = MAX_CACHE_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  /**
   * Retrieves a value from the cache if it exists and has not expired.
   * Refreshes entry recency so eviction removes the least-recently-used key.
   * @param key - Cache key.
   * @returns The cached value, or undefined if missing or expired.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  /**
   * Stores a value in the cache with the configured TTL.
   * @param key - Cache key.
   * @param value - Value to cache.
   */
  set(key: string, value: T): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /**
   * Checks whether a non-expired entry exists for the given key.
   * @param key - Cache key.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Removes an entry from the cache.
   * @param key - Cache key to delete.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Removes all entries from the cache. */
  clear(): void {
    this.store.clear();
  }

  /** Returns the current number of entries (including expired). */
  get size(): number {
    return this.store.size;
  }

  /** Removes the least-recently-used entry from the cache. */
  private evictOldest(): void {
    const oldestKey = this.store.keys().next().value;
    if (oldestKey !== undefined) {
      this.store.delete(oldestKey);
    }
  }
}
