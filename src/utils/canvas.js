/**
 * Canvas Utility Functions
 * 
 * Helper functions for canvas initialization, coordinate transformation,
 * and canvas management throughout the application.
 * 
 * @module utils/canvas
 */

/**
 * Clear the canvas rect cache (deprecated - no-op for backwards compatibility)
 * 
 * This function is kept for backwards compatibility but does nothing since
 * we no longer cache canvas bounding rectangles. The cache was causing
 * positioning issues when the canvas moved, scrolled, or browser zoomed.
 * 
 * @deprecated This function no longer does anything and can be safely removed
 * @example
 * clearCanvasRectCache(); // No-op
 */
export function clearCanvasRectCache() {
  // No-op: We no longer cache canvas bounding rects
  // getBoundingClientRect() is called fresh on every mouse event for accuracy
}

/**
 * Get mouse/touch position relative to canvas accounting for scaling
 * 
 * Transforms screen coordinates (from mouse/touch events) to canvas coordinates.
 * This is necessary because the canvas may be scaled via CSS while maintaining
 * its internal resolution, so screen pixels != canvas pixels.
 * 
 * Note: We recalculate the bounding rect on every call to ensure accuracy.
 * getBoundingClientRect() is fast enough for mouse events and this prevents
 * stale position data when the canvas moves, is scrolled, or browser zooms.
 * 
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {MouseEvent|Touch} evt - Mouse event or touch object with clientX/clientY
 * @returns {{x: number, y: number}} Coordinates in canvas space
 * @throws {Error} If canvas or event is null/undefined
 * 
 * @example
 * canvas.addEventListener('mousemove', (e) => {
 *   const pos = getMousePos(canvas, e);
 *   console.log(`Canvas coords: ${pos.x}, ${pos.y}`);
 * });
 */
export function getMousePos(canvas, evt) {
  if (!canvas || !evt) {
    console.error('getMousePos: Invalid canvas or event object');
    return { x: 0, y: 0 };
  }
  
  // Get fresh bounding rect to ensure accurate positioning
  // This prevents issues with scrolling, zooming, or canvas movement
  const rect = canvas.getBoundingClientRect();
  
  const scaleX = canvas.width / (rect.right - rect.left);
  const scaleY = canvas.height / (rect.bottom - rect.top);
  
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

/**
 * Setup and initialize all canvases used in the application
 * 
 * The application uses multiple canvases for different purposes:
 * - imageCanvas: Main visible canvas where user sees the image
 * - tempCanvas: Temporary drawing buffer for brush strokes
 * - holderCanvas: Stores the image state before current operation
 * - rotationCanvas: Holds original unmodified image for rotation
 * - blurredCanvas: Temporary canvas for blur operations
 * - offscreenCanvas: Used for pixelation and other processing
 * 
 * @returns {Object} Object containing all canvas elements and their 2D contexts
 * @returns {HTMLCanvasElement} returns.canvas - Main display canvas
 * @returns {CanvasRenderingContext2D} returns.ctx - Main canvas context
 * @returns {HTMLCanvasElement} returns.tempCanvas - Temporary drawing canvas
 * @returns {CanvasRenderingContext2D} returns.tempCtx - Temp canvas context
 * @returns {HTMLCanvasElement} returns.holderCanvas - State holder canvas
 * @returns {CanvasRenderingContext2D} returns.holderCtx - Holder canvas context
 * @returns {HTMLCanvasElement} returns.rotationCanvas - Rotation buffer canvas
 * @returns {CanvasRenderingContext2D} returns.rotationCtx - Rotation canvas context
 * @returns {HTMLCanvasElement} returns.blurredCanvas - Blur processing canvas
 * @returns {CanvasRenderingContext2D} returns.blurredCtx - Blur canvas context
 * @returns {HTMLCanvasElement} returns.offscreenCanvas - Offscreen processing canvas
 * @returns {CanvasRenderingContext2D} returns.offscreenCtx - Offscreen canvas context
 * @throws {Error} If any required canvas element is not found in the DOM
 * 
 * @example
 * const canvases = setupCanvases();
 * canvases.ctx.drawImage(image, 0, 0);
 */
export function setupCanvases() {
  // NOTE: All canvas IDs must match those in index.html
  const canvasIds = [
    'imageCanvas',
    'tempCanvas', 
    'holderCanvas',
    'rotationCanvas',
    'blurredCanvas',
    'offscreenCanvas'
  ];
  
  // FIXME: Add proper error handling if canvas elements are missing
  const canvas = document.getElementById('imageCanvas');
  const tempCanvas = document.getElementById('tempCanvas');
  const holderCanvas = document.getElementById('holderCanvas');
  const rotationCanvas = document.getElementById('rotationCanvas');
  const blurredCanvas = document.getElementById('blurredCanvas');
  const offscreenCanvas = document.getElementById('offscreenCanvas');
  
  // Validate all canvases exist
  if (!canvas || !tempCanvas || !holderCanvas || !rotationCanvas || !blurredCanvas || !offscreenCanvas) {
    const missingCanvases = canvasIds.filter(id => !document.getElementById(id));
    throw new Error(`Missing required canvas elements: ${missingCanvases.join(', ')}`);
  }
  
  // Get 2D contexts - these should never fail for canvas elements
  const ctx = canvas.getContext('2d');
  const tempCtx = tempCanvas.getContext('2d');
  const holderCtx = holderCanvas.getContext('2d');
  const rotationCtx = rotationCanvas.getContext('2d');
  const blurredCtx = blurredCanvas.getContext('2d');
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

/**
 * Clear a canvas and reset its dimensions
 * 
 * @param {HTMLCanvasElement} canvas - Canvas to clear
 * @param {number} [width=1] - New width (defaults to 1 to minimize memory)
 * @param {number} [height=1] - New height (defaults to 1 to minimize memory)
 * 
 * @example
 * clearCanvas(canvas, 800, 600); // Clear and resize to 800x600
 * clearCanvas(canvas); // Clear and minimize to 1x1
 */
export function clearCanvas(canvas, width = 1, height = 1) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
  }
}
