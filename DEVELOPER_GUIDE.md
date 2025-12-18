# Quick Start Guide for Developers

Welcome to Substance Scrubber! This guide helps you get started with the improved codebase.

## 📁 New Files Created

### Documentation
- **`CODE_QUALITY.md`** - Comprehensive tracking of todos, fixes, and improvements
- **`IMPROVEMENTS.md`** - Summary of all changes made
- **`src/modules/EVENT_HANDLERS_ARCHITECTURE.md`** - Deep dive into event system

### New Code Files
- **`src/utils/constants.js`** - All application constants in one place
- **`src/utils/dom.js`** - Reusable DOM utilities (debounce, throttle, etc.)

### Modified Files
All core modules now have enhanced documentation:
- `src/utils/crypto.js`
- `src/utils/canvas.js`
- `src/modules/pixelation.js`
- `src/modules/drawing.js`
- `src/modules/imageLoader.js`
- `src/modules/exifHandler.js`
- `src/modules/imageProcessing.js`
- `src/modules/rotation.js`
- `src/main.js` (partial improvements)

## 🚀 What's New

### 1. Comprehensive Documentation
Every function now has:
```javascript
/**
 * Clear description of what it does
 * 
 * @param {Type} param - Description
 * @returns {Type} Description
 * 
 * @example
 * // Usage example
 * functionName(arg);
 */
```

### 2. Constants System
Instead of magic numbers:
```javascript
// ❌ Before
const size = scale(dimension, 10, 2500, 0.1, 0.015);
canvas.width = 2500;

// ✅ After
import { PIXELATION_MIN_DIMENSION, MAX_IMAGE_DIMENSION } from './utils/constants.js';
const size = scale(dimension, PIXELATION_MIN_DIMENSION, MAX_IMAGE_DIMENSION, ...);
canvas.width = MAX_IMAGE_DIMENSION;
```

### 3. Code Quality Markers
Look for these throughout the code:
- **TODO**: Future improvements
- **FIXME**: Known bugs or security issues
- **OPTIMIZE**: Performance opportunities
- **HACK**: Code that works but needs review
- **NOTE**: Important context
- **BUG**: Active bugs
- **XXX**: Needs investigation

Example:
```javascript
// FIXME: This doesn't handle negative dimensions
// See CODE_QUALITY.md - Canvas Operations
if (width < 0) {
  console.error('Invalid width');
}
```

### 4. Better Error Handling
```javascript
// ❌ Before
export function loadImage(file, canvases) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
}

// ✅ After
export async function loadImage(file, canvases, onImageLoaded) {
  if (!file) {
    throw new Error('No file provided to loadImage');
  }
  
  try {
    // ... loading logic
  } catch (error) {
    console.error('Failed to load image:', error);
    throw error;
  }
}
```

### 5. Utility Functions
New helpers in `utils/dom.js`:

```javascript
import { debounce, throttle, showStatus } from './utils/dom.js';

// Debounce expensive operations
const debouncedResize = debounce(() => {
  updateLayout();
}, 300);

// Show user-friendly messages
showStatus('Image saved successfully!', 'success', 3000);
```

## 🔍 Finding Things

### Need to understand a module?
1. Read the file header JSDoc comment
2. Look for architecture docs (like EVENT_HANDLERS_ARCHITECTURE.md)
3. Check CODE_QUALITY.md for known issues

### Need to change a constant?
1. Check `src/utils/constants.js` first
2. All magic numbers should be there
3. Constants are organized by category

### Need to fix a bug?
1. Check CODE_QUALITY.md "Critical Issues (FIXME)" section
2. Search codebase for `// FIXME:`
3. Check if it's already documented

### Need to optimize performance?
1. Check CODE_QUALITY.md "Performance Issues (OPTIMIZE)" section
2. Search for `// OPTIMIZE:`
3. Look at metrics tracking section

## 🛠️ Development Workflow

### Before Making Changes
1. Read relevant documentation
2. Check CODE_QUALITY.md for context
3. Look for existing TODOs/FIXMEs related to your change

### While Making Changes
1. Add JSDoc comments to new functions
2. Extract magic numbers to constants.js
3. Add error handling and validation
4. Use appropriate code markers (TODO, FIXME, etc.)

### After Making Changes
1. Update CODE_QUALITY.md if you addressed items
2. Test the feature
3. Check for console errors
4. Update documentation if architecture changed

## 📝 Code Style

### Naming Conventions
```javascript
// Constants: SCREAMING_SNAKE_CASE
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Functions: camelCase
export function loadImage() {}

// Private functions: camelCase with leading underscore (optional)
function _helperFunction() {}

// Classes: PascalCase (if needed in future)
class ImageProcessor {}
```

### Commenting Style
```javascript
// Single line comments for brief notes
const size = 50; // in pixels

/**
 * Multi-line JSDoc for functions
 * Include description, params, returns, examples
 */
export function myFunction(param) {
  // TODO: Add validation
  // FIXME: Doesn't handle edge case X
  // NOTE: This must run before Y
}
```

### Import Organization
```javascript
// 1. Styles
import './styles/main.css';

// 2. External libraries
import ExifReader from 'exifreader';

// 3. Internal utilities
import { setupCanvases } from './utils/canvas.js';
import { MAX_IMAGE_DIMENSION } from './utils/constants.js';

// 4. Internal modules
import { loadImage } from './modules/imageLoader.js';
```

## 🎯 Priority System

When deciding what to work on, use this order:

1. **🔴 Critical (FIXME)** - Security, data loss, serious bugs
2. **🟡 High (OPTIMIZE)** - Performance impacting UX
3. **🟢 Medium (TODO)** - Code quality, maintainability  
4. **🔵 Low (NOTE)** - Nice-to-have features
5. **🟣 Investigation (HACK)** - Code review needed

See CODE_QUALITY.md for complete list.

## 🤝 Contributing

### Adding New Features
1. Check if constants needed → add to constants.js
2. Create function with JSDoc comments
3. Add error handling
4. Add example usage in JSDoc
5. Update CODE_QUALITY.md if relevant

### Fixing Bugs
1. Find the FIXME in CODE_QUALITY.md
2. Implement the fix
3. Add tests (when test infrastructure exists)
4. Update CODE_QUALITY.md to mark as done
5. Remove or update the FIXME comment

### Improving Documentation
1. Add missing JSDoc comments
2. Add examples to existing comments
3. Update architecture docs if needed
4. Clarify confusing code with comments

## 📚 Key Concepts

### Canvas Architecture
The app uses 6 canvases (see tech-notes.md):
- **imageCanvas**: What the user sees
- **tempCanvas**: Temporary drawing buffer
- **holderCanvas**: Snapshot before operation
- **rotationCanvas**: Original unmodified image
- **blurredCanvas**: Blur processing
- **offscreenCanvas**: Utility operations

### Drawing Flow
1. **MouseDown**: Save state to holderCanvas
2. **MouseMove**: Draw strokes
3. **MouseUp**: Apply blur/paint effects

See EVENT_HANDLERS_ARCHITECTURE.md for details.

### Privacy Features
1. **EXIF Stripping**: Happens during canvas.toBlob()
2. **Pixel Shuffling**: Cryptographically random in pixelation.js
3. **Blur**: Combines pixelation + stackBlur
4. **Paint**: Direct pixel replacement (most secure)

## 🔗 Useful Links

- Main README: `README.md`
- Technical notes: `tech-notes.md`
- Code quality tracking: `CODE_QUALITY.md`
- Improvement summary: `IMPROVEMENTS.md`
- UI redesign notes: `UI-REDESIGN.md`

## ❓ FAQ

**Q: Where do I add new configuration values?**
A: `src/utils/constants.js` - add to appropriate category

**Q: How do I know if my change breaks anything?**
A: Run the app, test the feature. Eventually we'll add automated tests.

**Q: Should I fix FIXMEs I encounter?**
A: Yes! But check CODE_QUALITY.md first for context.

**Q: Can I refactor large sections?**
A: Discuss in issues first. Big refactors need coordination.

**Q: Where do I report new bugs?**
A: Add to CODE_QUALITY.md under "Critical Issues" and open a GitHub issue.

## 🎓 Learning Resources

### Understanding the Code
1. Start with `main.js` - application entry point
2. Read `tech-notes.md` - explains the architecture
3. Check `EVENT_HANDLERS_ARCHITECTURE.md` - drawing system
4. Browse `CODE_QUALITY.md` - see what needs work

### Understanding Web APIs Used
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [EXIF Data](https://en.wikipedia.org/wiki/Exif)

---

**Ready to contribute?** Pick an item from CODE_QUALITY.md and dive in! 🚀
