import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['exifreader', 'stackblur-canvas'],
        },
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'scrubber_logo.svg',
        'scrubber_logo.png',
        'scrubber_logo_ios_homescreen.png',
      ],
      manifest: {
        short_name: 'Image Scrubber',
        name: 'Image Scrubber - Anonymize Photos',
        description:
          'A tool for anonymizing photographs taken at protests by removing EXIF data and blurring sensitive information',
        start_url: './',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'scrubber_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'scrubber_logo.svg',
            sizes: '150x150',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
});
