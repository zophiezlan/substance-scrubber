/**
 * Image processing module - loading, saving, and EXIF handling
 */

/**
 * Save the current canvas as a PNG file
 * @param {HTMLCanvasElement} canvas - Canvas to save
 * @param {string} filename - Original filename
 */
export function saveImage(canvas, filename) {
  canvas.toBlob(
    (blob) => {
      const link = document.createElement('a');

      const nameWithoutPath = filename.replace(/.*[\\/]([^\\/]+)$/, '$1');
      const nameWithoutExtension = nameWithoutPath.replace(/\.[^.]*$/, '');

      link.download = `${nameWithoutExtension}_scrubbed.png`;
      link.href = URL.createObjectURL(blob);
      link.click();

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    },
    'image/png',
    0.8
  );
}

