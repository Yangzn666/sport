import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 自定义插件:复制静态HTML文件到dist目录
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const filesToCopy = ['portal.html', 'THE_GOAT_黄佳炀_球王传奇.html']
      filesToCopy.forEach(file => {
        const src = path.resolve(__dirname, file)
        const dest = path.resolve(__dirname, 'dist', file)
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
          console.log(`✓ Copied ${file} to dist/`)
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyStaticFiles()],
  base: '/sport/', // GitHub Pages repository name
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 允许访问 data 文件夹
    fs: {
      allow: ['.', './data'],
    },
  },
})
