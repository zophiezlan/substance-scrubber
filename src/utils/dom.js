/**
 * DOM Utility Functions
 * 
 * Helper functions for DOM manipulation, event handling, and UI updates.
 * Provides reusable utilities to reduce code duplication across modules.
 * 
 * @module utils/dom
 */

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
