import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Force mqtt to use the package source but rely on polyfills, OR use the minified build. 
      // The minified build often has its own issues if it expects 'global' or 'Buffer' to exist.
      // Let's try relying on the standard package with full polyfills first, as the alias approach failed.
      // If this fails, we will revert to the alias approach but with better globals.
      // For now, removing the direct alias to let nodePolyfills handle 'mqtt's internal node dependencies.
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
  define: {
    // Some libraries look for global.process, global.Buffer
    'global': 'window',
  },
})
