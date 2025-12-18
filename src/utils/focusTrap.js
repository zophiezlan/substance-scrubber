/**
 * Focus Trap Utility
 * 
 * Manages keyboard focus within modal dialogs for accessibility.
 * Implements WCAG 2.1 focus management requirements for modal dialogs.
 * 
 * @module utils/focusTrap
 */

/**
 * Create and manage a focus trap for a modal dialog
 * 
 * This ensures that when a modal is open, keyboard focus stays within
 * the modal and doesn't escape to the background content. This is critical
 * for screen reader users and keyboard-only navigation.
 * 
 * Features:
 * - Cycles Tab/Shift+Tab through focusable elements
 * - Remembers last focused element before trap
 * - Restores focus on trap release
 * - Supports Escape key to close
 * 
 * @param {HTMLElement} element - The modal/dialog element to trap focus within
 * @param {Function} onEscape - Optional callback when Escape key is pressed
 * @returns {Object} Object with activate() and deactivate() methods
 * 
 * @example
 * const trap = createFocusTrap(modalElement, () => closeModal());
 * trap.activate();
 * // Later when modal closes:
 * trap.deactivate();
 */
export function createFocusTrap(element, onEscape = null) {
  if (!element) {
    console.warn('Focus trap requires a valid element');
    return { activate: () => {}, deactivate: () => {} };
  }

  let previouslyFocused = null;
  let isActive = false;

  /**
   * Get all focusable elements within the trap container
   * @returns {HTMLElement[]} Array of focusable elements
   */
  const getFocusableElements = () => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(element.querySelectorAll(focusableSelectors)).filter(
      (el) => {
        // Filter out elements that are hidden or have display:none
        const style = window.getComputedStyle(el);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          el.offsetParent !== null
        );
      }
    );
  };

  /**
   * Handle Tab key to cycle focus within trap
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleTab = (e) => {
    if (!isActive) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: moving backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Handle Escape key to close modal
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleEscape = (e) => {
    if (!isActive) return;

    if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      onEscape();
    }
  };

  /**
   * Main keydown handler
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      handleTab(e);
    } else if (e.key === 'Escape') {
      handleEscape(e);
    }
  };

  /**
   * Activate the focus trap
   * 
   * - Saves currently focused element
   * - Adds event listener for Tab/Escape keys
   * - Focuses first element in trap
   * - Sets aria-hidden on background content
   */
  const activate = () => {
    if (isActive) return;

    // Save the element that had focus before trap
    previouslyFocused = document.activeElement;

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the container itself
      element.setAttribute('tabindex', '-1');
      element.focus();
    }

    isActive = true;
  };

  /**
   * Deactivate the focus trap
   * 
   * - Removes event listener
   * - Restores focus to previously focused element
   * - Removes aria-hidden from background content
   */
  const deactivate = () => {
    if (!isActive) return;

    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeyDown);

    // Restore focus to previously focused element
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }

    isActive = false;
  };

  return {
    activate,
    deactivate,
  };
}

/**
 * Simple helper to add keyboard activation to an element
 * 
 * Makes an element keyboard-activatable by responding to Enter and Space keys.
 * Use this for custom interactive elements that aren't natively keyboard accessible.
 * 
 * @param {HTMLElement} element - Element to make keyboard-activatable
 * @param {Function} callback - Function to call when activated
 * 
 * @example
 * addKeyboardActivation(customButton, () => doAction());
 */
export function addKeyboardActivation(element, callback) {
  if (!element || !callback) {
    console.warn('addKeyboardActivation requires element and callback');
    return;
  }

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  });
}
