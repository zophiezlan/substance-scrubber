import {
  randomCryptoNumber,
  negativeOrPositive,
  scale,
} from '../utils/crypto.js';

/**
 * Pixelate and shuffle canvas pixels for enhanced privacy
 * @param {HTMLCanvasElement} inCanvas - Canvas to pixelate
 * @param {CanvasRenderingContext2D} inCtx - Canvas context
 * @param {HTMLCanvasElement} offscreenCanvas - Offscreen canvas for processing
 * @param {CanvasRenderingContext2D} offscreenCtx - Offscreen canvas context
 * @param {HTMLCanvasElement} mainCanvas - Main canvas (for dimension reference)
 */
export function pixelateCanvas(
  inCanvas,
  inCtx,
  offscreenCanvas,
  offscreenCtx,
  mainCanvas
) {
  const biggerDimension = Math.max(inCanvas.width, inCanvas.height);
  const size = scale(biggerDimension, 10, 2500, 0.1, 0.015);
  const w = inCanvas.width * size;
  const h = inCanvas.height * size;

  offscreenCanvas.width = inCanvas.width;
  offscreenCanvas.height = inCanvas.height;

  offscreenCtx.drawImage(inCanvas, 0, 0, w, h);
  offscreenCtx.scale(w * size, h * size);

  inCtx.save();

  // Enlarge the minimized image to full size
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

  const pixelArray = offscreenCtx.getImageData(0, 0, w, h);
  pixelArray.data = shufflePixels(pixelArray.data, mainCanvas);

  offscreenCtx.putImageData(pixelArray, 0, 0);

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
 * Shuffle pixel data with cryptographic randomness for privacy
 * @param {Uint8ClampedArray} array - Pixel data array
 * @param {HTMLCanvasElement} canvas - Reference canvas for dimensions
 * @returns {Uint8ClampedArray} Shuffled pixel data
 */
function shufflePixels(array, canvas) {
  const biggerDimension = Math.max(canvas.width, canvas.height);
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

  // Shuffle pixels with nearby pixels and add noise
  for (let x = 0; x < holderArray.length; x++) {
    const randomElement =
      x +
      Math.floor(
        randomCryptoNumber() * (biggerDimension / 100) * negativeOrPositive()
      );

    const safeElement =
      randomElement >= holderArray.length || randomElement < 0
        ? x
        : randomElement;

    // Add noise to prevent stitching pixels back together
    array[holderArray[x][0]] =
      holderArray[safeElement][1] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * 3);
    array[holderArray[x][0] + 1] =
      holderArray[safeElement][2] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * 3);
    array[holderArray[x][0] + 2] =
      holderArray[safeElement][3] +
      Math.round(randomCryptoNumber() * negativeOrPositive() * 3);
  }

  return array;
}
