/**
 * Image Processing and Export Module
 * 
 * Handles saving the processed canvas as a downloadable image file.
 * This is where the actual privacy protection happens - when converting
 * the canvas to a blob, all EXIF metadata is stripped automatically by
 * the canvas API.
 * 
 * @module modules/imageProcessing
 */

import { OUTPUT_FILE_SUFFIX, OUTPUT_IMAGE_FORMAT, OUTPUT_IMAGE_QUALITY } from '../utils/constants.js';

/**
 * Sanitize a filename by removing invalid characters
 * 
 * Removes characters that are invalid in filenames across different operating systems:
 * - Windows: < > : " / \\ | ? *
 * - Also removes control characters and leading/trailing dots and spaces
 * 
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename safe for all platforms
 * @private
 */
function sanitizeFilename(filename) {
  if (!filename) return 'image';
  
  return String(filename)
    // Remove invalid filename characters
    .replace(/[<>:"\/\\|?*\x00-\x1F]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing dots and spaces
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .trim()
    // Limit length to 200 characters
    .substring(0, 200)
    // Fallback if empty after sanitization
    || 'image';
}

/**
 * Save the processed canvas as a PNG file
 * 
 * This function performs the actual EXIF stripping by converting the canvas
 * to a blob/PNG. Canvas-generated images never contain EXIF metadata, so
 * this effectively removes all metadata from the original image.
 * 
 * The saved file will have "_scrubbed" appended to the original filename
 * to avoid overwriting the original and to clearly indicate it has been processed.
 * 
 * Process:
 * 1. Convert canvas to blob (EXIF metadata is automatically stripped)
 * 2. Create object URL from blob
 * 3. Trigger download via programmatic link click
 * 4. Clean up object URL to prevent memory leaks
 * 
 * @param {HTMLCanvasElement} canvas - The canvas containing the processed image
 * @param {string} filename - Original filename (used to generate output filename)
 * @returns {Promise<void>} Resolves when save is complete
 * @throws {Error} If canvas is invalid or blob creation fails
 * 
 * @example
 * try {
 *   await saveImage(canvas, 'photo.jpg');
 *   console.log('Image saved successfully');
 * } catch (error) {
 *   console.error('Save failed:', error);
 * }
 */
export function saveImage(canvas, filename) {
  // Input validation
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Invalid canvas element provided');
  }
  
  if (!filename || typeof filename !== 'string') {
    console.warn('saveImage: No filename provided, using default');
    filename = 'image';
  }

  // Return promise for async operation
  return new Promise((resolve, reject) => {
    // Convert canvas to blob - this is where EXIF stripping happens!
    // The canvas API creates a new image without any metadata
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image data from canvas. The canvas may be empty or corrupted.'));
          return;
        }
        
        try {
        // Create a temporary download link
        const link = document.createElement('a');

        // Extract filename without path (in case full path was provided)
        // Regex handles both forward slashes (Unix) and backslashes (Windows)
        const nameWithoutPath = filename.replace(/.*[\\/]([^\\/]+)$/, '$1');
        
        // Remove file extension from the filename
        const nameWithoutExtension = nameWithoutPath.replace(/\.[^.]*$/, '');
        
        // Sanitize filename to remove invalid characters
        const sanitizedName = sanitizeFilename(nameWithoutExtension);

        // Construct output filename with suffix
        link.download = `${sanitizedName}${OUTPUT_FILE_SUFFIX}.png`;
        
        // Create object URL for the blob
        link.href = URL.createObjectURL(blob);
        
        // Programmatically trigger download
        link.click();

        // Clean up the object URL to prevent memory leaks
        // NOTE: Small delay ensures download starts before URL is revoked
        setTimeout(() => {
          URL.revokeObjectURL(link.href);
        }, 100);
        
        console.info(`Image saved as: ${link.download}`);
        resolve();
      } catch (error) {
        console.error('Error during image save:', error);
        reject(new Error(`Failed to save image: ${error.message || 'Unknown error'}`));
      }
    },
    OUTPUT_IMAGE_FORMAT,
    OUTPUT_IMAGE_QUALITY
  );
  })
;}

/**
 * Validate if a file is a supported image type
 * 
 * @param {File} file - File to validate
 * @returns {boolean} True if file is a supported image type
 * 
 * @example
 * if (isValidImageFile(file)) {
 *   loadImage(file);
 * } else {
 *   showError('Please select an image file');
 * }
 */
export function isValidImageFile(file) {
  if (!file) return false;
  
  // Check MIME type
  const hasValidType = file.type && file.type.startsWith('image/');
  
  // Check file extension as backup
  const hasValidExtension = /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name || '');
  
  return hasValidType || hasValidExtension;
}

/**
 * Get human-readable file size
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 * 
 * @example
 * formatFileSize(1024); // "1 KB"
 * formatFileSize(1536000); // "1.5 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Invalid size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, exponent);
  
  return `${size.toFixed(1)} ${units[exponent]}`;
}

