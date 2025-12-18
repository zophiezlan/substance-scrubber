# Code Quality Improvements Guide

This document tracks areas for improvement, optimization, and known issues in the Substance Scrubber codebase.

## 🔴 Critical Issues (FIXME)

### Security
- [ ] **XSS Prevention in EXIF Display** (`exifHandler.js`)
  - Current: EXIF descriptions are inserted as HTML without escaping
  - Risk: Malicious EXIF data could execute scripts
  - Fix: Properly escape HTML before inserting into DOM
  - Location: `displayExifData()` function

- [ ] **Crypto API Fallback** (`crypto.js`)
  - Current: Falls back to Math.random() if crypto unavailable
  - Risk: Compromises privacy guarantees on older browsers
  - Fix: Show clear warning or refuse to operate without crypto
  - Location: `randomCryptoNumber()` function

### Accessibility
- [ ] **EXIF Modal Focus Trap** (`exifHandler.js`)
  - Current: Users can tab outside the modal
  - Risk: Poor accessibility, confusing keyboard navigation
  - Fix: Implement proper focus trap pattern
  - Location: `displayExifData()` function

- [ ] **Missing ARIA Labels** (throughout)
  - Current: Many interactive elements lack proper ARIA attributes
  - Risk: Poor screen reader experience
  - Fix: Audit all interactive elements, add ARIA labels

### File Handling
- [ ] **File Size Validation** (`imageLoader.js`)
  - Current: No file size limit enforced
  - Risk: Very large files could crash browser/tab
  - Fix: Add MAX_FILE_SIZE check before processing
  - Constant defined but not used

- [ ] **Filename Sanitization** (`imageProcessing.js`)
  - Current: Filenames not sanitized before download
  - Risk: Invalid characters could cause download failures
  - Fix: Remove/replace invalid filename characters
  - Location: `saveImage()` function

## 🟡 Performance Issues (OPTIMIZE)

### Canvas Operations
- [ ] **getBoundingClientRect() Caching** (`canvas.js`)
  - Current: Called on every mouse move event
  - Impact: Forces layout reflow, can cause jank
  - Fix: Cache rect and update only on window resize
  - Location: `getMousePos()` function
  - Estimated gain: 20-30% better mouse tracking performance

- [ ] **Cursor Image Regeneration** (`drawing.js`)
  - Current: Cursor regenerated every time brush size changes
  - Impact: Unnecessary work, especially during drag to resize
  - Fix: Cache cursors by size, reuse if available
  - Location: `setCursor()` function
  - Estimated gain: Smoother brush size adjustments

- [ ] **Large Image Processing** (`pixelation.js`)
  - Current: All processing on main thread
  - Impact: UI freezes during pixelation of large images
  - Fix: Move pixel shuffling to Web Worker
  - Location: `shufflePixels()` function
  - Estimated gain: UI remains responsive during processing

- [ ] **Image Loading for Large Files** (`imageLoader.js`)
  - Current: Uses FileReader.readAsDataURL()
  - Impact: High memory usage for large files
  - Fix: Use createImageBitmap() for more efficient loading
  - Location: `loadImage()` function

## 🟢 Code Quality Issues (TODO)

### Input Validation
- [ ] **Missing Parameter Validation** (multiple files)
  - Current: Many functions don't validate parameters
  - Risk: Cryptic errors, hard to debug
  - Fix: Add validation at function entry points
  - Priority: High

- [ ] **Division by Zero Check** (`crypto.js`)
  - Current: scale() doesn't check if inMin === inMax
  - Risk: Returns NaN or Infinity
  - Fix: Add check and return sensible default
  - Location: `scale()` function

### Error Handling
- [ ] **Silent Failures** (throughout)
  - Current: Many errors only logged to console
  - Risk: Users don't know something went wrong
  - Fix: Show user-friendly error messages
  - Affected: File loading, saving, rotation

- [ ] **No Error Boundaries** (`main.js`)
  - Current: Unhandled errors crash the app
  - Risk: Single error makes app unusable
  - Fix: Add try-catch around major operations
  - Priority: Medium

### Architecture
- [ ] **Global State in Rotation** (`rotation.js`)
  - Current: Uses module-level `rotating` flag
  - Issue: Not ideal for testability/reusability
  - Fix: Consider class-based approach or pass as parameter

- [ ] **Magic Numbers** (partially addressed)
  - Current: Some magic numbers still in code
  - Issue: Hard to understand intent
  - Fix: Extract to constants.js with descriptive names
  - Examples: cursor offset (2, 1), line width (10)

## 🔵 Enhancement Opportunities (NOTE)

### User Experience
- [ ] **Loading States**
  - Add loading indicators for slow operations
  - Show progress during large image processing
  - Locations: File loading, blur operations, rotation

- [ ] **Keyboard Shortcuts**
  - Implement common shortcuts (Ctrl+S for save, etc.)
  - Add shortcuts for tool switching (B for brush, P for paint)
  - Document in UI

- [ ] **Undo/Redo Stack**
  - Currently only supports undoing blur to original
  - Implement proper undo/redo for all operations
  - Would greatly improve user experience

- [ ] **Multi-touch Support**
  - Currently ignores multi-touch
  - Could support pinch-to-zoom
  - Location: `eventHandlers.js`

### Privacy Features
- [ ] **Automatic Background Blur**
  - ML-based automatic detection of backgrounds
  - One-click blur of entire background
  - Would significantly improve UX for harm reduction use case

- [ ] **Privacy Audit Report**
  - Generate downloadable report of what was removed
  - List EXIF data removed, areas blurred, etc.
  - Helps users document their privacy measures

### Developer Experience
- [ ] **TypeScript Migration**
  - Add TypeScript for better type safety
  - Reduce runtime errors
  - Improve IDE autocomplete

- [ ] **Unit Test Coverage**
  - Add tests for crypto functions (critical for privacy)
  - Test canvas utilities
  - Test file validation

- [ ] **Integration Tests**
  - Test complete workflows (load, edit, save)
  - Test on multiple browsers
  - Automated visual regression testing

## 🟣 Known Quirks (HACK)

### Rotation Transform
- **Location**: `rotation.js`, `rotateCanvas()` function
- **Issue**: The translate() call uses `ch / cw` which seems mathematically odd
- **Impact**: Works correctly but code is confusing
- **Investigation needed**: Verify if this is the simplest/most correct approach
- **Math**: For 90° rotation, typical transform is:
  ```
  translate(newWidth, 0)  // Move to top-right
  rotate(90deg)           // Rotate clockwise
  ```
  Current code doesn't match this pattern

### Blur Canvas Source
- **Location**: `rotation.js`, blurredCanvas rotation
- **Issue**: Uses `rotationImageData` instead of `blurredImageData`
- **Impact**: Unclear if this is intentional or a bug
- **Question**: Should blurred areas be preserved during rotation?
- **Action**: Document the intended behavior

### Pixelation Scale
- **Location**: `pixelation.js`, `pixelateCanvas()` function
- **Issue**: Uses `ctx.scale(w * size, h * size)` which seems redundant
- **Impact**: Might not do anything useful
- **Investigation needed**: Check if this can be removed

## 📊 Metrics to Track

### Performance Metrics
- Time to load 5MB image
- Time to apply blur to 50% of 2000x2000 image
- Frame rate during brush stroke
- Memory usage during editing

### Privacy Metrics
- Percentage of EXIF tags successfully removed (should be 100%)
- Entropy of pixel shuffle (measure of randomness)
- Reversibility testing (can original be reconstructed?)

### User Experience Metrics
- Time from image load to first edit
- Number of clicks/actions to anonymize typical image
- Error rate (how often do operations fail?)
- Browser compatibility (% working across browsers)

## 🔧 Maintenance Tasks

### Regular Updates
- [ ] Update dependencies monthly (security patches)
- [ ] Review ExifReader for new EXIF tag support
- [ ] Test on latest browser versions
- [ ] Check Web Crypto API changes

### Documentation
- [ ] Keep JSDoc comments up to date
- [ ] Update tech-notes.md when architecture changes
- [ ] Document all environment variables
- [ ] Maintain changelog

## Priority Levels

1. **🔴 Critical (FIXME)**: Security issues, data loss risks, serious bugs
2. **🟡 High (OPTIMIZE)**: Performance issues affecting UX
3. **🟢 Medium (TODO)**: Code quality, maintainability
4. **🔵 Low (NOTE)**: Nice-to-have features, minor improvements
5. **🟣 Investigation (HACK)**: Code that works but needs review

## Contributing

When adding TODO/FIXME/etc comments in code:
- Use consistent prefixes: TODO, FIXME, HACK, NOTE, OPTIMIZE, BUG, XXX
- Include context about WHY it needs attention
- Reference this file for coordination
- Add issues to GitHub for tracking

Example:
```javascript
// FIXME: This doesn't handle negative dimensions - causes canvas errors
// See CODE_QUALITY.md - Canvas Operations section
if (width < 0 || height < 0) {
  console.error('Invalid dimensions');
  return;
}
```
