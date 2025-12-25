/**
 * Pixelation and Pixel Shuffling Module
 * 
 * Provides cryptographically secure pixelation and pixel shuffling for privacy.
 * This is a core privacy feature that makes it computationally infeasible to
 * reconstruct the original image from the blurred regions.
 * 
 * The algorithm:
 * 1. Downsamples the image to create pixelation effect
 * 2. Shuffles pixels within a local neighborhood using crypto-random positions (via Web Worker)
 * 3. Adds random noise to each pixel to prevent pixel-perfect reconstruction
 * 
 * PERFORMANCE: Pixel shuffling is offloaded to a Web Worker to keep the UI responsive
 * during processing of large images.
 * 
 * @module modules/pixelation
 * @see {@link https://en.wikipedia.org/wiki/Pixelization}
 */

import {
  randomCryptoNumber,
  negativeOrPositive,
  scale,
} from '../utils/crypto.js';

import {
  PIXELATION_MIN_DIMENSION,
  PIXELATION_BASE_DIMENSION,
  MIN_PIXELATION_SCALE,
  MAX_PIXELATION_SCALE,
  PIXEL_NOISE_RANGE,
  SHUFFLE_RANGE_DIVISOR,
} from '../utils/constants.js';

// Import Web Worker for pixel shuffling
import PixelShuffleWorker from '../workers/pixelShuffle.worker.js?worker';

// Worker instance (reused across calls for efficiency)
let shuffleWorker = null;

/**
 * Get or create the pixel shuffle worker instance
 * @returns {Worker} Worker instance
 * @private
 */
function getShuffleWorker() {
  if (!shuffleWorker) {
    shuffleWorker = new PixelShuffleWorker();
  }
  return shuffleWorker;
}

/**
 * Pixelate and shuffle canvas pixels for enhanced privacy
 * 
 * Creates a pixelated effect by downsampling the image, then shuffles pixels
 * within a cryptographically random neighborhood and adds noise. This three-layer
 * approach (pixelation + shuffling + noise) makes it extremely difficult to
 * reverse engineer the original image content.
 * 
 * ASYNC: This function now returns a Promise as pixel shuffling is performed
 * in a Web Worker to keep the UI responsive.
 * 
 * @param {HTMLCanvasElement} inCanvas - Canvas containing the area to pixelate
 * @param {CanvasRenderingContext2D} inCtx - Context for the input canvas
 * @param {HTMLCanvasElement} offscreenCanvas - Temporary canvas for processing
 * @param {CanvasRenderingContext2D} offscreenCtx - Context for offscreen canvas
 * @param {HTMLCanvasElement} mainCanvas - Main canvas (used for dimension scaling)
 * @returns {Promise<void>} Resolves when pixelation is complete
 * @throws {Error} If canvas parameters are invalid or worker fails
 * 
 * @example
 * await pixelateCanvas(blurredCanvas, blurredCtx, offscreenCanvas, offscreenCtx, mainCanvas);
 */
export async function pixelateCanvas(
  inCanvas,
  inCtx,
  offscreenCanvas,
  offscreenCtx,
  mainCanvas
) {
  // TODO: Add input validation for all canvas parameters
  if (!inCanvas || !inCtx || !offscreenCanvas || !offscreenCtx || !mainCanvas) {
    console.error('pixelateCanvas: Missing required canvas parameters');
    return;
  }
  
  // Calculate pixelation size based on image dimensions
  // Larger images get smaller pixels for consistent visual effect
  const biggerDimension = Math.max(inCanvas.width, inCanvas.height);
  const size = scale(
    biggerDimension,
    PIXELATION_MIN_DIMENSION,
    PIXELATION_BASE_DIMENSION,
    MAX_PIXELATION_SCALE,
    MIN_PIXELATION_SCALE
  );
  
  // OPTIMIZE: Consider caching these calculations if dimensions don't change
  const w = Math.floor(inCanvas.width * size);
  const h = Math.floor(inCanvas.height * size);

  // Ensure minimum dimensions to prevent canvas errors
  if (w < 1 || h < 1) {
    console.warn('pixelateCanvas: Calculated dimensions too small, skipping pixelation');
    return;
  }

  offscreenCanvas.width = inCanvas.width;
  offscreenCanvas.height = inCanvas.height;

  // Step 1: Downsample to create pixelation effect
  offscreenCtx.drawImage(inCanvas, 0, 0, w, h);
  
  // HACK: This scale call seems incorrect - might be leftover from debugging
  // The scaling should happen via drawImage parameters, not context.scale()
  // XXX: Verify this doesn't break existing functionality before removing
  offscreenCtx.scale(w * size, h * size);

  inCtx.save();

  // Step 2: Enlarge the pixelated image back to full size
  inCtx.drawImage(
    offscreenCanvas,
    0,
    0,
    w,
    h,
    0,
    0,
    inCanvas.width,
    inCanvas.height
  );

  // Step 3: Get pixel data and shuffle with crypto-random positions
  const pixelArray = offscreenCtx.getImageData(0, 0, w, h);
  
  // NOTE: ImageData.data is a read-only Uint8ClampedArray in the browser API.
  // We must use .set() to copy values into it rather than reassigning the property.
  try {
    // Shuffle pixels in Web Worker for better performance
    const shuffledData = await shufflePixelsAsync(pixelArray.data, mainCanvas);
    pixelArray.data.set(shuffledData);
  } catch (error) {
    console.error('Pixel shuffling failed, falling back to synchronous:', error);
    // Fallback to synchronous shuffling if worker fails
    const shuffledData = shufflePixelsSync(pixelArray.data, mainCanvas);
    pixelArray.data.set(shuffledData);
  }

  offscreenCtx.putImageData(pixelArray, 0, 0);

  // Step 4: Draw the shuffled result back to input canvas
  inCtx.drawImage(
    offscreenCanvas,
    0,
    0,
    w,
    h,
    0,
    0,
    inCanvas.width,
    inCanvas.height
  );

  inCtx.restore();
}

/**
 * Shuffle pixel data using Web Worker (async)
 * 
 * Offloads pixel shuffling to a Web Worker to keep the main thread responsive.
 * This is especially important for large images where shuffling can take 100ms+.
 * 
 * @param {Uint8ClampedArray} array - Raw pixel data (RGBA format, 4 bytes per pixel)
 * @param {HTMLCanvasElement} canvas - Reference canvas for dimension calculations
 * @returns {Promise<Uint8ClampedArray>} Modified pixel data with shuffled and noised pixels
 * @throws {Error} If worker fails to process the data
 * 
 * @private
 */
async function shufflePixelsAsync(array, canvas) {
  return new Promise((resolve, reject) => {
    const worker = getShuffleWorker();
    
    // Create a copy of the pixel data to send to worker
    const pixelDataCopy = new Uint8ClampedArray(array);
    
    // Handle worker response
    const handleMessage = (event) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      
      if (event.data.success) {
        resolve(new Uint8ClampedArray(event.data.pixelData));
      } else {
        reject(new Error(event.data.error || 'Worker processing failed'));
      }
    };
    
    // Handle worker error
    const handleError = (error) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      reject(new Error(`Worker error: ${error.message}`));
    };
    
    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    
    // Send data to worker
    worker.postMessage({
      pixelData: pixelDataCopy,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      shuffleRangeDivisor: SHUFFLE_RANGE_DIVISOR,
      pixelNoiseRange: PIXEL_NOISE_RANGE
    });
  });
}

/**
 * Shuffle pixel data synchronously (fallback)
 * 
 * Synchronous version of pixel shuffling for fallback when Web Worker fails.
 * This will block the main thread but ensures functionality.
 * 
 * NOTE: Only non-black pixels are shuffled (to preserve the blur mask)
 * 
 * @param {Uint8ClampedArray} array - Raw pixel data (RGBA format, 4 bytes per pixel)
 * @param {HTMLCanvasElement} canvas - Reference canvas for dimension calculations
 * @returns {Uint8ClampedArray} Modified pixel data with shuffled and noised pixels
 * 
 * @private
 */
function shufflePixelsSync(array, canvas) {
  // OPTIMIZE: This function is performance-critical for large images
  
  const biggerDimension = Math.max(canvas.width, canvas.height);
  const holderArray = [];

  // Collect all non-black pixels (black pixels = untouched areas from the mask)
  for (let i = 0, n = array.length; i < n; i += 4) {
    const red = array[i];
    const green = array[i + 1];
    const blue = array[i + 2];
    // Alpha is at i + 3, but we don't check it

    // NOTE: We use red + green + blue !== 0 to identify "active" pixels
    // This means pure black (#000000) in the original image will not be shuffled
    // TODO: Consider using alpha channel instead for more reliable masking
    if (red + green + blue !== 0) {
      holderArray.push([i, array[i], array[i + 1], array[i + 2]]);
    }
  }

  // Shuffle each pixel with a nearby pixel + add noise
  for (let x = 0; x < holderArray.length; x++) {
    // Calculate a random offset within a neighborhood
    // Neighborhood size scales with image dimensions for consistent effect
    const maxOffset = biggerDimension / SHUFFLE_RANGE_DIVISOR;
    const randomOffset = Math.floor(
      randomCryptoNumber() * maxOffset * negativeOrPositive()
    );
    
    const randomElement = x + randomOffset;

    // Bounds check - if out of range, use current element
    const safeElement =
      randomElement >= holderArray.length || randomElement < 0
        ? x
        : randomElement;

    // Swap pixels and add cryptographic noise
    // NOTE: Noise range is ±3 which is generally imperceptible but prevents reconstruction
    array[holderArray[x][0]] =
      holderArray[safeElement][1] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * PIXEL_NOISE_RANGE);
    array[holderArray[x][0] + 1] =
      holderArray[safeElement][2] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * PIXEL_NOISE_RANGE);
    array[holderArray[x][0] + 2] =
      holderArray[safeElement][3] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * PIXEL_NOISE_RANGE);
    // Alpha channel (i + 3) is not modified
  }

  return array;
}
