import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mdx(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://wica.pages.dev',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-markdown': ['react-markdown', 'remark-gfm', 'remark-math', 'rehype-highlight', 'rehype-katex', 'rehype-raw', 'rehype-sanitize'],
          'vendor-mdx': ['@mdx-js/react'],
          'vendor-mermaid': ['mermaid'],
        },
      },
    },
    modulePreload: {
      polyfill: true,
    },
  },
})
