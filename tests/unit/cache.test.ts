/**
 * Unit tests for the TTL cache.
 *
 * Tests caching, expiration, eviction, and edge cases.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

import { TtlCache } from '../../src/server/services/cache.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TtlCache', () => {
  describe('basic operations', () => {
    it('should store and retrieve a value', () => {
      const cache = new TtlCache<string>(60_000);
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for a missing key', () => {
      const cache = new TtlCache<string>(60_000);
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should report has() correctly', () => {
      const cache = new TtlCache<string>(60_000);
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('missing')).toBe(false);
    });

    it('should delete a specific key', () => {
      const cache = new TtlCache<string>(60_000);
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should clear all entries', () => {
      const cache = new TtlCache<string>(60_000);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should report correct size', () => {
      const cache = new TtlCache<string>(60_000);
      expect(cache.size).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('should overwrite existing entries', () => {
      const cache = new TtlCache<string>(60_000);
      cache.set('key1', 'old');
      cache.set('key1', 'new');
      expect(cache.get('key1')).toBe('new');
    });
  });

  describe('TTL expiration', () => {
    it('should return undefined for expired entries', () => {
      const cache = new TtlCache<string>(100);
      const now = Date.now();

      vi.spyOn(Date, 'now').mockReturnValue(now);
      cache.set('key1', 'value1');

      vi.spyOn(Date, 'now').mockReturnValue(now + 200);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return value before TTL expires', () => {
      const cache = new TtlCache<string>(1000);
      const now = Date.now();

      vi.spyOn(Date, 'now').mockReturnValue(now);
      cache.set('key1', 'value1');

      vi.spyOn(Date, 'now').mockReturnValue(now + 500);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should report has() as false for expired entries', () => {
      const cache = new TtlCache<string>(100);
      const now = Date.now();

      vi.spyOn(Date, 'now').mockReturnValue(now);
      cache.set('key1', 'value1');

      vi.spyOn(Date, 'now').mockReturnValue(now + 200);
      expect(cache.has('key1')).toBe(false);
    });

    it('should clean up expired entries on get', () => {
      const cache = new TtlCache<string>(100);
      const now = Date.now();

      vi.spyOn(Date, 'now').mockReturnValue(now);
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      vi.spyOn(Date, 'now').mockReturnValue(now + 200);
      cache.get('key1');
      expect(cache.size).toBe(0);
    });
  });

  describe('eviction', () => {
    it('should evict oldest entry when max size is reached', () => {
      const cache = new TtlCache<string>(60_000, 2);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should respect max entries limit', () => {
      const cache = new TtlCache<string>(60_000, 3);
      cache.set('a', '1');
      cache.set('b', '2');
      cache.set('c', '3');
      cache.set('d', '4');
      expect(cache.size).toBe(3);
    });
  });

  describe('type safety', () => {
    it('should work with object values', () => {
      const cache = new TtlCache<{ name: string }>(60_000);
      cache.set('obj', { name: 'test' });
      expect(cache.get('obj')).toEqual({ name: 'test' });
    });

    it('should work with array values', () => {
      const cache = new TtlCache<number[]>(60_000);
      cache.set('arr', [1, 2, 3]);
      expect(cache.get('arr')).toEqual([1, 2, 3]);
    });
  });
});
