/**
 * EXIF Metadata Extraction and Display Module
 * 
 * Handles extraction and user-friendly display of EXIF metadata from images.
 * This is a critical privacy feature that shows users exactly what metadata
 * is embedded in their images before it gets stripped during the save process.
 * 
 * IMPORTANT: The actual metadata removal happens during image save (saveImage),
 * not here. This module only extracts and displays for transparency.
 * 
 * @module modules/exifHandler
 * @see {@link https://github.com/mattiasw/ExifReader}
 */

import ExifReader from 'exifreader';

/**
 * Extract EXIF metadata from an image file
 * 
 * Uses the ExifReader library to parse embedded metadata from image files.
 * Common EXIF data includes: GPS coordinates, camera make/model, timestamps,
 * software used, and device settings.
 * 
 * NOTE: EXIF extraction does NOT modify the file - it only reads metadata.
 * The actual stripping happens when saving via canvas.toBlob() which creates
 * a new image without any metadata.
 * 
 * @param {File} file - Image file to extract EXIF data from
 * @returns {Promise<Object>} Object containing EXIF tags, or empty object if none found
 * @returns {Object} returns.tag - Each EXIF tag with value and description
 * 
 * @example
 * const exifData = await extractExifData(imageFile);
 * if (exifData.GPSLatitude) {
 *   console.log('Image contains GPS data:', exifData.GPSLatitude.description);
 * }
 */
export async function extractExifData(file) {
  // TODO: Add file validation
  if (!file) {
    console.error('extractExifData: No file provided');
    return {};
  }
  
  try {
    const tags = await ExifReader.load(file);
    
    // Log privacy-critical tags for debugging
    const privacyCriticalTags = ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'Make', 'Model'];
    const foundCriticalTags = privacyCriticalTags.filter(tag => tags[tag]);
    
    if (foundCriticalTags.length > 0) {
      console.info('Found privacy-sensitive EXIF tags:', foundCriticalTags.join(', '));
    }
    
    return tags;
  } catch (error) {
    // Not finding EXIF data is normal for many images (PNGs, edited photos, etc.)
    console.info('No EXIF data found or error reading EXIF:', error.message || error);
    return {};
  }
}

/**
 * Display EXIF data to the user in a modal dialog
 * 
 * Shows all extracted EXIF metadata in a user-friendly modal, allowing users
 * to review what metadata will be removed. This transparency is important for
 * user trust and understanding of the privacy features.
 * 
 * The modal is blocking (user must acknowledge) to ensure they're aware of
 * what metadata was in their image.
 * 
 * @param {Object} exifData - EXIF data object from extractExifData
 * @param {Function} onContinue - Callback invoked when user clicks continue button
 * 
 * @example
 * displayExifData(exifData, () => {
 *   console.log('User acknowledged EXIF data');
 *   proceedWithImageEditing();
 * });
 */
export function displayExifData(exifData, onContinue) {
  // TODO: Add parameter validation
  if (!exifData || typeof exifData !== 'object') {
    console.warn('displayExifData: Invalid exifData parameter');
    exifData = {};
  }
  
  const exifHolder = document.getElementById('exifInformationHolder');
  
  if (!exifHolder) {
    console.error('displayExifData: exifInformationHolder element not found in DOM');
    // Still call onContinue so the app doesn't hang
    if (onContinue && typeof onContinue === 'function') {
      onContinue();
    }
    return;
  }

  const exifKeys = Object.keys(exifData);
  
  // Filter to only keys with readable descriptions
  const readableKeys = exifKeys.filter(
    (key) => exifData[key] && exifData[key].description
  );

  // Build the modal content
  if (readableKeys.length === 0) {
    // No EXIF data found - still show modal to inform user
    exifHolder.innerHTML = `
      <div role="dialog" aria-labelledby="exif-title" aria-describedby="exif-desc">
        <h3 id="exif-title">No EXIF Data Found</h3>
        <p id="exif-desc">This image contains no metadata to remove. You can proceed to edit and save the image.</p>
        <button id="continueButtonExif" type="button" aria-label="Continue to image editor">Continue</button>
      </div>
    `;
  } else {
    // Display all found EXIF data
    // OPTIMIZE: For very long lists, consider pagination or grouping by category
    const exifList = readableKeys
      .map((key) => {
        // FIXME: Escape HTML in descriptions to prevent XSS
        const description = String(exifData[key].description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<li><strong>${key}:</strong> ${description}</li>`;
      })
      .join('');

    exifHolder.innerHTML = `
      <div role="dialog" aria-labelledby="exif-title" aria-describedby="exif-desc">
        <h3 id="exif-title">EXIF Data Found (Will Be Removed)</h3>
        <p id="exif-desc">Your image contains ${readableKeys.length} metadata field(s). These will be automatically removed when you save the anonymized image.</p>
        <div id="exifScrollDiv" role="region" aria-label="EXIF metadata list" tabindex="0">
          <ul>${exifList}</ul>
        </div>
        <button id="continueButtonExif" type="button" aria-label="Remove EXIF data and continue to editor">Remove EXIF Data and Continue</button>
      </div>
    `;
  }

  // Show the modal
  exifHolder.style.display = 'block';
  
  // FIXME: Should set focus trap to prevent tabbing outside modal
  // FIXME: Should add ARIA attributes for screen readers

  // Setup continue button handler
  const continueButton = document.getElementById('continueButtonExif');
  if (continueButton) {
    continueButton.onclick = () => {
      exifHolder.style.display = 'none';
      if (onContinue && typeof onContinue === 'function') {
        onContinue();
      }
    };
    
    // Auto-focus the button for keyboard accessibility
    // preventScroll prevents page jump which can be jarring
    setTimeout(() => {
      continueButton.focus({ preventScroll: true });
    }, 100);
  }

  // Allow Escape key to close modal (accessibility)
  exifHolder.onkeydown = (event) => {
    if (event.key === 'Escape' && continueButton) {
      event.preventDefault();
      continueButton.click();
    }
  };
}
