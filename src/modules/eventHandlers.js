/**
 * Event handlers for mouse and touch interactions
 */

import { getMousePos } from '../utils/canvas.js';
import { interpolatePath, tapDraw, areaDraw } from './drawing.js';
import { pixelateCanvas } from './pixelation.js';
import { canvasRGBA } from 'stackblur-canvas';

/**
 * Create event handlers for the canvas
 * @param {Object} canvases - Canvas objects
 * @param {Object} state - Application state
 * @returns {Object} Event handler functions
 */
export function createEventHandlers(canvases, state) {
  const {
    canvas,
    ctx,
    tempCanvas,
    tempCtx,
    holderCanvas,
    holderCtx,
    rotationCanvas,
    blurredCanvas,
    blurredCtx,
    offscreenCanvas,
    offscreenCtx,
  } = canvases;

  let isDown = false;
  let lastPos = null;
  let mouseX_start = 0;
  let mouseY_start = 0;

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = getMousePos(canvas, e);
    mouseX_start = pos.x;
    mouseY_start = pos.y;

    holderCtx.save();
    holderCtx.clearRect(0, 0, holderCanvas.width, holderCanvas.height);
    holderCtx.drawImage(canvas, 0, 0);
    holderCtx.restore();

    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    isDown = true;
    lastPos = pos;

    if (state.brush === 'tap') {
      handleMouseMove(e);
    }
  };

  const handleMouseOut = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDown) {
      handleMouseUp(e);
    }
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(canvas, e);

    if (!isDown) return;

    e.preventDefault();
    e.stopPropagation();

    drawMousePath(pos.x, pos.y);
    lastPos = pos;
  };

  const handleMouseUp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    lastPos = null;

    if (state.painting !== 'paint') {
      const tempBlurAmount = state.blurAmount;
      if (state.painting === 'undo') {
        state.blurAmount = 0;
      }

      blurredCtx.drawImage(rotationCanvas, 0, 0);

      // Pixelate if not undoing (now async with Web Worker)
      if (state.painting !== 'undo') {
        try {
          await pixelateCanvas(
            blurredCanvas,
            blurredCtx,
            offscreenCanvas,
            offscreenCtx,
            canvas
          );
        } catch (error) {
          console.error('Pixelation failed:', error);
          // Continue with blur even if pixelation fails
        }
      }

      // Apply blur
      canvasRGBA(
        blurredCanvas,
        0,
        0,
        blurredCanvas.width,
        blurredCanvas.height,
        state.blurAmount
      );

      tempCtx.save();
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.drawImage(blurredCanvas, 0, 0);
      tempCtx.restore();

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(holderCanvas, 0, 0);
      ctx.restore();

      state.blurAmount = tempBlurAmount;
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.touches.length > 1) {
      return; // Ignore multi-touch
    }

    const touch = e.changedTouches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      view: e.target.ownerDocument.defaultView,
      bubbles: true,
      cancelable: true,
      screenX: touch.screenX,
      screenY: touch.screenY,
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    touch.target.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 1) {
      return; // Ignore multi-touch
    }

    const touch = e.changedTouches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      view: e.target.ownerDocument.defaultView,
      bubbles: true,
      cancelable: true,
      screenX: touch.screenX,
      screenY: touch.screenY,
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    touch.target.dispatchEvent(mouseEvent);
  };

  const drawMousePath = (mouseX, mouseY) => {
    let paintColor = state.paintColor;

    if (state.painting === 'undo') {
      paintColor = '#ffffff';
    } else if (state.painting === 'blur') {
      paintColor = '#000000';
    } else if (state.painting === 'paint') {
      const paintColorForm = document.getElementById('paintColor');
      paintColor = paintColorForm.style.backgroundColor;
    }

    switch (state.brush) {
      case 'round':
        interpolatePath(
          ctx,
          lastPos.x,
          lastPos.y,
          mouseX,
          mouseY,
          state.brushSize,
          paintColor
        );
        interpolatePath(
          tempCtx,
          lastPos.x,
          lastPos.y,
          mouseX,
          mouseY,
          state.brushSize,
          paintColor
        );
        break;
      case 'area':
        areaDraw(
          ctx,
          mouseX,
          mouseY,
          mouseX_start,
          mouseY_start,
          true,
          paintColor,
          canvas,
          holderCanvas
        );
        areaDraw(
          tempCtx,
          mouseX,
          mouseY,
          mouseX_start,
          mouseY_start,
          false,
          paintColor,
          canvas,
          holderCanvas
        );
        break;
      case 'tap':
        tapDraw(ctx, mouseX, mouseY, state.brushSize, paintColor);
        tapDraw(tempCtx, mouseX, mouseY, state.brushSize, paintColor);
        break;
      default:
        console.error('Unknown brush type:', state.brush);
    }
  };

  return {
    handleMouseDown,
    handleMouseOut,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  };
}
