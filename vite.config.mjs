import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: path.join(root, 'client'),
	base: './',
	plugins: [vue()],
	build: {
		outDir: path.join(root, 'dist'),
		emptyOutDir: true,
		assetsDir: 'assets'
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:' + (process.env.PORT || '3000'),
				changeOrigin: true
			}
		}
	}
})
