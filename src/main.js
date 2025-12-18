/**
 * Main application entry point
 * Image Scrubber - Modern anonymization tool for harm reduction
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
};

// Initialize application
function init() {
  const canvases = setupCanvases();
  const { canvas } = canvases;

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
      }
    });
  }

  // Setup rotate button
  const rotateButton = document.getElementById('rotate');
  if (rotateButton) {
    rotateButton.addEventListener('click', () => {
      rotateCanvas(canvases);
    });
  }

  // Setup about button
  const aboutButton = document.getElementById('about');
  if (aboutButton) {
    aboutButton.addEventListener('click', () => {
      const info = document.getElementById('imageScrubberInfo');
      if (info) {
        info.style.display = info.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Setup drag and drop
  setupDragAndDrop((file) => handleFileLoad(file, canvases));

  // Hide info panel on start
  const info = document.getElementById('imageScrubberInfo');
  if (info) {
    info.style.display = 'none';
  }
}

/**
 * Handle file loading
 * @param {File} file - File to load
 * @param {Object} canvases - Canvas objects
 */
async function handleFileLoad(file, canvases) {
  try {
    state.filename = await loadImage(file, canvases, () => {
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
  } catch (error) {
    console.error('Error loading image:', error);
    alert('Error loading image. Please try again.');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
