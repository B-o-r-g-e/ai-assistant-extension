import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { copyFileSync, existsSync, mkdirSync } from 'fs';

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Ensure dist directory exists
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }

        // Copy extension files to dist (only if they exist)
        const filesToCopy = ['content.js', 'background.js', 'manifest.json'];

        filesToCopy.forEach(file => {
          if (existsSync(file)) {
            copyFileSync(file, `dist/${file}`);
            console.log(`✓ Copied ${file} to dist/`);
          } else {
            console.warn(`⚠ Warning: ${file} not found, skipping...`);
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})