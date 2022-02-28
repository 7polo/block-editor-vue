import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import path from "path";

const pathResolve = (pathStr) => {
  return path.resolve(__dirname, pathStr);
};

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.js'),
      name: 'BlockEditorVue',
      fileName: (format) => `block-editor-vue.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  server: {
    host: '0.0.0.0'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: [
      {
        find: '@',
        replacement: pathResolve('src')
      },
      {
        find: /^~/,
        replacement: ''
      }
    ]
  },
  plugins: [
    vue()
  ],
  css: {
    postcss: {},
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
})