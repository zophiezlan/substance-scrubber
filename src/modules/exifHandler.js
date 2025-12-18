/**
 * EXIF data handler using modern ExifReader library
 */

import ExifReader from 'exifreader';

/**
 * Extract and display EXIF data from an image file
 * @param {File} file - Image file to extract EXIF from
 * @returns {Promise<Object>} EXIF data
 */
export async function extractExifData(file) {
  try {
    const tags = await ExifReader.load(file);
    return tags;
  } catch (error) {
    console.warn('No EXIF data found or error reading EXIF:', error);
    return {};
  }
}

/**
 * Display EXIF data to user
 * @param {Object} exifData - EXIF data object
 * @param {Function} onContinue - Callback when user continues
 */
export function displayExifData(exifData, onContinue) {
  const exifHolder = document.getElementById('exifInformationHolder');
  if (!exifHolder) return;

  const exifKeys = Object.keys(exifData);

  if (exifKeys.length === 0) {
    exifHolder.innerHTML = `
      <div>
        <h3>No EXIF Data Found</h3>
        <p>This image contains no metadata to remove.</p>
        <button id="continueButtonExif">Continue</button>
      </div>
    `;
  } else {
    const exifList = exifKeys
      .filter((key) => exifData[key] && exifData[key].description)
      .map(
        (key) =>
          `<li><strong>${key}:</strong> ${exifData[key].description}</li>`
      )
      .join('');

    exifHolder.innerHTML = `
      <div>
        <h3>EXIF Data to be Removed:</h3>
        <div id="exifScrollDiv">
          <ul>${exifList || '<li>No readable EXIF data</li>'}</ul>
        </div>
        <button id="continueButtonExif">Remove EXIF Data and Continue</button>
      </div>
    `;
  }

  exifHolder.style.display = 'block';

  const continueButton = document.getElementById('continueButtonExif');
  if (continueButton) {
    continueButton.onclick = () => {
      exifHolder.style.display = 'none';
      if (onContinue) onContinue();
    };
    continueButton.focus({ preventScroll: true });
  }

  exifHolder.onkeydown = (event) => {
    if (event.key === 'Escape' && continueButton) {
      event.preventDefault();
      continueButton.click();
    }
  };
}
