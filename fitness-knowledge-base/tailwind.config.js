/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用类名控制的暗色模式
  theme: {
    extend: {
      colors: {
        // 主色调 - 深蓝色系(学术权威感)
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf6',
          500: '#0c8ee9',  // 主色
          600: '#0070c9',
          700: '#0059a3',
          800: '#064b85',
          900: '#0d3f6d',
        },
        // 中性色 - Slate 系(柔和对比)
        neutral: {
          50: '#f8fafc',    // 背景
          100: '#f1f5f9',
          200: '#e2e8f0',   // 边框
          300: '#cbd5e1',
          400: '#94a3b8',   // 次要文字
          500: '#64748b',
          600: '#475569',   // 正文
          700: '#334155',
          800: '#1e293b',   // 标题
          900: '#0f172a',   // 深色背景
        },
        // 强调色
        accent: {
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#22c55e',
          purple: '#a855f7',
        },
        'fitness-blue': '#3b82f6',
        'fitness-orange': '#f97316',
        'fitness-green': '#22c55e',
        'fitness-purple': '#a855f7',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [typography],
}
