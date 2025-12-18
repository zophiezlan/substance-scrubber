# Image Scrubber

A modern, privacy-focused tool for anonymizing photographs by removing EXIF metadata and blurring sensitive information. Perfect for harm reduction, privacy protection, and any situation where you need to share images safely and anonymously.

[![CI/CD](https://github.com/everestpipkin/image-scrubber/actions/workflows/ci.yml/badge.svg)](https://github.com/everestpipkin/image-scrubber/actions/workflows/ci.yml)

## Features

- ✅ **EXIF Metadata Removal** - Strips all identifying metadata from images
- ✅ **Advanced Blurring** - Cryptographically secure pixel shuffling with noise injection
- ✅ **Paint Tool** - Cover sensitive areas with solid color
- ✅ **Multiple Brush Types** - Freehand, rectangle, and tap modes
- ✅ **100% Client-Side** - All processing happens in your browser, nothing is uploaded
- ✅ **Offline PWA** - Works without internet connection, installable on mobile
- ✅ **Modern Tech Stack** - Built with Vite, ES6+ modules, and modern best practices

## Usage

### Online

Visit the [live tool](https://everestpipkin.github.io/image-scrubber/) to use it directly in your browser.

### Mobile App Installation

**iOS:**

1. Open the tool in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android:**

1. Open the tool in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"

### Offline Usage (Most Secure)

For maximum privacy and security:

**Mobile:** Load the page, then enable airplane mode before opening any photos

**Desktop:** Download the tool and run locally:

```bash
# Clone the repository
git clone https://github.com/everestpipkin/image-scrubber.git
cd image-scrubber

# Install dependencies
npm install

# Build the project
npm run build

# Serve the built files locally
npm run preview
```

Then disconnect from the internet before using it.

## How to Use

1. **Open an Image** - Click "Open Image" or drag and drop a photo
2. **Review EXIF Data** - The tool displays metadata that will be removed
3. **Edit the Image** (optional):
   - **Blur Mode** - Apply cryptographically secure blurring
   - **Paint Mode** - Cover areas with solid color (most secure)
   - **Undo Mode** - Restore original areas
4. **Adjust Settings**:
   - Choose brush type (Brush, Rectangle, or Tap)
   - Adjust brush size and blur radius
5. **Save** - Download your anonymized image

**Security Note:** The blur function uses cryptographically secure pixel shuffling with noise injection. However, for the highest security on critical information, use the paint tool.

## Development

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
safer-image-pro/
├── src/
│   ├── main.js              # Application entry point
│   ├── modules/             # Feature modules
│   │   ├── drawing.js       # Drawing tools (paint, blur, undo)
│   │   ├── eventHandlers.js # Mouse/touch event handling
│   │   ├── exifHandler.js   # EXIF data extraction
│   │   ├── imageLoader.js   # Image loading and drag-drop
│   │   ├── imageProcessing.js # Image save/processing
│   │   ├── pixelation.js    # Pixel shuffling for privacy
│   │   └── rotation.js      # Image rotation
│   ├── utils/               # Utility functions
│   │   ├── canvas.js        # Canvas utilities
│   │   └── crypto.js        # Cryptographic functions
│   └── styles/
│       └── main.css         # Application styles
├── public/                  # Static assets
├── dist/                    # Production build output
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
├── vite.config.js          # Vite configuration
├── vitest.config.js        # Test configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Dependencies and scripts
```

### Tech Stack

- **Build Tool:** Vite 6
- **Language:** Modern JavaScript (ES6+ modules)
- **Testing:** Vitest with jsdom
- **Linting:** ESLint 9 (flat config)
- **Formatting:** Prettier 3
- **PWA:** vite-plugin-pwa with Workbox
- **Dependencies:**
  - `exifreader` - Modern EXIF data extraction
  - `stackblur-canvas` - Fast canvas blurring
  - `@eastdesire/jscolor` - Color picker

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Quality

This project uses:

- ESLint for code linting
- Prettier for code formatting
- Vitest for unit testing
- GitHub Actions for CI/CD

All PRs must pass linting and tests before merging.

## Privacy & Security

**All processing is 100% client-side.** No images or data are ever uploaded to any server.

The blur function:

1. Pixelates the image
2. Shuffles pixels using cryptographically secure randomness
3. Adds noise to prevent pixel reconstruction
4. Applies Gaussian blur

For maximum security:

- Use the paint tool for highly sensitive content
- Run offline (airplane mode or downloaded version)
- Avoid browser extensions that might access page content

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

ISC

## Credits

Original concept and implementation by Everest Pipkin.

Modernized version uses code and inspiration from:

- [exif-js](https://github.com/exif-js/exif-js) (now using exifreader)
- [StackBlur](http://quasimondo.com/StackBlurForCanvas/StackBlur.js)
- Various Stack Overflow contributors (see original code comments)

## Additional Resources

For more privacy and harm reduction resources:

- [Privacy Guide (Google Doc)](https://docs.google.com/document/d/1615pZB11BhsR0KtvyiXfzfMUBlxZi47HzzhWHIRpxwU/edit)
- [Privacy Guide (Pastebin)](https://pastebin.com/TPgtvmVB)

## Support

- **Issues:** [GitHub Issues](https://github.com/everestpipkin/image-scrubber/issues)
- **Email:** everest.pipkin@gmail.com

---

**Remember:** Always verify your anonymized images before sharing. Review carefully to ensure no identifying information remains visible.
