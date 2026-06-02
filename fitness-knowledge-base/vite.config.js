import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '健身科学知识库',
        short_name: '健身知识库',
        description: '基于PubMed最新文献的自动化知识聚合平台',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,md,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/data\/knowledge\/.*\.md$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'knowledge-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7天
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // 开发环境禁用PWA
      }
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/sport/' : '/', // 开发环境用根路径，生产环境用/sport/
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
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // 允许访问 data 文件夹
    fs: {
      allow: ['.', './data'],
    },
  },
})
