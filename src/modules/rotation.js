/**
 * Image rotation module
 */

let rotating = false;

/**
 * Rotate all canvases 90 degrees clockwise
 * @param {Object} canvases - Object containing all canvas elements and contexts
 */
export function rotateCanvas(canvases) {
  if (rotating) return;

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

  rotating = true;

  // Store current data to images
  const myImageData = new Image();
  const tempImageData = new Image();
  const rotationImageData = new Image();
  const blurredImageData = new Image();

  myImageData.src = canvas.toDataURL();
  tempImageData.src = tempCanvas.toDataURL();
  rotationImageData.src = rotationCanvas.toDataURL();
  blurredImageData.src = blurredCanvas.toDataURL();

  myImageData.onload = () => {
    // Swap dimensions
    const cw = canvas.height;
    const ch = canvas.width;

    canvas.width =
      tempCanvas.width =
      holderCanvas.width =
      rotationCanvas.width =
      blurredCanvas.width =
        cw;
    canvas.height =
      tempCanvas.height =
      holderCanvas.height =
      rotationCanvas.height =
      blurredCanvas.height =
        ch;

    // Rotate main canvas
    ctx.save();
    ctx.translate(cw, ch / cw);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(myImageData, 0, 0);
    ctx.restore();

    // Rotate temp canvas
    tempCtx.save();
    tempCtx.translate(cw, ch / cw);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.drawImage(tempImageData, 0, 0);
    tempCtx.restore();

    // Rotate rotation canvas
    rotationCtx.save();
    rotationCtx.translate(cw, ch / cw);
    rotationCtx.rotate(Math.PI / 2);
    rotationCtx.drawImage(rotationImageData, 0, 0);
    rotationCtx.restore();

    // Rotate blurred canvas
    blurredCtx.save();
    blurredCtx.translate(cw, ch / cw);
    blurredCtx.rotate(Math.PI / 2);
    blurredCtx.drawImage(rotationImageData, 0, 0);
    blurredCtx.restore();

    rotating = false;
  };
}
