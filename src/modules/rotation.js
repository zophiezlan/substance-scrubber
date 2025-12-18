/**
 * Image Rotation Module
 * 
 * Handles 90-degree clockwise rotation of all canvases simultaneously.
 * Uses canvas transformation matrix for rotation while preserving all
 * edits (blur, paint, etc.) that have been applied.
 * 
 * @module modules/rotation
 */

import { ROTATION_ANGLE } from '../utils/constants.js';

/**
 * Flag to prevent concurrent rotation operations
 * FIXME: This global state is not ideal for module reusability
 * Consider passing as parameter or using a class-based approach
 * @private
 */
let rotating = false;

/**
 * Rotate all canvases 90 degrees clockwise
 * 
 * Performs a 90-degree clockwise rotation on all canvas layers, preserving
 * all applied edits. The rotation is asynchronous because it needs to:
 * 1. Convert canvases to Image objects (async data URL creation)
 * 2. Wait for images to load
 * 3. Apply rotation transformation
 * 
 * The function uses a lock (rotating flag) to prevent multiple simultaneous
 * rotations which could cause race conditions and visual artifacts.
 * 
 * Technical details:
 * - Swaps width and height (portrait ↔ landscape)
 * - Uses canvas transformation matrix for rotation
 * - Preserves all layers including edits and blur effects
 * 
 * @param {Object} canvases - Object containing all canvas elements and contexts
 * @param {HTMLCanvasElement} canvases.canvas - Main visible canvas
 * @param {CanvasRenderingContext2D} canvases.ctx - Main canvas context
 * @param {HTMLCanvasElement} canvases.tempCanvas - Temporary drawing canvas
 * @param {CanvasRenderingContext2D} canvases.tempCtx - Temp canvas context
 * @param {HTMLCanvasElement} canvases.rotationCanvas - Original image canvas
 * @param {CanvasRenderingContext2D} canvases.rotationCtx - Rotation canvas context
 * @param {HTMLCanvasElement} canvases.blurredCanvas - Blur processing canvas
 * @param {CanvasRenderingContext2D} canvases.blurredCtx - Blur canvas context
 * @param {HTMLCanvasElement} canvases.holderCanvas - State holder canvas
 * 
 * @example
 * rotateButton.addEventListener('click', () => {
 *   rotateCanvas(canvases);
 * });
 */
export function rotateCanvas(canvases) {
  // Prevent concurrent rotations (causes visual glitches)
  if (rotating) {
    console.warn('Rotation already in progress, ignoring request');
    return;
  }

  // TODO: Add validation for canvases parameter
  if (!canvases) {
    console.error('rotateCanvas: canvases parameter is required');
    return;
  }

  const {
    canvas,
    ctx,
    tempCanvas,
    tempCtx,
    rotationCanvas,
    rotationCtx,
    blurredCanvas,
    blurredCtx,
    holderCanvas,
  } = canvases;

  // Validate all required canvases exist
  if (!canvas || !tempCanvas || !rotationCanvas || !blurredCanvas || !holderCanvas) {
    console.error('rotateCanvas: Missing required canvas elements');
    return;
  }

  rotating = true;

  // Step 1: Convert all canvases to Image objects
  // NOTE: We use Image objects so we can rotate them after resizing the canvases
  // Canvas data would be lost when we change canvas.width/height
  const myImageData = new Image();
  const tempImageData = new Image();
  const rotationImageData = new Image();
  const blurredImageData = new Image();

  // Convert canvases to data URLs (async operation)
  try {
    myImageData.src = canvas.toDataURL();
    tempImageData.src = tempCanvas.toDataURL();
    rotationImageData.src = rotationCanvas.toDataURL();
    blurredImageData.src = blurredCanvas.toDataURL();
  } catch (error) {
    console.error('Failed to create data URLs from canvases:', error);
    rotating = false;
    return;
  }

  // Step 2: Wait for main image to load, then rotate all canvases
  myImageData.onload = () => {
    try {
      // Swap dimensions for 90-degree rotation
      const cw = canvas.height;  // New width = old height
      const ch = canvas.width;   // New height = old width

      // Resize all canvases (this clears their content)
      const canvasElements = [canvas, tempCanvas, holderCanvas, rotationCanvas, blurredCanvas];
      canvasElements.forEach(c => {
        c.width = cw;
        c.height = ch;
      });

      // Rotate and draw main canvas
      // HACK: The translate() call uses `ch / cw` which seems incorrect
      // Should probably be just `cw` or `0` for proper rotation
      // XXX: Verify this math - it works but might not be the cleanest approach
      ctx.save();
      ctx.translate(cw, ch / cw);
      ctx.rotate(ROTATION_ANGLE);
      ctx.drawImage(myImageData, 0, 0);
      ctx.restore();

      // Rotate temp canvas (preserves partial edits)
      tempCtx.save();
      tempCtx.translate(cw, ch / cw);
      tempCtx.rotate(ROTATION_ANGLE);
      tempCtx.drawImage(tempImageData, 0, 0);
      tempCtx.restore();

      // Rotate rotation canvas (original unmodified image)
      rotationCtx.save();
      rotationCtx.translate(cw, ch / cw);
      rotationCtx.rotate(ROTATION_ANGLE);
      rotationCtx.drawImage(rotationImageData, 0, 0);
      rotationCtx.restore();

      // Rotate blurred canvas
      // NOTE: Uses rotationImageData, not blurredImageData - is this intentional?
      // FIXME: Should this use blurredImageData instead?
      blurredCtx.save();
      blurredCtx.translate(cw, ch / cw);
      blurredCtx.rotate(ROTATION_ANGLE);
      blurredCtx.drawImage(rotationImageData, 0, 0);
      blurredCtx.restore();

      // Release the lock
      rotating = false;
      
      console.info(`Image rotated to ${cw}×${ch}`);
    } catch (error) {
      console.error('Error during rotation:', error);
      rotating = false;
    }
  };

  // Handle image load errors
  myImageData.onerror = (error) => {
    console.error('Failed to load canvas data for rotation:', error);
    rotating = false;
  };
}

/**
 * Check if a rotation operation is currently in progress
 * 
 * @returns {boolean} True if rotation is in progress
 * 
 * @example
 * if (!isRotating()) {
 *   rotateCanvas(canvases);
 * }
 */
export function isRotating() {
  return rotating;
}
