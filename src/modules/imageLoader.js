/**
 * Image loading and initialization module
 */

import { extractExifData, displayExifData } from './exifHandler.js';

/**
 * Load an image file and initialize canvases
 * @param {File} file - Image file to load
 * @param {Object} canvases - Canvas objects
 * @param {Function} onImageLoaded - Callback when image is loaded
 * @returns {Promise<Object>} Image metadata
 */
export async function loadImage(file, canvases, onImageLoaded) {
  const {
    canvas,
    ctx,
    tempCanvas,
    rotationCanvas,
    rotationCtx,
    blurredCanvas,
    holderCanvas,
  } = canvases;

  // Extract EXIF data first
  const exifData = await extractExifData(file);

  // Display EXIF data to user
  displayExifData(exifData, () => {
    if (onImageLoaded) onImageLoaded();
  });

  // Load image
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Unable to read file.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Unsupported or corrupted image.'));

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        let width = img.width;
        let height = img.height;
        const maxDimension = 2500;

        // Scale down if too large
        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        // Set canvas dimensions
        canvas.width =
          tempCanvas.width =
          rotationCanvas.width =
          blurredCanvas.width =
          holderCanvas.width =
            width;
        canvas.height =
          tempCanvas.height =
          rotationCanvas.height =
          blurredCanvas.height =
          holderCanvas.height =
            height;

        // Draw image on canvases
        ctx.drawImage(img, 0, 0, width, height);
        rotationCtx.drawImage(img, 0, 0, width, height);

        resolve({
          filename: file.name,
          originalWidth,
          originalHeight,
          width,
          height,
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Setup drag and drop functionality
 * @param {Function} onFileDropped - Callback when file is dropped
 */
export function setupDragAndDrop(onFileDropped) {
  const dropZone = document.getElementById('drop-zone');
  const body = document.body;

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    body.addEventListener(eventName, preventDefaults, false);
    if (dropZone) {
      dropZone.addEventListener(eventName, preventDefaults, false);
    }
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop zone when item is dragged over
  ['dragenter', 'dragover'].forEach((eventName) => {
    body.addEventListener(
      eventName,
      () => body.classList.add('dragging'),
      false
    );
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    body.addEventListener(
      eventName,
      () => body.classList.remove('dragging'),
      false
    );
  });

  // Handle dropped files
  body.addEventListener('drop', handleDrop, false);
  if (dropZone) {
    dropZone.addEventListener('drop', handleDrop, false);
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      onFileDropped(files[0]);
    }
  }
}
