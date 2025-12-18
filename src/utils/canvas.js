/**
 * Canvas utility functions
 */

/**
 * Get mouse position relative to canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {MouseEvent} evt - The mouse event
 * @returns {{x: number, y: number}} Mouse coordinates
 */
export function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

/**
 * Setup all canvases
 * @returns {Object} Object containing all canvas elements and contexts
 */
export function setupCanvases() {
  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');

  const tempCanvas = document.getElementById('tempCanvas');
  const tempCtx = tempCanvas.getContext('2d');

  const holderCanvas = document.getElementById('holderCanvas');
  const holderCtx = holderCanvas.getContext('2d');

  const rotationCanvas = document.getElementById('rotationCanvas');
  const rotationCtx = rotationCanvas.getContext('2d');

  const blurredCanvas = document.getElementById('blurredCanvas');
  const blurredCtx = blurredCanvas.getContext('2d');

  const offscreenCanvas = document.getElementById('offscreenCanvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  return {
    canvas,
    ctx,
    tempCanvas,
    tempCtx,
    holderCanvas,
    holderCtx,
    rotationCanvas,
    rotationCtx,
    blurredCanvas,
    blurredCtx,
    offscreenCanvas,
    offscreenCtx,
  };
}
