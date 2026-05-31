# 🔧 GitHub Pages 部署故障排查

本文档帮助解决GitHub Pages部署常见问题。

---

## ❌ 问题2: 知识库子页面无法访问(404错误)

### 症状
- 门户页面可以正常访问
- 点击"健身知识库"后,进入首页正常
- 但点击任何子页面(如文章、分类)时显示404错误

### 原因分析

**React Router默认使用Browser History模式**,这种模式需要服务器支持URL重写。但GitHub Pages是静态托管,**不支持服务器端路由配置**,导致子页面无法访问。

### ✅ 解决方案(已修复)

**将BrowserRouter改为HashRouter**

在 `src/App.jsx` 中:

```javascript
// 修改前(不兼容GitHub Pages)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 修改后(兼容GitHub Pages)
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
```

**原理**:
- **BrowserRouter**: URL格式为 `/knowledge/运动生理学基础` (需要服务器支持)
- **HashRouter**: URL格式为 `/#/knowledge/运动生理学基础` (使用URL hash,无需服务器支持)

**优点**:
- ✅ 完全兼容GitHub Pages等静态托管
- ✅ 无需额外配置
- ✅ 所有路由正常工作

**缺点**:
- ⚠️ URL中包含 `#` 符号(不影响功能)

---

## ❌ 问题1: "The site configured at this address does not contain the requested file"

### 原因分析

这个错误通常由以下原因导致:

1. **构建输出目录不正确** - dist/目录中没有index.html
2. **静态文件未复制** - portal.html等静态HTML文件不在dist/中
3. **base路径配置错误** - vite.config.js中的base设置不正确
4. **GitHub Actions未触发** - 部署工作流没有运行

---

## ✅ 解决方案

### 方案1: 检查构建输出(已修复)

**问题**: Vite默认只构建React应用,不会复制静态HTML文件

**解决**: 已在`vite.config.js`中添加自定义插件自动复制静态文件

```javascript
// vite.config.js 中的 copyStaticFiles 插件
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
```

**验证**:
```bash
npm run build
# 检查dist目录是否包含所有HTML文件
ls dist/*.html
# 应该看到:
# index.html
# portal.html
# THE_GOAT_黄佳炀_球王传奇.html
```

---

### 方案2: 检查GitHub Actions状态

**步骤**:

1. 访问: https://github.com/Yangzn666/sport/actions
2. 查看最新的 "Deploy to GitHub Pages" 工作流
3. 确认状态为绿色 ✓ (成功)
4. 如果失败,点击查看详情

**常见失败原因**:
- Node.js版本不匹配 → 已在workflow中设置为Node 20
- 依赖安装失败 → 使用 `npm ci` 代替 `npm install`
- 构建命令错误 → 确保 `npm run build` 能成功执行

---

### 方案3: 检查base路径配置

**当前配置** (`vite.config.js`):
```javascript
export default defineConfig({
  base: '/sport/', // 必须与仓库名一致
  // ...
})
```

**重要**: 
- 如果仓库名是 `https://github.com/Yangzn666/sport`
- base必须是 `/sport/`
- 如果是用户主页 `https://github.com/Yangzn666/Yangzn666.github.io`
- base应该是 `/`

---

### 方案4: 手动触发部署

如果自动部署没有触发,可以手动触发:

1. 访问: https://github.com/Yangzn666/sport/actions/workflows/deploy.yml
2. 点击 "Run workflow"
3. 选择main分支
4. 点击 "Run workflow" 按钮

---

## 📋 部署检查清单

在推送代码前,请确认:

- [ ] 本地运行 `npm run build` 成功
- [ ] `dist/` 目录包含所有HTML文件
- [ ] `vite.config.js` 中 `base` 路径正确
- [ ] `.github/workflows/deploy.yml` 存在且配置正确
- [ ] GitHub Pages设置在仓库Settings > Pages中启用
- [ ] Source设置为 "GitHub Actions"

---

## 🌐 正确的访问URL

部署成功后,可以通过以下URL访问:

### 门户页面(推荐入口)
```
https://yangzn666.github.io/sport/portal.html
```

### 健身知识库
```
https://yangzn666.github.io/sport/
```

### 荣耀殿堂
```
https://yangzn666.github.io/sport/THE_GOAT_黄佳炀_球王传奇.html
```

---

## 🔄 清除缓存

如果更新后看不到变化:

### 浏览器端
1. 按 `Ctrl + Shift + Delete` (Windows) 或 `Cmd + Shift + Delete` (Mac)
2. 选择 "Cached images and files"
3. 点击 "Clear data"

或者使用无痕模式访问

### GitHub Pages端
等待5-10分钟,GitHub Pages会自动刷新缓存

---

## 📞 需要帮助?

如果以上方案都无法解决问题:

1. **查看构建日志**: https://github.com/Yangzn666/sport/actions
2. **检查仓库设置**: https://github.com/Yangzn666/sport/settings/pages
3. **提交Issue**: https://github.com/Yangzn666/sport/issues
4. **联系作者**: 通过README中的联系方式

---

## 📝 最近更新

**2026年5月31日**:
- ✅ 添加自定义Vite插件自动复制静态HTML文件
- ✅ 修复GitHub Pages部署问题
- ✅ 更新README添加详细部署说明
- ✅ 创建本故障排查文档

---

**祝您部署顺利!** ✨
