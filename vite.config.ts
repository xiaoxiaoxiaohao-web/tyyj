import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
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
		})
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
		proxy: {
			'/hg': {
				target: 'http://192.168.15.12:8090/vision/RMIServlet',
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace('/hg', "")
			}
		}
	}
})
