/**
 * Main application entry point
 * Substance Scrubber - Modern anonymization tool for harm reduction
 */

import './styles/main.css';
import { setupCanvases } from './utils/canvas.js';
import { setCursor } from './modules/drawing.js';
import { saveImage } from './modules/imageProcessing.js';
import { loadImage, setupDragAndDrop } from './modules/imageLoader.js';
import { rotateCanvas } from './modules/rotation.js';
import { createEventHandlers } from './modules/eventHandlers.js';
import jscolor from '@eastdesire/jscolor';

// Application state
const state = {
  filename: '',
  brushSize: 50,
  blurAmount: 75,
  brushAdjustment: 800,
  painting: 'blur', // 'blur', 'paint', or 'undo'
  brush: 'round', // 'round', 'area', or 'tap'
  paintColor: '#000000',
  imageMeta: null,
};

// Initialize application
function init() {
  const canvases = setupCanvases();
  const { canvas } = canvases;

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
    brushSizeSlider.addEventListener('change', () => {
      const biggerDimension = Math.max(canvas.width, canvas.height);
      state.brushSize = Math.floor(
        (brushSizeSlider.value * biggerDimension) / state.brushAdjustment
      );
      setCursor(canvas, state.brushSize, state.brush);
    });
  }

  // Setup blur amount slider
  const blurAmountSlider = document.getElementById('blurAmountSlider');
  if (blurAmountSlider) {
    blurAmountSlider.addEventListener('change', () => {
      state.blurAmount = Math.floor(blurAmountSlider.value);
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
    saveButton.addEventListener('click', () => {
      if (state.filename) {
        saveImage(canvas, state.filename);
        showStatus('Image saved. You can clear the session when finished.', 'success');
      } else {
        showStatus('Load an image before saving.', 'warning');
      }
    });
  }

  // Setup rotate button
  const rotateButton = document.getElementById('rotate');
  if (rotateButton) {
    rotateButton.addEventListener('click', () => {
      rotateCanvas(canvases);
      showStatus('Image rotated.', 'info');
    });
  }

  // Setup about button
  const aboutButton = document.getElementById('about');
  if (aboutButton) {
    const info = document.getElementById('imageScrubberInfo');
    if (info) {
      info.style.display = 'none';
    }

    aboutButton.setAttribute('aria-expanded', 'false');
    aboutButton.addEventListener('click', () => {
      const isOpen = info && info.style.display !== 'none';
      if (info) {
        info.style.display = isOpen ? 'none' : 'block';
      }
      aboutButton.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
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

  // Setup canvas guidance updates
  window.addEventListener('resize', () => updateCanvasGuidance(state, canvas));

  // Setup hygiene control
  const clearSessionButton = document.getElementById('clearSession');
  if (clearSessionButton) {
    clearSessionButton.addEventListener('click', () => {
      clearSession(canvases);
      state.filename = '';
      state.imageMeta = null;
      showStatus('Session cleared from memory.', 'success');
      updateCanvasGuidance(state, canvas);
    });
  }

  updateCanvasGuidance(state, canvas);
}

/**
 * Setup dark mode theme toggle
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

function setupNetworkBanner() {
  const banner = document.getElementById('networkBanner');
  if (!banner) return;

  const updateStatus = () => {
    if (navigator.onLine) {
      banner.textContent =
        'Online detected — for maximum privacy, toggle airplane mode or offline before loading photos.';
      banner.className = 'status-banner warning';
    } else {
      banner.textContent =
        'Offline mode: all processing stays on this device. You can safely scrub images without connectivity.';
      banner.className = 'status-banner success';
    }
    banner.style.display = 'flex';
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

function setupAccessibleControls() {
  const openLabel = document.querySelector('label[for="file-input"]');
  const fileInput = document.getElementById('file-input');
  if (openLabel && fileInput) {
    addKeyboardActivation(openLabel, () => fileInput.click());
  }

  document
    .querySelectorAll(
      'input[type="radio"], input[type="range"], button, a, [role="button"]'
    )
    .forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
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
    guidance.textContent =
      'Load a photo to view resolution and fit guidance. Images larger than 2500px are safely resized for performance.';
    guidance.className = 'status-banner muted';
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

  guidance.textContent = `${scaleMessage} ${viewportMessage}`;
  guidance.className = `status-banner ${resized ? 'info' : 'muted'}`;
  guidance.style.display = 'flex';
}

function clearSession(canvases) {
  const canvasList = [
    canvases.canvas,
    canvases.tempCanvas,
    canvases.holderCanvas,
    canvases.rotationCanvas,
    canvases.blurredCanvas,
    canvases.offscreenCanvas,
  ];

  canvasList.forEach((canvasEl) => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = 1;
    canvasEl.height = 1;
    if (ctx) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  });

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.value = '';
  }
}

function addKeyboardActivation(element, callback) {
  if (!element || typeof callback !== 'function') return;

  const handler = (event) => {
    const isKeyboard =
      event.type === 'keydown' && (event.key === 'Enter' || event.key === ' ');
    if (event.type === 'click' || isKeyboard) {
      if (isKeyboard) {
        event.preventDefault();
      }
      callback(event);
    }
  };

  element.addEventListener('click', handler);
  element.addEventListener('keydown', handler);
}

/**
 * Handle file loading
 * @param {File} file - File to load
 * @param {Object} canvases - Canvas objects
 */
async function handleFileLoad(file, canvases) {
  if (!file) {
    showStatus('No file selected. Please choose an image to scrub.', 'warning');
    return;
  }

  const isImageType = file && file.type && file.type.startsWith('image/');
  const isImageName = file && /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name || '');

  if (!isImageType && !isImageName) {
    showStatus('Unsupported file type. Please choose an image.', 'error');
    return;
  }

  try {
    showStatus('Loading image and checking metadata…', 'info');
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
    });
    state.filename = imageMeta.filename;
    state.imageMeta = imageMeta;
    updateCanvasGuidance(state, canvases.canvas);
    showStatus(
      'EXIF removed and image ready. Paint over critical details before saving.',
      'success'
    );
  } catch (error) {
    console.error('Error loading image:', error);
    showStatus('Error loading image. Please try again with a supported file.', 'error');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
