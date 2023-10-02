import { resolve } from 'path';
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
    plugins: [crx({ manifest })],
    server: { port: 3000, hmr: { port: 3000 } },
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
              content: resolve(__dirname, 'content.js'),
            }
        }
    }
})
