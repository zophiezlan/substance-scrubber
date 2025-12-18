/**
 * Drawing tools module - handles paint, blur, and undo operations
 */

/**
 * Draw a stroke path between two points
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {number} r - Brush radius
 * @param {string} paintColor - Color to paint with
 */
export function interpolatePath(pathCtx, x1, y1, x2, y2, r, paintColor) {
  pathCtx.strokeStyle = paintColor;
  pathCtx.fillStyle = paintColor;

  // Draw line from last point
  pathCtx.beginPath();
  pathCtx.moveTo(x1, y1);
  pathCtx.lineTo(x2, y2);
  pathCtx.closePath();
  pathCtx.lineWidth = 2 * r;
  pathCtx.stroke();

  // Draw circle at the end
  pathCtx.beginPath();
  pathCtx.arc(x2, y2, r, 0, Math.PI * 2);
  pathCtx.closePath();
  pathCtx.fill();
}

/**
 * Draw a single tap/click
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} mouseX - X coordinate
 * @param {number} mouseY - Y coordinate
 * @param {number} r - Brush radius
 * @param {string} paintColor - Color to paint with
 */
export function tapDraw(pathCtx, mouseX, mouseY, r, paintColor) {
  pathCtx.strokeStyle = paintColor;
  pathCtx.fillStyle = paintColor;

  pathCtx.beginPath();
  pathCtx.arc(mouseX, mouseY, r, 0, Math.PI * 2);
  pathCtx.closePath();
  pathCtx.fill();
}

/**
 * Draw a rectangular area
 * @param {CanvasRenderingContext2D} pathCtx - Canvas context to draw on
 * @param {number} mouseX - Current X coordinate
 * @param {number} mouseY - Current Y coordinate
 * @param {number} mouseX_start - Start X coordinate
 * @param {number} mouseY_start - Start Y coordinate
 * @param {boolean} redraw - Whether to redraw the canvas first
 * @param {string} paintColor - Color to paint with
 * @param {HTMLCanvasElement} canvas - Main canvas
 * @param {HTMLCanvasElement} holderCanvas - Holder canvas with original image
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
  // Clear any previous drawings and restore image
  pathCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw image if needed
  if (redraw) {
    pathCtx.drawImage(holderCanvas, 0, 0);
  }

  pathCtx.beginPath();

  // Calculate width and height based on start and current positions
  const width = mouseX - mouseX_start;
  const height = mouseY - mouseY_start;

  // Draw rectangle
  pathCtx.rect(mouseX_start, mouseY_start, width, height);
  pathCtx.strokeStyle = paintColor;
  pathCtx.fillStyle = paintColor;
  pathCtx.lineWidth = 10;
  pathCtx.stroke();
  pathCtx.fill();
}

/**
 * Create a custom cursor based on brush size
 * @param {HTMLCanvasElement} canvas - The main canvas
 * @param {number} brushSize - Size of the brush
 * @param {string} brush - Brush type
 */
export function setCursor(canvas, brushSize, brush) {
  if (brush === 'area') {
    canvas.style.cursor = 'crosshair';
    return;
  }

  const cursorCanvas = document.createElement('canvas');
  const scaleX = canvas.getBoundingClientRect().width / canvas.width;
  cursorCanvas.width = brushSize * 2 * scaleX;
  cursorCanvas.height = brushSize * 2 * scaleX;
  const cursorCtx = cursorCanvas.getContext('2d');

  // Black circle
  cursorCtx.strokeStyle = '#000000';
  cursorCtx.beginPath();
  cursorCtx.arc(
    cursorCanvas.width / 2,
    cursorCanvas.height / 2,
    brushSize * scaleX - 2,
    0,
    Math.PI * 2
  );
  cursorCtx.closePath();
  cursorCtx.stroke();

  // White circle for visibility against dark backgrounds
  cursorCtx.strokeStyle = '#ffffff';
  cursorCtx.beginPath();
  cursorCtx.arc(
    cursorCanvas.width / 2,
    cursorCanvas.height / 2,
    brushSize * scaleX - 1,
    0,
    Math.PI * 2
  );
  cursorCtx.closePath();
  cursorCtx.stroke();

  const cursorDataURL = cursorCanvas.toDataURL();
  canvas.style.cursor = `url(${cursorDataURL}) ${cursorCanvas.width / 2} ${
    cursorCanvas.height / 2
  }, auto`;
}
