/**
 * Cryptographically secure random number generation
 */

/**
 * Generate a cryptographically secure random number between 0 and 1
 * @returns {number} Random number between 0 and 1
 */
export function randomCryptoNumber() {
  const buf = new Uint8Array(1);
  window.crypto.getRandomValues(buf);
  return buf[0] / 255;
}

/**
 * Randomly return -1 or 1
 * @returns {number} -1 or 1
 */
export function negativeOrPositive() {
  return randomCryptoNumber() < 0.5 ? -1 : 1;
}

/**
 * Scale a number from one range to another
 * @param {number} num - Number to scale
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Scaled number
 */
export function scale(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
