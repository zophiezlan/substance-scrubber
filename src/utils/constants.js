/**
 * Application Constants
 * Centralized configuration values for the Substance Scrubber application
 * @module utils/constants
 */

// ===================================
// Canvas and Image Processing
// ===================================

/**
 * Maximum dimension (width or height) for image processing
 * Images larger than this will be scaled down for performance
 * @constant {number}
 */
export const MAX_IMAGE_DIMENSION = 2500;

/**
 * Default brush adjustment factor for calculating brush size
 * Used in formula: (sliderValue * canvasDimension) / BRUSH_ADJUSTMENT
 * @constant {number}
 */
export const BRUSH_ADJUSTMENT_FACTOR = 800;

/**
 * Minimum pixelation size scaling factor
 * @constant {number}
 */
export const MIN_PIXELATION_SCALE = 0.015;

/**
 * Maximum pixelation size scaling factor
 * @constant {number}
 */
export const MAX_PIXELATION_SCALE = 0.1;

/**
 * Base dimension for pixelation scaling calculations
 * @constant {number}
 */
export const PIXELATION_BASE_DIMENSION = 2500;

/**
 * Minimum dimension for pixelation calculations
 * @constant {number}
 */
export const PIXELATION_MIN_DIMENSION = 10;

/**
 * Maximum pixel noise variation (added/subtracted to prevent pixel reconstruction)
 * @constant {number}
 */
export const PIXEL_NOISE_RANGE = 3;

/**
 * Divisor for pixel shuffle range calculation
 * @constant {number}
 */
export const SHUFFLE_RANGE_DIVISOR = 100;

// ===================================
// Default Values
// ===================================

/**
 * Default brush size slider value (0-100 scale)
 * @constant {number}
 */
export const DEFAULT_BRUSH_SIZE = 55;

/**
 * Default blur amount/radius (pixels)
 * @constant {number}
 */
export const DEFAULT_BLUR_AMOUNT = 75;

/**
 * Default painting action mode
 * @constant {string}
 */
export const DEFAULT_PAINTING_MODE = 'blur';

/**
 * Default brush type
 * @constant {string}
 */
export const DEFAULT_BRUSH_TYPE = 'round';

/**
 * Default paint color (hex)
 * @constant {string}
 */
export const DEFAULT_PAINT_COLOR = '#000000';

// ===================================
// Slider Ranges
// ===================================

/**
 * Brush size slider configuration
 * @constant {Object}
 */
export const BRUSH_SIZE_SLIDER = {
  min: 10,
  max: 100,
  default: DEFAULT_BRUSH_SIZE,
};

/**
 * Blur amount slider configuration
 * @constant {Object}
 */
export const BLUR_AMOUNT_SLIDER = {
  min: 40,
  max: 150,
  default: DEFAULT_BLUR_AMOUNT,
};

// ===================================
// Painting Modes
// ===================================

/**
 * Available painting action modes
 * @constant {Object}
 */
export const PAINTING_MODES = {
  BLUR: 'blur',
  PAINT: 'paint',
  UNDO: 'undo',
};

/**
 * Available brush types
 * @constant {Object}
 */
export const BRUSH_TYPES = {
  ROUND: 'round',
  AREA: 'area',
  TAP: 'tap',
};

// ===================================
// File Handling
// ===================================

/**
 * Supported image file extensions
 * @constant {string[]}
 */
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

/**
 * Supported image MIME types
 * @constant {string[]}
 */
export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];

/**
 * Output file suffix for saved images
 * @constant {string}
 */
export const OUTPUT_FILE_SUFFIX = '_scrubbed';

/**
 * Output image format
 * @constant {string}
 */
export const OUTPUT_IMAGE_FORMAT = 'image/png';

/**
 * Output image quality (0-1)
 * @constant {number}
 */
export const OUTPUT_IMAGE_QUALITY = 0.8;

// ===================================
// UI & Animation
// ===================================

/**
 * Status banner auto-hide delay (milliseconds)
 * NOTE: Currently not implemented, consider adding for transient messages
 * @constant {number}
 */
export const STATUS_BANNER_TIMEOUT = 5000;

/**
 * Cursor size scaling factor for custom canvas cursor
 * @constant {number}
 */
export const CURSOR_SIZE_SCALE = 2;

/**
 * Cursor border offset (pixels)
 * @constant {number}
 */
export const CURSOR_BORDER_OFFSET = 2;

/**
 * Debounce delay for window resize events (milliseconds)
 * @constant {number}
 */
export const RESIZE_DEBOUNCE_DELAY = 300;

// ===================================
// Rotation
// ===================================

/**
 * Rotation angle in radians (90 degrees clockwise)
 * @constant {number}
 */
export const ROTATION_ANGLE = Math.PI / 2;

// ===================================
// Storage Keys
// ===================================

/**
 * LocalStorage key for theme preference
 * @constant {string}
 */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Available theme values
 * @constant {Object}
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// ===================================
// Validation
// ===================================

/**
 * Maximum file size for images (bytes) - 50MB
 * TODO: Implement file size validation
 * @constant {number}
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Minimum valid brush size
 * @constant {number}
 */
export const MIN_BRUSH_SIZE = 1;

/**
 * Maximum valid brush size
 * @constant {number}
 */
export const MAX_BRUSH_SIZE = 500;
