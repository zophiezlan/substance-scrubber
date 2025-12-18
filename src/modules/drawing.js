/**
 * Drawing Tools Module
 * 
 * Provides the core drawing functions for painting, blurring, and undoing
 * operations on the canvas. Supports multiple brush types: round (freehand),
 * area (rectangle), and tap (single click).
 * 
 * @module modules/drawing
 */

import { BRUSH_TYPES, CURSOR_SIZE_SCALE, CURSOR_BORDER_OFFSET } from '../utils/constants.js';

/**
 * Cache for generated cursor images
 * Key format: "size_scale" e.g., "50_1.5"
 * @private
 */
const cursorCache = new Map();

/**
 * Clear the cursor cache (useful when memory needs to be freed)
 * 
 * @example
 * clearCursorCache(); // Free up memory
 */
export function clearCursorCache() {
  cursorCache.clear();
}

/**
 * Draw a smooth stroke path between two points (round brush mode)
 * 
 * Creates a continuous stroke by drawing a line segment between two points
 * with circles at each end. This is called repeatedly during mousemove to
 * create smooth, continuous brush strokes without gaps.
 * 
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} x1 - Starting X coordinate (previous position)
 * @param {number} y1 - Starting Y coordinate (previous position)
 * @param {number} x2 - Ending X coordinate (current position)
 * @param {number} y2 - Ending Y coordinate (current position)
 * @param {number} r - Brush radius in pixels
 * @param {string} paintColor - Color to paint (hex, rgb, or named color)
 * 
 * @example
 * // Draw a stroke from previous mouse position to current
 * interpolatePath(ctx, lastX, lastY, currentX, currentY, 25, '#000000');
 */
export function interpolatePath(pathCtx, x1, y1, x2, y2, r, paintColor) {
  // Validate context
  if (!pathCtx || typeof pathCtx.strokeStyle === 'undefined') {
    console.error('interpolatePath: Invalid canvas context');
    return;
  }
  
  // Validate coordinates
  if (typeof x1 !== 'number' || typeof y1 !== 'number' || 
      typeof x2 !== 'number' || typeof y2 !== 'number' ||
      isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    console.error('interpolatePath: Invalid coordinates');
    return;
  }
  
  // Validate radius
  if (typeof r !== 'number' || isNaN(r) || r <= 0) {
    console.warn('interpolatePath: Brush radius must be a positive number');
    return;
  }
  
  // Validate color
  if (!paintColor || typeof paintColor !== 'string') {
    console.warn('interpolatePath: Invalid paint color, using default');
    paintColor = '#000000';
  }
  
  pathCtx.strokeStyle = paintColor;
  pathCtx.fillStyle = paintColor;

  // Draw line segment connecting the two points
  pathCtx.beginPath();
  pathCtx.moveTo(x1, y1);
  pathCtx.lineTo(x2, y2);
  pathCtx.lineWidth = 2 * r;
  pathCtx.lineCap = 'round'; // Smooth line endings
  pathCtx.lineJoin = 'round'; // Smooth corners
  pathCtx.stroke();

  // Draw circle at the endpoint to ensure coverage
  // This prevents gaps when the mouse moves quickly
  pathCtx.beginPath();
  pathCtx.arc(x2, y2, r, 0, Math.PI * 2);
  pathCtx.fill();
}

/**
 * Draw a single circular stamp at a point (tap mode)
 * 
 * Creates a filled circle at the specified coordinates. Used for single-click
 * editing or when the brush is in "tap" mode.
 * 
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} mouseX - X coordinate of tap location
 * @param {number} mouseY - Y coordinate of tap location
 * @param {number} r - Radius of the circle in pixels
 * @param {string} paintColor - Fill color for the circle
 * 
 * @example
 * // Draw a 50px circle at coordinates (100, 200)
 * tapDraw(ctx, 100, 200, 50, '#FF0000');
 */
export function tapDraw(pathCtx, mouseX, mouseY, r, paintColor) {
  // Validate context
  if (!pathCtx || typeof pathCtx.fillStyle === 'undefined') {
    console.error('tapDraw: Invalid canvas context');
    return;
  }
  
  // Validate coordinates
  if (typeof mouseX !== 'number' || typeof mouseY !== 'number' ||
      isNaN(mouseX) || isNaN(mouseY)) {
    console.error('tapDraw: Invalid coordinates');
    return;
  }
  
  // Validate radius
  if (typeof r !== 'number' || isNaN(r) || r <= 0) {
    console.warn('tapDraw: Brush radius must be a positive number');
    return;
  }
  
  // Validate color
  if (!paintColor || typeof paintColor !== 'string') {
    console.warn('tapDraw: Invalid paint color, using default');
    paintColor = '#000000';
  }
  
  pathCtx.fillStyle = paintColor;

  pathCtx.beginPath();
  pathCtx.arc(mouseX, mouseY, r, 0, Math.PI * 2);
  pathCtx.fill();
}

/**
 * Draw a rectangular area (area/rectangle brush mode)
 * 
 * Draws a filled rectangle from a starting point to current mouse position.
 * Used for quickly covering large rectangular areas. The function is called
 * during mouse drag to show live preview.
 * 
 * NOTE: This function clears the canvas before drawing to show only the
 * current rectangle preview (not accumulated rectangles).
 * 
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} mouseX - Current X coordinate (drag position)
 * @param {number} mouseY - Current Y coordinate (drag position)
 * @param {number} mouseX_start - Starting X coordinate (mousedown position)
 * @param {number} mouseY_start - Starting Y coordinate (mousedown position)
 * @param {boolean} redraw - If true, redraw the holder canvas before drawing rectangle
 * @param {string} paintColor - Rectangle fill/stroke color
 * @param {HTMLCanvasElement} canvas - Main canvas (for dimensions)
 * @param {HTMLCanvasElement} holderCanvas - Canvas with image state before drag started
 * 
 * @example
 * // During mouse drag: show preview rectangle
 * areaDraw(ctx, currentX, currentY, startX, startY, true, '#000', canvas, holderCanvas);
 */
export function areaDraw(
  pathCtx,
  mouseX,
  mouseY,
  mouseX_start,
  mouseY_start,
  redraw,
  paintColor,
  canvas,
  holderCanvas
) {
  // Validate required parameters
  if (!pathCtx || typeof pathCtx.clearRect === 'undefined') {
    console.error('areaDraw: Invalid canvas context');
    return;
  }
  
  if (!canvas || typeof canvas.width === 'undefined') {
    console.error('areaDraw: Invalid canvas element');
    return;
  }
  
  // Validate coordinates
  if (typeof mouseX !== 'number' || typeof mouseY !== 'number' ||
      typeof mouseX_start !== 'number' || typeof mouseY_start !== 'number' ||
      isNaN(mouseX) || isNaN(mouseY) || isNaN(mouseX_start) || isNaN(mouseY_start)) {
    console.error('areaDraw: Invalid coordinates');
    return;
  }
  
  // Validate color
  if (!paintColor || typeof paintColor !== 'string') {
    console.warn('areaDraw: Invalid paint color, using default');
    paintColor = '#000000';
  }
  
  // Clear the canvas to remove previous rectangle preview
  pathCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Restore the original image if requested
  // This is typically true for the main canvas, false for temp canvas
  if (redraw && holderCanvas) {
    pathCtx.drawImage(holderCanvas, 0, 0);
  }

  // Calculate rectangle dimensions
  // Width and height can be negative if dragging up/left from start point
  const width = mouseX - mouseX_start;
  const height = mouseY - mouseY_start;

  // Draw filled rectangle with stroke outline
  pathCtx.fillStyle = paintColor;
  pathCtx.strokeStyle = paintColor;
  pathCtx.lineWidth = 10; // FIXME: This should scale with zoom/canvas size
  
  pathCtx.beginPath();
  pathCtx.rect(mouseX_start, mouseY_start, width, height);
  pathCtx.fill();
  pathCtx.stroke();
}

/**
 * Create and set a custom cursor matching the brush size
 * 
 * Generates a circular cursor preview that matches the actual brush size,
 * helping users see exactly where and how large their brush strokes will be.
 * The cursor includes both black and white circles for visibility on any background.
 * 
 * For area/rectangle mode, uses the standard crosshair cursor.
 * 
 * @param {HTMLCanvasElement} canvas - Main canvas element (for cursor attachment and scaling)
 * @param {number} brushSize - Brush radius in canvas pixels
 * @param {string} brush - Brush type ('round', 'area', or 'tap')
 * 
 * @example
 * // Update cursor when brush size changes
 * setCursor(canvas, 50, 'round'); // Shows 50px radius circle cursor
 * setCursor(canvas, 100, 'area'); // Shows crosshair
 */
export function setCursor(canvas, brushSize, brush) {
  if (!canvas) {
    console.error('setCursor: Canvas element is required');
    return;
  }
  
  // Use standard crosshair for rectangular selection
  if (brush === BRUSH_TYPES.AREA) {
    canvas.style.cursor = 'crosshair';
    return;
  }

  // Calculate scale for cursor
  const scaleX = canvas.getBoundingClientRect().width / canvas.width;
  
  // Create cache key
  const cacheKey = `${brushSize}_${scaleX.toFixed(3)}`;
  
  // Check cache first
  if (cursorCache.has(cacheKey)) {
    const cachedCursor = cursorCache.get(cacheKey);
    canvas.style.cursor = cachedCursor;
    return;
  }
  
  // Generate new cursor if not in cache
  const cursorCanvas = document.createElement('canvas');
  const cursorSize = brushSize * CURSOR_SIZE_SCALE * scaleX;
  
  cursorCanvas.width = cursorSize;
  cursorCanvas.height = cursorSize;
  const cursorCtx = cursorCanvas.getContext('2d');

  const centerX = cursorCanvas.width / 2;
  const centerY = cursorCanvas.height / 2;
  const radius = brushSize * scaleX;

  // Draw black circle outline (visible on light backgrounds)
  cursorCtx.strokeStyle = '#000000';
  cursorCtx.lineWidth = 2;
  cursorCtx.beginPath();
  cursorCtx.arc(centerX, centerY, radius - CURSOR_BORDER_OFFSET, 0, Math.PI * 2);
  cursorCtx.stroke();

  // Draw white circle outline (visible on dark backgrounds)
  // Slightly offset from black circle for layered effect
  cursorCtx.strokeStyle = '#ffffff';
  cursorCtx.lineWidth = 1;
  cursorCtx.beginPath();
  cursorCtx.arc(centerX, centerY, radius - (CURSOR_BORDER_OFFSET - 1), 0, Math.PI * 2);
  cursorCtx.stroke();

  // Convert canvas to data URL and create cursor CSS
  const cursorDataURL = cursorCanvas.toDataURL();
  const hotspotX = cursorCanvas.width / 2;
  const hotspotY = cursorCanvas.height / 2;
  
  const cursorCSS = `url(${cursorDataURL}) ${hotspotX} ${hotspotY}, auto`;
  
  // Cache the cursor CSS
  cursorCache.set(cacheKey, cursorCSS);
  
  // Limit cache size to prevent memory issues
  if (cursorCache.size > 50) {
    // Remove oldest entry (first key in Map)
    const firstKey = cursorCache.keys().next().value;
    cursorCache.delete(firstKey);
  }
  
  // Apply cursor
  canvas.style.cursor = cursorCSS;
}
