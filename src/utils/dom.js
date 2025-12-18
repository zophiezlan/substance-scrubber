/**
 * DOM Utility Functions
 * 
 * Helper functions for DOM manipulation, event handling, and UI updates.
 * Provides reusable utilities to reduce code duplication across modules.
 * 
 * @module utils/dom
 */

/**
 * Show loading overlay with message
 * 
 * Displays a loading indicator to inform users that an operation is in progress.
 * The loading overlay blocks interaction to prevent conflicting operations.
 * 
 * @param {string} [message='Loading...'] - Message to display
 * 
 * @example
 * showLoading('Processing image...');
 * await longOperation();
 * hideLoading();
 */
export function showLoading(message = 'Loading...') {
  let overlay = document.getElementById('loadingOverlay');
  
  // Create overlay if it doesn't exist
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div id="loadingMessage" class="loading-message">${message}</div>
    `;
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');
    overlay.setAttribute('aria-busy', 'true');
    document.body.appendChild(overlay);
  } else {
    // Update message if overlay exists
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
  
  overlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 * 
 * Removes the loading indicator and allows user interaction again.
 * 
 * @example
 * showLoading('Saving image...');
 * await saveOperation();
 * hideLoading();
 */
export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-busy', 'false');
  }
}

/**
 * Show error message to user
 * 
 * Displays a user-friendly error message in a modal dialog instead of
 * just logging to console. This ensures users know when something went wrong.
 * 
 * @param {string} title - Error title
 * @param {string} message - Detailed error message
 * @param {Error} [error] - Optional error object for logging
 * 
 * @example
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   showError('Operation Failed', 'Unable to process image', err);
 * }
 */
export function showError(title, message, error = null) {
  if (error) {
    console.error(`${title}:`, error);
  }
  
  // Hide loading overlay if showing
  hideLoading();
  
  let errorModal = document.getElementById('errorModal');
  
  // Create error modal if it doesn't exist
  if (!errorModal) {
    errorModal = document.createElement('div');
    errorModal.id = 'errorModal';
    errorModal.className = 'error-modal';
    errorModal.setAttribute('role', 'alertdialog');
    errorModal.setAttribute('aria-labelledby', 'errorTitle');
    errorModal.setAttribute('aria-describedby', 'errorMessage');
    document.body.appendChild(errorModal);
  }
  
  errorModal.innerHTML = `
    <div class="error-modal-content">
      <div class="error-icon" aria-hidden="true">⚠️</div>
      <h3 id="errorTitle">${escapeHtml(title)}</h3>
      <p id="errorMessage">${escapeHtml(message)}</p>
      <button id="errorCloseButton" class="error-close-button">OK</button>
    </div>
  `;
  
  errorModal.style.display = 'flex';
  
  // Setup close button
  const closeBtn = document.getElementById('errorCloseButton');
  if (closeBtn) {
    closeBtn.onclick = () => {
      errorModal.style.display = 'none';
    };
    closeBtn.focus();
  }
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      errorModal.style.display = 'none';
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Safely get a DOM element by ID with error handling
 * 
 * @param {string} id - Element ID
 * @param {boolean} [required=false] - If true, logs error when element not found
 * @returns {HTMLElement|null} The element or null if not found
 * 
 * @example
 * const button = getElementById('saveButton', true);
 * if (button) {
 *   button.addEventListener('click', handleClick);
 * }
 */
export function getElementById(id, required = false) {
  const element = document.getElementById(id);
  
  if (!element && required) {
    console.error(`Required element with ID '${id}' not found in DOM`);
  }
  
  return element;
}

/**
 * Debounce a function call
 * 
 * Creates a debounced version of a function that delays execution until
 * after a specified time has elapsed since the last call. Useful for
 * expensive operations triggered by events that fire rapidly (resize, scroll).
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedResize = debounce(() => {
 *   updateLayout();
 * }, 300);
 * window.addEventListener('resize', debouncedResize);
 */
export function debounce(func, delay) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle a function call
 * 
 * Creates a throttled version that only executes at most once per specified
 * time period. Unlike debounce, throttle ensures the function is called
 * at regular intervals during continuous events.
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Add keyboard accessibility to an element
 * 
 * Makes non-interactive elements keyboard accessible by responding to
 * Enter and Space keys. Useful for custom interactive elements.
 * 
 * @param {HTMLElement} element - Element to make keyboard accessible
 * @param {Function} callback - Function to call on activation
 * @param {string[]} [keys=['Enter', ' ']] - Keys that trigger activation
 * 
 * @example
 * makeKeyboardAccessible(customButton, () => {
 *   handleClick();
 * });
 */
export function makeKeyboardAccessible(element, callback, keys = ['Enter', ' ']) {
  if (!element || typeof callback !== 'function') {
    console.error('makeKeyboardAccessible: Invalid element or callback');
    return;
  }
  
  element.addEventListener('keydown', (event) => {
    if (keys.includes(event.key)) {
      event.preventDefault();
      callback(event);
    }
  });
}

/**
 * Show a status message to the user
 * 
 * @param {string} message - Message to display
 * @param {string} [type='info'] - Message type: 'info', 'success', 'warning', 'error'
 * @param {number} [duration=0] - Auto-hide after duration (ms), 0 = don't hide
 * 
 * @example
 * showStatus('Image saved successfully!', 'success', 3000);
 */
export function showStatus(message, type = 'info', duration = 0) {
  const statusBanner = getElementById('statusBanner');
  if (!statusBanner) return;
  
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
  statusBanner.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  statusBanner.style.display = message ? 'flex' : 'none';
  
  if (duration > 0) {
    setTimeout(() => {
      statusBanner.style.display = 'none';
    }, duration);
  }
}

/**
 * Escape HTML special characters to prevent XSS
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML
 * 
 * @example
 * element.innerHTML = escapeHtml(userInput);
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create a modal overlay with focus trap
 * 
 * TODO: Implement full modal functionality with focus trap
 * 
 * @param {string} content - HTML content for modal
 * @param {Object} options - Modal options
 * @returns {HTMLElement} Modal element
 */
export function createModal(content, options = {}) {
  // TODO: Implement modal creation with proper accessibility
  console.warn('createModal: Not yet implemented');
  return null;
}

/**
 * Check if device prefers reduced motion
 * 
 * @returns {boolean} True if user prefers reduced motion
 * 
 * @example
 * if (!prefersReducedMotion()) {
 *   element.classList.add('animated');
 * }
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get viewport dimensions
 * 
 * @returns {{width: number, height: number}} Viewport dimensions
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Check if element is in viewport
 * 
 * @param {HTMLElement} element - Element to check
 * @param {number} [threshold=0] - How much of element must be visible (0-1)
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const elementHeight = rect.height;
  const elementWidth = rect.width;
  
  return (
    rect.top >= -elementHeight * (1 - threshold) &&
    rect.left >= -elementWidth * (1 - threshold) &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + elementHeight * (1 - threshold) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + elementWidth * (1 - threshold)
  );
}
