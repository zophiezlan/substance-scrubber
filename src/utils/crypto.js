/**
 * Cryptographically Secure Random Number Generation Utilities
 * 
 * This module provides cryptographically secure random number generation
 * for use in privacy-critical operations like pixel shuffling and blurring.
 * Uses the Web Crypto API for true cryptographic randomness.
 * 
 * @module utils/crypto
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
 */

/**
 * Generate a cryptographically secure random number between 0 and 1
 * 
 * Uses window.crypto.getRandomValues() to generate truly random values
 * suitable for security-sensitive operations. This is superior to Math.random()
 * which is not cryptographically secure.
 * 
 * @returns {number} Random number in the range [0, 1)
 * @throws {Error} If window.crypto is not available (very old browsers)
 * 
 * @example
 * const random = randomCryptoNumber(); // 0.4563892...
 * const percentage = random * 100; // 45.63892...
 */
export function randomCryptoNumber() {
  // OPTIMIZE: Could use a larger buffer and cache values for better performance
  // if this function is called repeatedly in tight loops
  if (!window.crypto || !window.crypto.getRandomValues) {
    // Show critical warning to user - crypto is essential for privacy
    const warningMessage = 'CRITICAL: Secure random number generation is not available in your browser. ' +
                         'Privacy features may be compromised. Please use a modern browser (Chrome, Firefox, Edge, Safari).';
    console.error(warningMessage);
    
    // Try to show warning to user
    if (typeof alert !== 'undefined') {
      alert(warningMessage);
    }
    
    // Still fallback to Math.random() to allow app to function
    // but user has been warned
    return Math.random();
  }
  
  const buf = new Uint8Array(1);
  window.crypto.getRandomValues(buf);
  return buf[0] / 255;
}

/**
 * Randomly return -1 or 1 with equal probability
 * 
 * Useful for adding random directional variation to values.
 * Uses cryptographically secure randomness.
 * 
 * @returns {number} Either -1 or 1
 * 
 * @example
 * const offset = 5 * negativeOrPositive(); // Either -5 or 5
 * const variation = baseValue + (Math.random() * 10 * negativeOrPositive());
 */
export function negativeOrPositive() {
  return randomCryptoNumber() < 0.5 ? -1 : 1;
}

/**
 * Scale (map) a number from one range to another range
 * 
 * Linear interpolation between two ranges. Useful for converting slider values
 * to pixel sizes, or normalizing values between different scales.
 * 
 * @param {number} num - The number to scale
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} The scaled number in the output range
 * 
 * @example
 * // Map 50 from range [0, 100] to range [0, 1]
 * scale(50, 0, 100, 0, 1); // Returns 0.5
 * 
 * // Map canvas dimension to pixelation scale
 * scale(1920, 10, 2500, 0.1, 0.015); // Returns ~0.03
 */
export function scale(num, inMin, inMax, outMin, outMax) {
  // Validate input parameters
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('scale(): Invalid number provided, returning outMin');
    return outMin;
  }
  
  // Prevent division by zero
  if (inMin === inMax) {
    console.warn('scale(): Input range has zero width, returning outMin');
    return outMin;
  }
  
  // Validate ranges
  if (typeof inMin !== 'number' || typeof inMax !== 'number' || 
      typeof outMin !== 'number' || typeof outMax !== 'number') {
    console.error('scale(): All parameters must be numbers');
    return outMin;
  }
  
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Generate a random integer in a specified range
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 * 
 * @example
 * const randomDice = randomInt(1, 6); // 1, 2, 3, 4, 5, or 6
 */
export function randomInt(min, max) {
  return Math.floor(randomCryptoNumber() * (max - min + 1)) + min;
}
