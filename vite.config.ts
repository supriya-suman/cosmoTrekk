// vite.config.ts — tells Vite (our build tool) how to build CosmoTrekk.
import { defineConfig } from 'vite'; // helper that gives type hints for the config object
import react from '@vitejs/plugin-react'; // lets Vite understand React's JSX syntax
import { VitePWA } from 'vite-plugin-pwa'; // turns the site into an installable Progressive Web App

export default defineConfig({ // export the configuration so Vite can read it
  plugins: [ // list of plugins Vite should run
    react(), // enable React support
    VitePWA({ // configure the PWA plugin
      registerType: 'prompt', // a new version shows an "Update available" banner instead of silently reloading
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'], // extra static files to cache for offline use
      manifest: { // the Web App Manifest = how the installed app looks
        name: 'CosmoTrekk — Junior Astronaut Mission Trainer', // full name shown on install
        short_name: 'CosmoTrekk', // short name under the home-screen icon
        description: 'CosmoTrekk — Your Journey Has No Horizon. A space-science adventure game.', // store-style description
        theme_color: '#0b1430', // colour of the browser toolbar
        background_color: '#050a1a', // splash-screen background
        display: 'standalone', // open without browser address bar when installed
        start_url: '/', // page opened when the icon is tapped
        icons: [ // home-screen icons in several sizes
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, // small icon
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }, // large icon
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }, // Android adaptive icon
        ],
      },
      workbox: { // Workbox = library that writes the service worker (offline cache)
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'], // cache the whole app shell + bundled missions
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // Phaser is big, so allow files up to 4 MB in the cache
        navigateFallbackDenylist: [/^\/api\//], // never answer /api requests from the offline cache
        runtimeCaching: [ // rules for requests made while the app runs
          { urlPattern: /\/api\//, handler: 'NetworkOnly' }, // API calls (may carry secrets / generate questions) are NEVER cached
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 2000 }, // Phaser is ~1.5 MB; silence the size warning
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }, // Vitest (unit test runner) settings
} as Parameters<typeof defineConfig>[0]); // type cast so the "test" key is accepted
