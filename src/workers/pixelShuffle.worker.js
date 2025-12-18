/**
 * Web Worker for Pixel Shuffling
 * 
 * Offloads computationally expensive pixel shuffling operations to a separate
 * thread, keeping the main UI thread responsive during processing.
 * 
 * This worker receives pixel data and canvas dimensions, performs cryptographic
 * pixel shuffling with noise injection, and returns the modified pixel data.
 */

/**
 * Generate cryptographically secure random number between 0 and 1
 * @returns {number} Random number [0, 1)
 */
function randomCryptoNumber() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  // Fallback to Math.random in worker (less secure but functional)
  console.warn('Crypto API not available in worker, using Math.random');
  return Math.random();
}

/**
 * Generate random positive or negative multiplier
 * @returns {number} Either 1 or -1
 */
function negativeOrPositive() {
  return randomCryptoNumber() > 0.5 ? 1 : -1;
}

/**
 * Shuffle pixel data with cryptographic randomness
 * 
 * @param {Uint8ClampedArray} array - Raw pixel data (RGBA format)
 * @param {number} canvasWidth - Canvas width for dimension calculations
 * @param {number} canvasHeight - Canvas height for dimension calculations
 * @param {number} shuffleRangeDivisor - Divisor for shuffle range calculation
 * @param {number} pixelNoiseRange - Range of noise to add to pixels
 * @returns {Uint8ClampedArray} Shuffled pixel data
 */
function shufflePixels(array, canvasWidth, canvasHeight, shuffleRangeDivisor, pixelNoiseRange) {
  const biggerDimension = Math.max(canvasWidth, canvasHeight);
  const holderArray = [];

  // Collect all non-black pixels
  for (let i = 0, n = array.length; i < n; i += 4) {
    const red = array[i];
    const green = array[i + 1];
    const blue = array[i + 2];

    if (red + green + blue !== 0) {
      holderArray.push([i, array[i], array[i + 1], array[i + 2]]);
    }
  }

  // Shuffle each pixel with a nearby pixel + add noise
  for (let x = 0; x < holderArray.length; x++) {
    const maxOffset = biggerDimension / shuffleRangeDivisor;
    const randomOffset = Math.floor(
      randomCryptoNumber() * maxOffset * negativeOrPositive()
    );
    
    const randomElement = x + randomOffset;

    // Bounds check
    const safeElement =
      randomElement >= holderArray.length || randomElement < 0
        ? x
        : randomElement;

    // Swap pixels and add cryptographic noise
    array[holderArray[x][0]] =
      holderArray[safeElement][1] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * pixelNoiseRange);
    array[holderArray[x][0] + 1] =
      holderArray[safeElement][2] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * pixelNoiseRange);
    array[holderArray[x][0] + 2] =
      holderArray[safeElement][3] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * pixelNoiseRange);
  }

  return array;
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  const { 
    pixelData, 
    canvasWidth, 
    canvasHeight, 
    shuffleRangeDivisor, 
    pixelNoiseRange 
  } = event.data;

  try {
    // Perform shuffling
    const shuffledData = shufflePixels(
      pixelData,
      canvasWidth,
      canvasHeight,
      shuffleRangeDivisor,
      pixelNoiseRange
    );

    // Send result back to main thread
    self.postMessage({
      success: true,
      pixelData: shuffledData
    }, [shuffledData.buffer]); // Transfer ownership for better performance

  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      success: false,
      error: error.message || 'Unknown error in worker'
    });
  }
});
