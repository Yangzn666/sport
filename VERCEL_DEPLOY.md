# Vercel部署说明

## 自动部署配置

Vercel会自动检测Vite项目,无需额外配置文件。

## Vercel控制台设置

在Vercel项目设置中配置:

1. **Build Command**: 留空(自动检测)
2. **Output Directory**: `dist`
3. **Install Command**: 留空(自动检测)
4. **Development Command**: `npm run dev`

## 路由配置

由于是多页面应用,需要在Vercel控制台添加:

**Rewrites**:
- Source: `/(.*)`
- Destination: `/index.html`

## 环境变量

无需特殊环境变量。

## Node.js版本

Vercel会自动使用合适的Node.js版本(>=18)。
