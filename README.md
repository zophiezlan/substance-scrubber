# Substance Scrubber

A modern, privacy-focused tool for anonymizing photos of substances and settings before sharing with anonymous harm reduction communities. Designed to strip EXIF metadata and blur or cover identifying details so drug checking reports can be uploaded without exposing people, locations, or devices.

[![CI](https://github.com/zophiezlan/substance-scrubber/actions/workflows/ci.yml/badge.svg)](https://github.com/zophiezlan/substance-scrubber/actions/workflows/ci.yml)
[![Deploy](https://github.com/zophiezlan/substance-scrubber/actions/workflows/deploy.yml/badge.svg)](https://github.com/zophiezlan/substance-scrubber/actions/workflows/deploy.yml)

## Features

- ✅ **EXIF Metadata Removal** - Strips all identifying metadata from lab or scene photos
- ✅ **Advanced Blurring** - Cryptographically secure pixel shuffling with noise injection
- ✅ **Paint Tool** - Cover sensitive areas with solid color when you need guaranteed obscuring
- ✅ **Multiple Brush Types** - Freehand, rectangle, and tap modes for quick cleanup
- ✅ **100% Client-Side** - All processing happens in your browser; nothing is uploaded
- ✅ **Offline PWA** - Works without internet connection, installable on mobile
- ✅ **Modern Tech Stack** - Built with Vite, ES6+ modules, and modern best practices

## Usage

### Online

Visit the [live tool](https://zophiezlan.github.io/substance-scrubber/) to use it directly in your browser.

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
git clone https://github.com/zophiezlan/substance-scrubber.git
cd substance-scrubber

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

**Security Note:** The blur function uses cryptographically secure pixel shuffling with noise injection. However, for the highest security on critical information, use the paint tool. When sharing photos of drugs or paraphernalia for community alerts, intentionally cover backgrounds, hands, or any distinguishing surfaces before upload.

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
substance-scrubber/
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
│       ├── ci.yml          # GitHub Actions lint/test/build
│       └── deploy.yml      # GitHub Pages build and deploy
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
- GitHub Actions for CI/CD and GitHub Pages

All PRs must pass linting and tests before merging.

## CI/CD & Deployment

- **CI (ci.yml):** Runs `npm ci`, linting, tests, and a production build on every push and pull request to `main`.
- **Deploy (deploy.yml):** Builds with the correct GitHub Pages base path and publishes the `dist/` output to GitHub Pages on pushes to `main` or manual runs.
- **Base path:** The Vite config reads `VITE_BASE_PATH`. Locally it defaults to `./`, but the deploy workflow sets `/substance-scrubber/` so assets and the PWA manifest resolve correctly on GitHub Pages. If you deploy elsewhere, set `VITE_BASE_PATH` to match your path before running `npm run build`.

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

## Support

- **Issues:** [GitHub Issues](https://github.com/zophiezlan/substance-scrubber/issues)
- **Email:** zophietucker@gmail.com

---

**Remember:** Always verify your anonymized images before sharing. Review carefully to ensure no identifying information remains visible.
