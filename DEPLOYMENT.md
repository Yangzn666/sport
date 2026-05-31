# 🚀 部署指南

本文档说明如何将健身知识库网站部署到不同的平台。

---

## 📦 GitHub Pages (推荐)

### 自动部署(使用GitHub Actions)

1. **创建GitHub Actions工作流**

在项目根目录创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **配置Vite为GitHub Pages优化**

修改 `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sport/', // 替换为您的仓库名称
})
```

3. **提交并推送**

```bash
git add .github/workflows/deploy.yml vite.config.js
git commit -m "Add GitHub Pages deployment workflow"
git push
```

4. **启用GitHub Pages**

- 访问 https://github.com/Yangzn666/sport/settings/pages
- Source选择 "GitHub Actions"
- 等待几分钟,网站将自动部署

5. **访问网站**

您的网站将在以下地址可用:
```
https://yangzn666.github.io/sport/
```

---

## 🌐 Vercel (最简单)

### 一键部署

1. **注册Vercel账号**

访问 https://vercel.com/signup

2. **导入GitHub仓库**

- 点击 "New Project"
- 选择 "Import Git Repository"
- 选择 `Yangzn666/sport` 仓库

3. **配置构建设置**

Vercel会自动检测Vite项目,无需额外配置

4. **部署**

点击 "Deploy",等待几分钟完成

5. **访问网站**

您的网站将在以下地址可用:
```
https://sport.vercel.app
```

### 自定义域名(可选)

1. 在Vercel项目设置中添加自定义域名
2. 在DNS提供商处添加CNAME记录
3. 等待DNS传播(通常几分钟到几小时)

---

## ☁️ Netlify

### 部署步骤

1. **注册Netlify账号**

访问 https://app.netlify.com/signup

2. **连接GitHub**

- 点击 "New site from Git"
- 选择 "GitHub"
- 授权访问您的仓库

3. **选择仓库**

选择 `Yangzn666/sport`

4. **配置构建设置**

```
Build command: npm run build
Publish directory: dist
```

5. **部署**

点击 "Deploy site"

6. **访问网站**

您的网站将在以下地址可用:
```
https://random-name-12345.netlify.app
```

### 自定义域名

1. 在项目设置中进入 "Domain settings"
2. 添加自定义域名
3. 配置DNS记录
4. 启用HTTPS(自动)

---

## 🖥️ 自托管服务器

### Nginx配置

1. **构建项目**

```bash
npm run build
```

2. **上传文件到服务器**

将 `dist/` 目录中的所有文件上传到服务器的 `/var/www/fitness-knowledge-base/`

3. **安装Nginx**

```bash
sudo apt update
sudo apt install nginx
```

4. **配置Nginx**

创建 `/etc/nginx/sites-available/fitness-knowledge-base`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/fitness-knowledge-base;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

5. **启用站点**

```bash
sudo ln -s /etc/nginx/sites-available/fitness-knowledge-base /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **配置SSL(使用Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

7. **访问网站**

打开浏览器访问 `https://your-domain.com`

---

## 🔧 故障排查

### 问题1: 页面空白或404错误

**原因**: 路由配置问题

**解决方案**:
- 确保 `vite.config.js` 中的 `base` 路径正确
- 检查SPA路由fallback配置

### 问题2: 图片加载失败

**原因**: 资源路径问题

**解决方案**:
- 确保所有图片使用相对路径
- 检查 `public/` 目录结构

### 问题3: 构建失败

**原因**: 依赖缺失或版本冲突

**解决方案**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 重新构建
npm run build
```

### 问题4: GitHub Pages部署后样式丢失

**原因**: CSS路径问题

**解决方案**:
- 确保 `vite.config.js` 中 `base` 设置为 `/sport/`
- 检查Tailwind CSS是否正确编译

---

## 📊 性能优化建议

### 1. 启用Gzip/Brotli压缩

大部分平台默认启用,自托管需手动配置

### 2. 使用CDN

- Cloudflare(免费)
- AWS CloudFront
- 阿里云CDN

### 3. 图片优化

- 使用WebP格式
- 压缩图片(TinyPNG)
- 懒加载(lazy loading)

### 4. 代码分割

Vite默认支持代码分割,无需额外配置

### 5. 缓存策略

- 静态资源: 长期缓存(30天+)
- HTML文件: 不缓存或短期缓存

---

## 🔍 SEO优化

### 1. 添加Meta标签

在 `index.html` 中添加:

```html
<meta name="description" content="基于科学研究的健身与跑步知识库,包含运动生理学、力量训练、有氧耐力等专业内容">
<meta name="keywords" content="健身,跑步,运动科学,力量训练,VO2max,体脂率,增肌,减脂">
<meta property="og:title" content="健身与跑步科学知识库">
<meta property="og:description" content="专业的健身科学知识平台">
<meta property="og:image" content="/og-image.png">
```

### 2. 生成Sitemap

使用 `sitemap.xml` 插件自动生成网站地图

### 3. 提交到搜索引擎

- Google Search Console
- 百度站长平台
- Bing Webmaster Tools

---

## 📱 PWA支持(可选)

如需将网站作为PWA应用安装到手机:

1. **安装Vite PWA插件**

```bash
npm install vite-plugin-pwa
```

2. **配置vite.config.js**

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '健身知识库',
        short_name: 'FitnessKB',
        description: '科学的健身知识平台',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

3. **添加图标**

在 `public/` 目录添加PWA图标

4. **重新构建和部署**

---

## 🎯 推荐方案

| 方案 | 难度 | 成本 | 速度 | 推荐度 |
|------|------|------|------|--------|
| GitHub Pages | ⭐⭐ | 免费 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vercel | ⭐ | 免费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Netlify | ⭐ | 免费 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 自托管 | ⭐⭐⭐⭐ | 付费 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**最佳选择**: 
- 个人项目 → **Vercel**(最简单,速度最快)
- GitHub生态 → **GitHub Pages**(无缝集成)
- 企业项目 → **自托管**(完全控制)

---

## 📞 需要帮助?

如有部署问题,请:

1. 查看 [README.md](README.md)
2. 搜索 [Issues](https://github.com/Yangzn666/sport/issues)
3. 提交新的Issue
4. 联系作者

---

**祝您部署顺利!** 🚀✨
