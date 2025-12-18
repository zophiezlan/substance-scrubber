/**
 * Image Loading and File Handling Module
 * 
 * Handles loading image files from user input, extracting EXIF metadata,
 * and initializing canvas elements with the loaded image. Includes support
 * for drag-and-drop and automatic image scaling for performance.
 * 
 * @module modules/imageLoader
 */

import { extractExifData, displayExifData } from './exifHandler.js';
import { MAX_IMAGE_DIMENSION, MAX_FILE_SIZE } from '../utils/constants.js';

/**
 * Load and process an image file
 * 
 * This function orchestrates the entire image loading process:
 * 1. Extract and display EXIF metadata (for privacy transparency)
 * 2. Load the image file as a data URL
 * 3. Scale down large images for performance
 * 4. Initialize all canvases with the image
 * 
 * Large images (>2500px) are automatically scaled down to prevent performance
 * issues and excessive memory usage during canvas operations.
 * 
 * @param {File} file - Image file from file input or drag-and-drop
 * @param {Object} canvases - Object containing all canvas elements and contexts
 * @param {Function} [onImageLoaded] - Optional callback fired after image loads
 * @returns {Promise<Object>} Resolves with image metadata
 * @returns {string} returns.filename - Original filename
 * @returns {number} returns.originalWidth - Original image width before scaling
 * @returns {number} returns.originalHeight - Original image height before scaling
 * @returns {number} returns.width - Scaled/final width used in canvas
 * @returns {number} returns.height - Scaled/final height used in canvas
 * @throws {Error} If file cannot be read or image is corrupted
 * 
 * @example
 * const metadata = await loadImage(file, canvases, () => {
 *   console.log('Image loaded and ready');
 * });
 * console.log(`Loaded ${metadata.filename} at ${metadata.width}x${metadata.height}`);
 */
export async function loadImage(file, canvases, onImageLoaded) {
  // Validate file parameter
  if (!file) {
    throw new Error('No file provided to loadImage');
  }
  
  if (!canvases) {
    throw new Error('Canvas objects required for loadImage');
  }
  
  // Validate file size to prevent memory issues
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    throw new Error(`File too large (${sizeMB}MB). Maximum size is ${maxMB}MB. Please resize your image before uploading.`);
  }
  
  const {
    canvas,
    ctx,
    tempCanvas,
    rotationCanvas,
    rotationCtx,
    blurredCanvas,
    holderCanvas,
  } = canvases;

  // Step 1: Extract and display EXIF metadata
  // This shows users what metadata will be removed from their image
  try {
    const exifData = await extractExifData(file);
    
    // Display EXIF modal and wait for user to acknowledge
    displayExifData(exifData, () => {
      if (onImageLoaded && typeof onImageLoaded === 'function') {
        onImageLoaded();
      }
    });
  } catch (error) {
    console.warn('Failed to extract EXIF data:', error);
    // Non-fatal: continue loading even if EXIF extraction fails
  }

  // Step 2: Load the image file
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error(`Unable to read file: ${file.name}. The file may be corrupted or inaccessible.`));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(new Error(`Failed to load image: ${file.name}. The file format may not be supported or the image is corrupted.`));
      };

      img.onload = () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;
          
          // Validate image dimensions
          if (originalWidth <= 0 || originalHeight <= 0) {
            throw new Error('Invalid image dimensions');
          }
          
          let width = img.width;
          let height = img.height;

          // Step 3: Scale down large images for performance
          // OPTIMIZE: Consider processing on Web Worker for large images
          if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
            const scale = Math.min(
              MAX_IMAGE_DIMENSION / width,
              MAX_IMAGE_DIMENSION / height
            );
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
            
            console.info(`Scaled image from ${originalWidth}×${originalHeight} to ${width}×${height}`);
          }

          // Step 4: Initialize all canvases with the same dimensions
          // NOTE: All canvases must be the same size for image operations to work correctly
          const canvasElements = [canvas, tempCanvas, rotationCanvas, blurredCanvas, holderCanvas];
          
          canvasElements.forEach(canvasEl => {
            if (canvasEl) {
              canvasEl.width = width;
              canvasEl.height = height;
            } else {
              console.warn('loadImage: Missing canvas element during initialization');
            }
          });

          // Step 5: Draw the image onto primary canvases
          // Main canvas: visible to user
          // Rotation canvas: holds unmodified image for rotation operations
          try {
            ctx.drawImage(img, 0, 0, width, height);
            rotationCtx.drawImage(img, 0, 0, width, height);
          } catch (drawError) {
            console.error('Failed to draw image on canvas:', drawError);
            throw new Error('Failed to render image on canvas');
          }

          // Return metadata about the loaded image
          resolve({
            filename: file.name,
            originalWidth,
            originalHeight,
            width,
            height,
          });
        } catch (processingError) {
          reject(processingError);
        }
      };

      // Trigger image loading
      img.src = e.target.result;
    };

    // Start reading the file as a data URL
    // FIXME: For very large files, consider using createImageBitmap() instead
    // which is more memory efficient
    reader.readAsDataURL(file);
  });
}

/**
 * Setup drag-and-drop functionality for image files
 * 
 * Enables users to drag image files from their file system directly onto
 * the browser window. Provides visual feedback during drag operations and
 * handles file validation.
 * 
 * Features:
 * - Prevents default browser behavior (opening file in new tab)
 * - Visual feedback via CSS class when dragging over window
 * - Only accepts the first file if multiple files are dropped
 * - Works on entire body for better UX (drop anywhere)
 * 
 * @param {Function} onFileDropped - Callback function called with the dropped file
 * @param {File} onFileDropped.file - The dropped file object
 * 
 * @example
 * setupDragAndDrop((file) => {
 *   console.log('Dropped:', file.name);
 *   loadImage(file, canvases);
 * });
 */
export function setupDragAndDrop(onFileDropped) {
  // TODO: Validate onFileDropped is a function
  if (!onFileDropped || typeof onFileDropped !== 'function') {
    console.error('setupDragAndDrop: onFileDropped must be a function');
    return;
  }
  
  const dropZone = document.getElementById('drop-zone');
  const body = document.body;

  /**
   * Prevent default browser drag/drop behavior
   * Without this, browsers will try to open dropped files in a new tab
   */
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Prevent default drag behaviors on all drag-related events
  const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
  
  dragEvents.forEach((eventName) => {
    body.addEventListener(eventName, preventDefaults, false);
    if (dropZone) {
      dropZone.addEventListener(eventName, preventDefaults, false);
    }
  });

  /**
   * Add visual feedback when dragging over the window
   * The 'dragging' class triggers CSS to show the drop zone overlay
   */
  ['dragenter', 'dragover'].forEach((eventName) => {
    body.addEventListener(
      eventName,
      () => {
        body.classList.add('dragging');
      },
      false
    );
  });

  /**
   * Remove visual feedback when drag leaves or file is dropped
   */
  ['dragleave', 'drop'].forEach((eventName) => {
    body.addEventListener(
      eventName,
      () => {
        body.classList.remove('dragging');
      },
      false
    );
  });

  /**
   * Handle file drop event
   * Extracts the first file from the drop and passes it to the callback
   */
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt ? dt.files : null;

    if (!files || files.length === 0) {
      console.warn('No files in drop event');
      return;
    }

    // TODO: Add file type validation here before calling callback
    // TODO: Show warning if multiple files were dropped
    if (files.length > 1) {
      console.info(`${files.length} files dropped, using only the first one`);
    }

    // Only process the first file
    onFileDropped(files[0]);
  }

  // Attach drop handlers to body and drop zone
  body.addEventListener('drop', handleDrop, false);
  if (dropZone) {
    dropZone.addEventListener('drop', handleDrop, false);
  } else {
    console.warn('Drop zone element not found - drag-and-drop will still work on body');
  }
}
