# 🔍 知识库加载问题调试指南

如果您看到"加载失败"或一直显示Loading状态,请按照以下步骤排查。

---

## 📋 步骤1: 打开浏览器开发者工具

按 `F12` 或 `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac)

切换到 **Console** (控制台) 标签页

---

## 🔎 步骤2: 查看错误信息

点击任意知识分类后,控制台会显示类似这样的信息:

```
Error loading knowledge base: TypeError: Failed to fetch
Attempted to load: /sport/data/knowledge/运动生理学基础.md
Category: physiology Mapped to: 运动生理学基础
```

### 关键信息解读:

| 信息 | 说明 |
|------|------|
| **Attempted to load** | 实际请求的文件路径 |
| **Category** | URL中的category参数 |
| **Mapped to** | 映射后的中文文件名 |

---

## ✅ 步骤3: 验证文件是否存在

### 方法1: 直接访问URL

在浏览器地址栏输入完整URL:

```
https://yangzn666.github.io/sport/data/knowledge/运动生理学基础.md
```

**预期结果**:
- ✅ 显示Markdown文本内容 → 文件存在,路径正确
- ❌ 404 Not Found → 文件不存在或路径错误

### 方法2: 检查GitHub仓库

访问: https://github.com/Yangzn666/sport/tree/main/public/data/knowledge

确认以下文件存在:
- ✅ 运动生理学基础.md
- ✅ 有氧训练与耐力科学.md
- ✅ 力量训练科学.md
- ✅ 营养与恢复科学.md
- ✅ 周期化训练高级理论.md

---

## 🐛 常见问题及解决方案

### 问题1: 404 Not Found - 文件不存在

**原因**: GitHub Actions部署时没有包含data文件夹

**解决**:
1. 检查 `.gitignore` 是否排除了public目录
2. 确保 `vite.config.js` 中 `publicDir: 'public'` 配置正确
3. 重新触发部署

**验证命令**:
```bash
# 本地检查
ls public/data/knowledge/*.md

# 应该看到所有Markdown文件
```

---

### 问题2: CORS错误

**症状**: 控制台显示 "CORS policy" 相关错误

**原因**: GitHub Pages的跨域限制

**解决**: 
- 这是正常的,GitHub Pages允许同源访问
- 确保URL完全匹配(包括大小写)

---

### 问题3: Category映射错误

**症状**: 
```
Attempted to load: /sport/data/knowledge/physiology.md
```

**原因**: categoryFileMap映射缺失或不正确

**解决**:
检查 `src/pages/KnowledgeBase.jsx` 中的映射:

```javascript
const categoryFileMap = {
  'physiology': '运动生理学基础',
  'running': '有氧训练与耐力科学',
  'strength': '力量训练科学',
  'nutrition': '营养与恢复科学',
  'recovery': '周期化训练高级理论'
};
```

确保所有category ID都有对应的映射。

---

### 问题4: BASE_URL配置错误

**症状**:
```
Attempted to load: /data/knowledge/xxx.md  (缺少 /sport/ 前缀)
```

**原因**: `import.meta.env.BASE_URL` 未正确读取

**解决**:
1. 检查 `vite.config.js` 中是否有 `base: '/sport/'`
2. 重新构建: `npm run build`
3. 重新部署

---

## 🧪 本地测试

在本地开发环境中测试:

```bash
npm run dev
```

访问: `http://localhost:5173/#/knowledge/physiology`

**预期**:
- ✅ 正常加载内容
- ✅ 控制台无错误

如果本地也失败,说明是代码问题而非部署问题。

---

## 📊 完整的Category映射表

| Category ID | 显示名称 | 文件名 |
|------------|---------|--------|
| physiology | 运动生理学基础 | 运动生理学基础.md |
| running | 跑步科学 | 有氧训练与耐力科学.md |
| strength | 力量与体能 | 力量训练科学.md |
| nutrition | 营养与补剂 | 营养与恢复科学.md |
| recovery | 恢复与心理 | 周期化训练高级理论.md |

**注意**: 目前只有这5个分类有对应的Markdown文件。

---

## 🔧 手动测试Fetch

在浏览器控制台中执行:

```javascript
// 测试文件是否可以访问
fetch('/sport/data/knowledge/运动生理学基础.md')
  .then(res => {
    console.log('Status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('Content length:', text.length);
    console.log('First 100 chars:', text.substring(0, 100));
  })
  .catch(err => {
    console.error('Error:', err);
  });
```

**预期输出**:
```
Status: 200
Content length: 12345
First 100 chars: # 运动生理学基础...
```

如果返回404,说明文件路径有问题。

---

## 📞 需要帮助?

如果以上步骤都无法解决问题:

1. **截图控制台错误信息**
2. **记录完整的URL**
3. **提交Issue**: https://github.com/Yangzn666/sport/issues
4. **提供以下信息**:
   - 浏览器类型和版本
   - 操作系统
   - 完整的错误日志
   - 尝试访问的URL

---

## ✨ 快速修复清单

- [ ] 清除浏览器缓存 (`Ctrl + Shift + Delete`)
- [ ] 使用无痕模式测试
- [ ] 检查GitHub Actions部署状态
- [ ] 确认dist目录包含data文件夹
- [ ] 验证categoryFileMap映射正确
- [ ] 检查vite.config.js的base配置
- [ ] 查看浏览器控制台详细错误

---

**祝您调试顺利!** 🚀
