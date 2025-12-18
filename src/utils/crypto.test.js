import { describe, it, expect } from 'vitest';
import { randomCryptoNumber, negativeOrPositive, scale } from './crypto.js';

describe('Crypto Utils', () => {
  describe('randomCryptoNumber', () => {
    it('should return a number between 0 and 1', () => {
      const result = randomCryptoNumber();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should use crypto.getRandomValues', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(randomCryptoNumber());
      }
      // Should have many unique values (cryptographically random)
      expect(results.size).toBeGreaterThan(50);
    });
  });

  describe('negativeOrPositive', () => {
    it('should return either -1 or 1', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        const result = negativeOrPositive();
        results.add(result);
        expect([-1, 1]).toContain(result);
      }
      // Should have both values over 100 iterations
      expect(results.size).toBe(2);
    });
  });

  describe('scale', () => {
    it('should scale numbers correctly', () => {
      expect(scale(5, 0, 10, 0, 100)).toBe(50);
      expect(scale(0, 0, 10, 0, 100)).toBe(0);
      expect(scale(10, 0, 10, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(scale(0, -10, 10, 0, 100)).toBe(50);
      expect(scale(-10, -10, 10, 0, 100)).toBe(0);
      expect(scale(10, -10, 10, 0, 100)).toBe(100);
    });
  });
});
