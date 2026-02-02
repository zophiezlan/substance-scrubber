/**
 * Main Application Entry Point
 * Substance Scrubber - Privacy-focused image anonymization tool
 * 
 * This is the main initialization file that:
 * - Sets up the application state
 * - Initializes all canvases
 * - Attaches event handlers
 * - Manages UI interactions
 * - Coordinates between different modules
 * 
 * @module main
 */

import './styles/main.css';
import { setupCanvases, clearCanvasRectCache } from './utils/canvas.js';
import { setCursor, clearCursorCache } from './modules/drawing.js';
import { saveImage } from './modules/imageProcessing.js';
import { loadImage, setupDragAndDrop } from './modules/imageLoader.js';
import { rotateCanvas } from './modules/rotation.js';
import { createEventHandlers } from './modules/eventHandlers.js';
import { createFocusTrap, addKeyboardActivation } from './utils/focusTrap.js';
import { showLoading, hideLoading, showError, addBannerCloseButton } from './utils/dom.js';
import {
  DEFAULT_BRUSH_SIZE,
  DEFAULT_BLUR_AMOUNT,
  DEFAULT_PAINTING_MODE,
  DEFAULT_BRUSH_TYPE,
  DEFAULT_PAINT_COLOR,
  BRUSH_ADJUSTMENT_FACTOR
} from './utils/constants.js';
import jscolor from '@eastdesire/jscolor';

/**
 * Application State
 * 
 * Central state object containing all user preferences and current settings.
 * This could be refactored into a more structured state management system
 * (e.g., using a state management library) for better scalability.
 * 
 * TODO: Consider using a proper state management pattern (observer/pub-sub)
 * TODO: Persist user preferences to localStorage
 * 
 * @property {string} filename - Current loaded image filename
 * @property {number} brushSize - Current brush radius in pixels
 * @property {number} blurAmount - Current blur radius (0-150)
 * @property {number} brushAdjustment - Factor for calculating brush size from slider
 * @property {string} painting - Current mode: 'blur', 'paint', or 'undo'
 * @property {string} brush - Current brush type: 'round', 'area', or 'tap'
 * @property {string} paintColor - Current paint color (hex format)
 * @property {Object|null} imageMeta - Metadata about loaded image
 */
const state = {
  filename: '',
  brushSize: DEFAULT_BRUSH_SIZE,
  blurAmount: DEFAULT_BLUR_AMOUNT,
  brushAdjustment: BRUSH_ADJUSTMENT_FACTOR,
  painting: DEFAULT_PAINTING_MODE,
  brush: DEFAULT_BRUSH_TYPE,
  paintColor: DEFAULT_PAINT_COLOR,
  imageMeta: null,
  // NOTE: Focus traps for accessibility (modal focus management)
  aboutModalTrap: null,
  exifModalTrap: null,
  shortcutsModalTrap: null,
};

/**
 * Initialize the application
 * 
 * Main initialization function called when DOM is ready. Sets up:
 * - Canvas elements
 * - Event handlers
 * - UI controls
 * - Network status monitoring
 * - Theme preferences
 * - Drag and drop
 * 
 * FIXME: This function is quite long (460 lines) - consider breaking into smaller functions
 * TODO: Add error boundary to catch initialization errors
 */
function init() {
  try {
    const canvases = setupCanvases();
    const { canvas } = canvases;

    // Setup UI and accessibility features
    setupNetworkBanner();
    setupAccessibleControls();

  // Setup event handlers
  const handlers = createEventHandlers(canvases, state);

  // Attach canvas event listeners
  canvas.addEventListener('mousedown', handlers.handleMouseDown);
  canvas.addEventListener('mousemove', handlers.handleMouseMove);
  canvas.addEventListener('mouseup', handlers.handleMouseUp);
  canvas.addEventListener('mouseout', handlers.handleMouseOut);
  canvas.addEventListener('touchstart', handlers.handleTouchStart);
  canvas.addEventListener('touchmove', handlers.handleTouchMove);
  canvas.addEventListener('touchend', handlers.handleMouseUp);
  canvas.addEventListener('touchcancel', handlers.handleMouseUp);

  // Setup brush size slider
  const brushSizeSlider = document.getElementById('brushSizeSlider');
  if (brushSizeSlider) {
    brushSizeSlider.addEventListener('input', () => {
      // Update aria-valuenow for screen readers
      brushSizeSlider.setAttribute('aria-valuenow', brushSizeSlider.value);
    });
    brushSizeSlider.addEventListener('change', () => {
      const biggerDimension = Math.max(canvas.width, canvas.height);
      state.brushSize = Math.floor(
        (brushSizeSlider.value * biggerDimension) / state.brushAdjustment
      );
      setCursor(canvas, state.brushSize, state.brush);
      // Announce to screen readers
      announceToScreenReader(`Brush size set to ${brushSizeSlider.value}`);
    });
  }

  // Setup blur amount slider
  const blurAmountSlider = document.getElementById('blurAmountSlider');
  if (blurAmountSlider) {
    blurAmountSlider.addEventListener('input', () => {
      // Update aria-valuenow for screen readers
      blurAmountSlider.setAttribute('aria-valuenow', blurAmountSlider.value);
    });
    blurAmountSlider.addEventListener('change', () => {
      state.blurAmount = Math.floor(blurAmountSlider.value);
      // Announce to screen readers
      announceToScreenReader(`Blur radius set to ${blurAmountSlider.value}`);
    });
  }

  // Setup paint/blur/undo radio buttons
  const paintFormElements = document.querySelectorAll(
    'input[name="paintingAction"]'
  );
  paintFormElements.forEach((radio) => {
    if (radio.value === 'blur') {
      radio.checked = true;
      state.painting = 'blur';
    }
    radio.addEventListener('click', () => {
      state.painting = radio.value;
    });
  });

  // Setup brush type radio buttons
  const brushFormElements = document.querySelectorAll('input[name="useBrush"]');
  brushFormElements.forEach((radio) => {
    if (radio.value === 'round') {
      radio.checked = true;
      state.brush = 'round';
    }
    radio.addEventListener('click', () => {
      state.brush = radio.value;
      const biggerDimension = Math.max(canvas.width, canvas.height);
      state.brushSize = Math.floor(
        (brushSizeSlider.value * biggerDimension) / state.brushAdjustment
      );
      setCursor(canvas, state.brushSize, state.brush);
    });
  });

  // Setup color picker
  const paintColorButton = document.getElementById('paintColor');
  if (paintColorButton) {
    // Initialize jscolor
    jscolor.presets.default = {
      width: 181,
      position: 'right',
      palette: [
        '#000000',
        '#333333',
        '#666666',
        '#999999',
        '#CCCCCC',
        '#FFFFFF',
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
      ],
      onInput() {
        // Update state during user interaction for live preview
        state.paintColor = `#${this.toHEXString()}`;
      }
    };
    jscolor.install();

    paintColorButton.addEventListener('click', () => {
      const paintRadio = document.getElementById('Paint');
      if (paintRadio) {
        paintRadio.checked = true;
        state.painting = 'paint';
      }
    });
  }

  // Setup file input
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handleFileLoad(file, canvases);
      }
    });
  }

  // Setup save button
  const saveButton = document.getElementById('saveButton');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      if (!state.filename) {
        showError('No Image Loaded', 'Please load an image before attempting to save.');
        return;
      }
      
      try {
        showLoading('Saving anonymized image...');
        await saveImage(canvas, state.filename);
        hideLoading();
        showStatus('Image saved successfully! All metadata has been removed.', 'success');
        announceToScreenReader('Image saved successfully');
      } catch (error) {
        hideLoading();
        showError(
          'Failed to Save Image',
          error.message || 'An unexpected error occurred while saving the image. Please try again.',
          error
        );
      }
    });
  }

  // Setup rotate button
  const rotateButton = document.getElementById('rotate');
  if (rotateButton) {
    rotateButton.addEventListener('click', () => {
      if (!state.imageMeta) {
        showError('No Image Loaded', 'Please load an image before attempting to rotate.');
        return;
      }
      
      try {
        showLoading('Rotating image...');
        rotateCanvas(canvases);
        hideLoading();
        showStatus('Image rotated 90° clockwise.', 'info');
        announceToScreenReader('Image rotated');
      } catch (error) {
        hideLoading();
        showError(
          'Failed to Rotate Image',
          error.message || 'An unexpected error occurred while rotating the image.',
          error
        );
      }
    });
  }

  // Setup about button with focus trap
  const aboutButton = document.getElementById('about');
  if (aboutButton) {
    const info = document.getElementById('imageScrubberInfo');
    if (info) {
      info.style.display = 'none';
      // Create close button for modal
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.className = 'modal-close-button';
      closeButton.setAttribute('aria-label', 'Close about dialog');
      info.appendChild(closeButton);

      // Create focus trap for about modal
      state.aboutModalTrap = createFocusTrap(info, () => {
        closeModal(info, aboutButton, state.aboutModalTrap);
      });

      // Close button handler
      closeButton.addEventListener('click', () => {
        closeModal(info, aboutButton, state.aboutModalTrap);
      });
    }

    aboutButton.setAttribute('aria-expanded', 'false');
    aboutButton.addEventListener('click', () => {
      const isOpen = info && info.style.display !== 'none';
      if (info) {
        if (isOpen) {
          closeModal(info, aboutButton, state.aboutModalTrap);
        } else {
          openModal(info, aboutButton, state.aboutModalTrap);
        }
      }
    });
  }

  // Setup keyboard shortcuts modal
  const shortcutsDialog = document.getElementById('keyboardShortcutsDialog');
  const closeShortcutsButton = document.getElementById('closeShortcutsButton');
  
  if (shortcutsDialog) {
    // Create focus trap for shortcuts modal
    state.shortcutsModalTrap = createFocusTrap(shortcutsDialog, () => {
      closeShortcutsModal();
    });

    // Close button handler
    if (closeShortcutsButton) {
      closeShortcutsButton.addEventListener('click', closeShortcutsModal);
    }
  }

  // Setup drag and drop
  setupDragAndDrop((file) => handleFileLoad(file, canvases));

  // Hide info panel on start
  const info = document.getElementById('imageScrubberInfo');
  if (info) {
    info.style.display = 'none';
  }

  // Setup theme toggle
  setupThemeToggle();

  // Setup canvas guidance updates and cache clearing on resize
  // Use debounce to avoid excessive calls during resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Clear caches immediately for accurate positioning
    clearCanvasRectCache();
    clearCursorCache();
    
    // Debounce the canvas guidance update
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCanvasGuidance(state, canvas);
      // Update cursor for current brush size
      if (state.imageMeta) {
        setCursor(canvas, state.brushSize, state.brush);
      }
    }, 150);
  });

  // Setup hygiene control with confirmation
  const clearSessionButton = document.getElementById('clearSession');
  if (clearSessionButton) {
    clearSessionButton.addEventListener('click', () => {
      if (!state.imageMeta) {
        // Nothing to clear
        showStatus('No active session to clear.', 'info');
        return;
      }
      
      // Ask for confirmation to prevent accidental data loss
      if (confirm('Clear the current session? This will remove the loaded image and all edits from memory. This action cannot be undone.')) {
        try {
          clearSession(canvases);
          state.filename = '';
          state.imageMeta = null;
          showStatus('Session cleared successfully. All image data has been removed from memory.', 'success');
          updateCanvasGuidance(state, canvas);
          announceToScreenReader('Session cleared');
        } catch (error) {
          showError(
            'Failed to Clear Session',
            error.message || 'An unexpected error occurred while clearing the session.',
            error
          );
        }
      }
    });
  }

  updateCanvasGuidance(state, canvas);
  } catch (error) {
    // FIXME: Display user-friendly error message instead of just console
    console.error('Fatal error during initialization:', error);
    const body = document.body;
    if (body) {
      body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: sans-serif;">
          <h1 style="color: #ef4444;">Initialization Error</h1>
          <p>The application failed to initialize. Please refresh the page and try again.</p>
          <p style="color: #666; font-size: 14px;">Error: ${error.message || 'Unknown error'}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

/**
 * Setup dark mode theme toggle
 * 
 * Initializes theme preference based on:
 * 1. Saved preference in localStorage
 * 2. System preference (prefers-color-scheme)
 * 3. Default to light mode
 * 
 * Also watches for system theme changes and updates accordingly.
 * 
 * TODO: Add theme transition animations
 * TODO: Add more theme options (high contrast, etc.)
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  // Apply initial theme
  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
      }
    });
}

/**
 * Setup network status banner
 * 
 * Displays a persistent banner informing users of their network status.
 * This is a key privacy feature - users should understand that being online
 * means potential network activity (though the app itself doesn't upload anything).
 * 
 * NOTE: navigator.onLine is not 100% reliable - it only detects network interface status,
 * not actual internet connectivity. Users should still be educated about privacy.
 */
function setupNetworkBanner() {
  const banner = document.getElementById('networkBanner');
  if (!banner) {
    console.warn('Network banner element not found');
    return;
  }

  const updateStatus = () => {
    const message = navigator.onLine
      ? '⚠️ Online detected — for maximum privacy, toggle airplane mode before loading photos.'
      : '✓ Offline mode: all processing stays on this device. You can safely scrub images without connectivity.';
    
    banner.className = navigator.onLine ? 'status-banner warning' : 'status-banner success';
    addBannerCloseButton(banner, message);
    banner.style.display = 'flex';
  };

  // Listen for network status changes
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  // Set initial status
  updateStatus();
}

/**
 * Setup accessibility features
 * 
 * Ensures keyboard navigation works properly:
 * - Makes file input label keyboard-activatable
 * - Sets tabindex on all interactive elements
 * - Enables proper focus management
 * - Adds global keyboard shortcuts
 * 
 * NOTE: Keyboard shortcuts added for common actions
 * TODO: Add skip-to-main-content link
 * TODO: Test with actual screen readers (NVDA, JAWS)
 */
function setupAccessibleControls() {
  // Make file input label keyboard accessible
  const openLabel = document.querySelector('label[for="file-input"]');
  const fileInput = document.getElementById('file-input');
  if (openLabel && fileInput) {
    addKeyboardActivation(openLabel, () => fileInput.click());
  } else {
    console.warn('File input elements not found for accessibility setup');
  }

  // Ensure all interactive elements are keyboard accessible
  document
    .querySelectorAll(
      'input[type="radio"], input[type="range"], button, a, [role="button"]'
    )
    .forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });

  // Setup global keyboard shortcuts
  setupKeyboardShortcuts();
}

/**
 * Update theme toggle icon
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  const icon = themeToggle.querySelector('svg');
  if (!icon) return;

  if (theme === 'dark') {
    // Sun icon for light mode
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    `;
  } else {
    // Moon icon for dark mode
    icon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    `;
  }
}

function showStatus(message, type = 'info') {
  const statusBanner = document.getElementById('statusBanner');
  if (!statusBanner) return;

  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
  statusBanner.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  statusBanner.style.display = message ? 'flex' : 'none';
}

function updateCanvasGuidance(currentState, canvas) {
  const guidance = document.getElementById('canvasGuidance');
  if (!guidance || !canvas) return;

  if (!currentState.imageMeta) {
    const message =
      'Load a photo to view resolution and fit guidance. Images larger than 2500px are safely resized for performance.';
    guidance.className = 'status-banner muted';
    addBannerCloseButton(guidance, message);
    guidance.style.display = 'flex';
    return;
  }

  const { originalWidth, originalHeight, width, height } = currentState.imageMeta;
  const resized = originalWidth !== width || originalHeight !== height;
  const scaleMessage = resized
    ? `Resized from ${originalWidth}×${originalHeight} to ${width}×${height} to keep editing responsive.`
    : `Using full resolution ${width}×${height}.`;

  const rect = canvas.getBoundingClientRect();
  const widthScale = rect.width && width ? rect.width / width : 1;
  const heightScale = rect.height && height ? rect.height / height : 1;
  const viewScale = Math.min(widthScale || 1, heightScale || 1);
  const viewportMessage = `Displayed at ${Math.round(viewScale * 100)}% to fit your screen.`;

  const message = `${scaleMessage} ${viewportMessage}`;
  guidance.className = `status-banner ${resized ? 'info' : 'muted'}`;
  addBannerCloseButton(guidance, message);
  guidance.style.display = 'flex';
}

/**
 * Clear all canvases and reset file input
 * 
 * This is a privacy/hygiene feature that removes all image data from memory.
 * Important for shared computers or when processing multiple images.
 * 
 * Process:
 * 1. Resize all canvases to 1x1 (minimizes memory footprint)
 * 2. Clear pixel data
 * 3. Reset file input to remove file reference
 * 
 * NOTE: This doesn't guarantee memory is freed immediately (JS garbage collection)
 * but it removes all references so GC can clean up.
 * 
 * @param {Object} canvases - Canvas objects to clear
 */
function clearSession(canvases) {
  // TODO: Add confirmation dialog if there are unsaved changes
  
  const canvasList = [
    canvases.canvas,
    canvases.tempCanvas,
    canvases.holderCanvas,
    canvases.rotationCanvas,
    canvases.blurredCanvas,
    canvases.offscreenCanvas,
  ];

  canvasList.forEach((canvasEl) => {
    if (!canvasEl) {
      console.warn('Null canvas in clearSession');
      return;
    }
    const ctx = canvasEl.getContext('2d');
    
    // Resize to 1x1 to minimize memory (canvas clears on resize)
    canvasEl.width = 1;
    canvasEl.height = 1;
    
    // Explicitly clear for good measure
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
    }
  });

  // Clear file input to remove file reference
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.value = '';
  }
}

/**
 * Open modal dialog with focus trap
 * @param {HTMLElement} modal - Modal element to open
 * @param {HTMLElement} trigger - Button that triggered the modal
 * @param {Object} focusTrap - Focus trap instance
 */
function openModal(modal, trigger, focusTrap) {
  if (!modal) return;

  modal.style.display = 'block';
  modal.setAttribute('aria-modal', 'true');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
  }

  // Activate focus trap after modal is visible
  if (focusTrap) {
    // Small delay to ensure modal is rendered
    setTimeout(() => focusTrap.activate(), 50);
  }

  // Hide background content from screen readers
  const mainContent = document.getElementById('topBar');
  const canvas = document.getElementById('imageCanvas');
  if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
  if (canvas) canvas.setAttribute('aria-hidden', 'true');
}

/**
 * Close modal dialog and restore focus
 * @param {HTMLElement} modal - Modal element to close
 * @param {HTMLElement} trigger - Button that triggered the modal
 * @param {Object} focusTrap - Focus trap instance
 */
function closeModal(modal, trigger, focusTrap) {
  if (!modal) return;

  // Deactivate focus trap before hiding modal
  if (focusTrap) {
    focusTrap.deactivate();
  }

  modal.style.display = 'none';
  modal.setAttribute('aria-modal', 'false');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }

  // Restore background content for screen readers
  const mainContent = document.getElementById('topBar');
  const canvas = document.getElementById('imageCanvas');
  if (mainContent) mainContent.removeAttribute('aria-hidden');
  if (canvas) canvas.removeAttribute('aria-hidden');
}

/**
 * Setup global keyboard shortcuts
 * 
 * Implements common keyboard shortcuts for accessibility:
 * - Ctrl/Cmd+S: Save image
 * - Ctrl/Cmd+O: Open image
 * - Ctrl/Cmd+R: Rotate image
 * - B: Switch to Blur mode
 * - P: Switch to Paint mode
 * - U: Switch to Undo mode
 * - 1: Round brush
 * - 2: Rectangle tool
 * - 3: Tap tool
 * - [/]: Decrease/increase brush size
 * - ?/F1: Open help/about
 * 
 * NOTE: Keyboard shortcuts announced via aria-live region
 * TODO: Add customizable shortcuts in settings
 * TODO: Add keyboard shortcut reference card
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.matches('input, textarea, select')) {
      return;
    }

    // Check for modifiers
    const ctrlOrCmd = e.ctrlKey || e.metaKey;

    // Save image: Ctrl/Cmd+S
    if (ctrlOrCmd && e.key === 's') {
      e.preventDefault();
      const saveButton = document.getElementById('saveButton');
      if (saveButton) {
        saveButton.click();
        announceToScreenReader('Save image triggered');
      }
      return;
    }

    // Open image: Ctrl/Cmd+O
    if (ctrlOrCmd && e.key === 'o') {
      e.preventDefault();
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.click();
        announceToScreenReader('Open image dialog triggered');
      }
      return;
    }

    // Rotate: Ctrl/Cmd+R
    if (ctrlOrCmd && e.key === 'r') {
      e.preventDefault();
      const rotateButton = document.getElementById('rotate');
      if (rotateButton) {
        rotateButton.click();
        announceToScreenReader('Rotated image 90 degrees');
      }
      return;
    }

    // Don't process other shortcuts if Ctrl/Cmd is held
    if (ctrlOrCmd) return;

    // Painting mode shortcuts
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault();
        document.getElementById('Blur')?.click();
        announceToScreenReader('Blur mode activated');
        break;
      case 'p':
        e.preventDefault();
        document.getElementById('Paint')?.click();
        announceToScreenReader('Paint mode activated');
        break;
      case 'u':
        e.preventDefault();
        document.getElementById('Undo')?.click();
        announceToScreenReader('Undo mode activated');
        break;
      case '1':
        e.preventDefault();
        document.getElementById('Round')?.click();
        announceToScreenReader('Round brush selected');
        break;
      case '2':
        e.preventDefault();
        document.getElementById('Area')?.click();
        announceToScreenReader('Rectangle tool selected');
        break;
      case '3':
        e.preventDefault();
        document.getElementById('Tap')?.click();
        announceToScreenReader('Tap tool selected');
        break;
      case '[':
        e.preventDefault();
        adjustBrushSize(-5);
        break;
      case ']':
        e.preventDefault();
        adjustBrushSize(5);
        break;
      case '?':
      case 'F1':
        e.preventDefault();
        openShortcutsModal();
        announceToScreenReader('Keyboard shortcuts dialog opened');
        break;
    }
  });
}

/**
 * Adjust brush size via keyboard
 * @param {number} delta - Amount to change brush size slider
 */
function adjustBrushSize(delta) {
  const slider = document.getElementById('brushSizeSlider');
  if (!slider) return;

  const newValue = Math.max(
    parseInt(slider.min),
    Math.min(parseInt(slider.max), parseInt(slider.value) + delta)
  );
  slider.value = newValue;

  // Trigger change event to update brush
  slider.dispatchEvent(new Event('change'));
  announceToScreenReader(`Brush size: ${newValue}`);}

/**
 * Open the keyboard shortcuts modal
 */
function openShortcutsModal() {
  const shortcutsDialog = document.getElementById('keyboardShortcutsDialog');
  const mainContent = document.getElementById('topBar');
  const canvas = document.getElementById('imageCanvas');
  
  if (!shortcutsDialog) return;
  
  // Hide background content from screen readers
  if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
  if (canvas) canvas.setAttribute('aria-hidden', 'true');
  
  // Show modal
  shortcutsDialog.style.display = 'block';
  shortcutsDialog.setAttribute('aria-modal', 'true');
  
  // Activate focus trap
  if (state.shortcutsModalTrap) {
    setTimeout(() => state.shortcutsModalTrap.activate(), 50);
  }
}

/**
 * Close the keyboard shortcuts modal
 */
function closeShortcutsModal() {
  const shortcutsDialog = document.getElementById('keyboardShortcutsDialog');
  const mainContent = document.getElementById('topBar');
  const canvas = document.getElementById('imageCanvas');
  
  if (!shortcutsDialog) return;
  
  // Deactivate focus trap
  if (state.shortcutsModalTrap) {
    state.shortcutsModalTrap.deactivate();
  }
  
  // Hide modal
  shortcutsDialog.style.display = 'none';
  shortcutsDialog.setAttribute('aria-modal', 'false');
  
  // Restore background content for screen readers
  if (mainContent) mainContent.removeAttribute('aria-hidden');
  if (canvas) canvas.removeAttribute('aria-hidden');
}

/**
 * Announce message to screen readers via aria-live region
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announceToScreenReader(message, priority = 'polite') {
  const announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    console.warn('Screen reader announcer element not found');
    return;
  }

  announcer.textContent = '';
  announcer.setAttribute('aria-live', priority);

  // Small delay to ensure screen readers pick up the change
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Handle file loading
 * @param {File} file - File to load
 * @param {Object} canvases - Canvas objects
 */
async function handleFileLoad(file, canvases) {
  if (!file) {
    showError('No File Selected', 'Please choose an image file to anonymize.');
    return;
  }

  const isImageType = file && file.type && file.type.startsWith('image/');
  const isImageName = file && /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name || '');

  if (!isImageType && !isImageName) {
    showError(
      'Unsupported File Type',
      `The file "${file.name}" is not a supported image format. Please choose a PNG, JPEG, GIF, WebP, or BMP image.`
    );
    return;
  }

  try {
    showLoading('Loading image and extracting metadata...');
    const imageMeta = await loadImage(file, canvases, () => {
      // Update brush size after image is loaded
      const brushSizeSlider = document.getElementById('brushSizeSlider');
      if (brushSizeSlider) {
        const biggerDimension = Math.max(
          canvases.canvas.width,
          canvases.canvas.height
        );
        state.brushSize = Math.floor(
          (brushSizeSlider.value * biggerDimension) / state.brushAdjustment
        );
        setCursor(canvases.canvas, state.brushSize, state.brush);
      }
      hideLoading();
    });
    state.filename = imageMeta.filename;
    state.imageMeta = imageMeta;
    updateCanvasGuidance(state, canvases.canvas);
    showStatus(
      'Image loaded successfully. Use blur or paint to anonymize sensitive areas.',
      'success'
    );
  } catch (error) {
    hideLoading();
    showError(
      'Failed to Load Image',
      error.message || 'An unexpected error occurred while loading the image. Please try again with a different file.',
      error
    );
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
