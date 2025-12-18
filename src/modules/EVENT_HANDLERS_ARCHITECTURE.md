/**
 * Event Handlers Module Documentation
 * 
 * This module creates and manages all mouse and touch event handlers for
 * canvas drawing operations. It's a core part of the drawing system.
 * 
 * Drawing Process Overview:
 * ==========================
 * 
 * 1. MOUSEDOWN/TOUCHSTART:
 *    - Save current canvas to holderCanvas (for undo/comparison)
 *    - Clear tempCanvas (fresh start for new stroke)
 *    - Save starting position for area selection
 * 
 * 2. MOUSEMOVE/TOUCHMOVE (while mouse is down):
 *    - Draw brush strokes on both main canvas and tempCanvas
 *    - For round brush: interpolate between last and current position
 *    - For area brush: draw rectangle from start to current position
 *    - For tap brush: draw single circle (only on first move)
 * 
 * 3. MOUSEUP/TOUCHEND:
 *    - For PAINT mode: Strokes are already on canvas, we're done
 *    - For BLUR/UNDO modes:
 *      a. Copy original image to blurredCanvas
 *      b. Apply pixelation (cryptographic shuffling)
 *      c. Apply stackBlur (with user-selected radius, or 0 for undo)
 *      d. Mask blur to match the drawn path (source-in composite)
 *      e. Composite result back onto main canvas
 * 
 * Canvas Architecture:
 * ====================
 * - imageCanvas: Main visible canvas (composite result)
 * - tempCanvas: Temporary drawing buffer (path mask)
 * - holderCanvas: Snapshot before current operation (for comparison)
 * - rotationCanvas: Original unmodified image (for undo operations)
 * - blurredCanvas: Blur processing workspace
 * - offscreenCanvas: Utility canvas for pixelation
 * 
 * @module modules/eventHandlers
 */

// This file provides documentation and architecture notes.
// The actual implementation is in eventHandlers.js
