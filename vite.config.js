import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
