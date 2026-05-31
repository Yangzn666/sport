import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 自定义插件:复制静态HTML文件到dist目录
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const filesToCopy = ['portal.html', 'goat.html']
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
  base: process.env.VERCEL ? '/' : '/sport/', // Vercel用根路径,GitHub Pages用/sport/
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 启用压缩
    minify: 'esbuild', // 使用esbuild更快
    // 增加chunk大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用sourcemap用于调试(生产环境可关闭)
    sourcemap: false,
  },
  server: {
    // 允许访问 data 文件夹
    fs: {
      allow: ['.', './data'],
    },
  },
})
