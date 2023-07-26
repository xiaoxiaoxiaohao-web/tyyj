// import esbuild from 'rollup-plugin-esbuild'
// import legacy from '@vitejs/plugin-legacy'

import { fileURLToPath, URL } from 'node:url'
import { build, defineConfig, esbuildVersion } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    // esbuild({
    //   target: 'chrome64',
    //   loaders: {
    //     '.vue': 'js',
    //     '.ts': 'js'
    //   }
    // }),
    // legacy({
    //   targets:  ['defaults', 'not IE 11'],
    //   // additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    //   modernPolyfills: true,
    // }),
  ],
  build: {
    target: ['edge70', 'chrome70', 'es2020'],
    minify: 'terser'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: true,
    // host: '10.0.0.240',
    // port: 1344,
    proxy: {
      // '/api/tyyj': {
      //   target: 'http://10.194.69.22:8520/api/tyyj',
      //   changeOrigin: true,
      //   ws: true,
      //   rewrite: (path) => path.replace('/api/tyyj', "")
      // },
      '/hg': {
        target: 'http://192.168.15.12:8090/vision/RMIServlet',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace('/hg', "")
      }
    }
  }
})
