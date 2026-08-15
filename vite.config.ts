import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import obfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      apply: 'build', // only runs on `vite build`, not `vite dev`
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        unicodeEscapeSequence: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
  },
})
