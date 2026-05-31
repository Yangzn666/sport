#  快速启动指南

欢迎使用健身知识库网站!本指南将帮助您快速开始使用。

---

## 📱 方式一:本地运行(推荐开发使用)

### 步骤1: 安装依赖

打开终端,进入项目目录:

```bash
cd "d:\学习\健身\fitness-knowledge-base"
npm install
```

等待安装完成(首次可能需要2-3分钟)

### 步骤2: 启动开发服务器

```bash
npm run dev
```

您会看到类似输出:
```
VITE v8.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 步骤3: 访问网站

打开浏览器,访问: **http://localhost:5173**

✅ **恭喜!** 网站已在本地运行!

### 常用命令

```bash
# 停止服务器: Ctrl + C

# 重新安装依赖: npm install

# 构建生产版本: npm run build

# 预览生产构建: npm run preview
```

---

## 🌐 方式二: GitHub Pages (在线访问)

### 自动部署已配置!

每次您推送代码到GitHub,网站会自动部署到GitHub Pages。

**访问地址**: 
```
https://yangzn666.github.io/sport/
```

### 查看部署状态

1. 访问: https://github.com/Yangzn666/sport/actions
2. 查看最新的 "Deploy to GitHub Pages" 工作流
3. 绿色✓表示部署成功
4. 红色✗表示部署失败(点击查看详情)

### 首次部署时间

- 首次部署: 约5-10分钟
- 后续部署: 约2-3分钟

---

## 🎯 方式三: Vercel (最快最稳定)

### 一键部署(推荐生产环境)

1. **访问**: https://vercel.com/new
2. **登录**: 使用GitHub账号登录
3. **导入**: 选择 `Yangzn666/sport` 仓库
4. **配置**: 保持默认设置
5. **部署**: 点击 "Deploy" 按钮

**访问地址**: 
```
https://sport.vercel.app
```

✅ **优点**:
- 全球CDN加速,访问速度快
- 自动HTTPS加密
- 支持自定义域名
- 免费套餐足够个人使用

---

## 📖 使用网站

### 首页功能

访问网站后,您将看到:

1. **统计卡片**: 展示知识库概览(文章数量、文献数量等)
2. **智能搜索**: 快速查找知识点
3. **知识架构**: 三级分类浏览
4. **最新文章**: 最新添加的内容

### 浏览知识库

#### 方法1: 分类浏览

1. 点击顶部导航栏的 **"知识库"**
2. 选择感兴趣的分类(如"运动生理学基础")
3. 阅读文章内容
4. 使用左侧目录快速跳转

#### 方法2: 搜索查找

1. 在首页搜索框输入关键词(如"VO₂max"、"蛋白质")
2. 查看搜索结果
3. 点击结果直接跳转到对应内容

#### 方法3: 快速导航

1. 访问 [README_快速导航.md](public/data/knowledge/README_快速导航.md)
2. 按问题查找知识点
3. 获取针对性的建议

### 查看Mermaid图表

文章中包含大量流程图和示意图:

1. **点击图表**: 全屏查看放大版
2. **再次点击**: 关闭全屏
3. **ESC键**: 也可以关闭

### 个人数据分析

1. 点击顶部导航栏的 **"智能分析"**
2. 上传体脂秤测量数据图片
3. 系统自动生成分析报告
4. 查看与全国平均水平的对比
5. 获取个性化改进建议

---

## 🔍 常见问题

### Q1: 本地运行时页面空白?

**解决方案**:
```bash
# 检查是否安装了所有依赖
npm install

# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 重新启动
npm run dev
```

### Q2: GitHub Pages访问404错误?

**原因**: 路径配置问题

**解决方案**:
- 确保 `vite.config.js` 中 `base: '/sport/'` 正确
- 等待5-10分钟让GitHub Pages完成部署
- 清除浏览器缓存(Ctrl+Shift+Delete)

### Q3: 图片加载失败?

**解决方案**:
- 确保图片放在 `public/` 目录
- 使用相对路径引用: `/data/knowledge/xxx.jpg`
- 检查文件名是否正确(区分大小写)

### Q4: 搜索功能不工作?

**解决方案**:
- 确保已生成索引文件
- 运行: `node scripts/generateIndex.js`
- 刷新页面重试

### Q5: Mermaid图表显示异常?

**解决方案**:
- 检查Markdown语法是否正确
- 确保Mermaid代码块格式正确:
  ```markdown
  ```mermaid
  graph TD
      A --> B
  ```
- 刷新页面或清除缓存

---

## 💡 最佳实践

### 1. 定期更新依赖

```bash
# 每月检查一次
npm outdated

# 更新到最新版本
npm update
```

### 2. 备份重要数据

- 体脂秤数据: `d:/学习/健身/体脂秤数据/`
- 训练记录: 定期导出
- 分析报告: 保存到云端

### 3. 使用快捷键

- `Ctrl + F`: 页面内搜索
- `Ctrl + Shift + I`: 打开开发者工具
- `F5`: 刷新页面
- `ESC`: 关闭弹窗/全屏

### 4. 移动端优化

网站已完美适配移动端:
- 使用手机浏览器访问
- 添加到主屏幕(PWA支持)
- 离线也可浏览部分内容

---

## 🎓 学习路径建议

### 第1周: 建立基础

1. 阅读《运动生理学基础》- 能量系统章节
2. 理解三大供能系统的区别
3. 应用到自己的训练中

### 第2周: 深入力量训练

1. 阅读《力量训练科学》- 训练原则章节
2. 检查自己的动作技术
3. 记录训练日志

### 第3周: 优化有氧训练

1. 阅读《有氧训练与耐力科学》- 强度分区章节
2. 计算自己的心率区间
3. 尝试1次间歇训练

### 第4周: 整合应用

1. 回顾所有内容
2. 制定下月训练计划
3. 设置具体目标

---

##  需要帮助?

### 文档资源

- [README.md](README.md) - 完整项目说明
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署指南
- [文献索引.md](public/data/knowledge/文献索引.md) - 研究文献列表

### 联系方式

- **GitHub Issues**: https://github.com/Yangzn666/sport/issues
- **Email**: [您的邮箱]
- **WeChat**: [微信号]

### 社区支持

- Reddit r/Fitness: https://www.reddit.com/r/Fitness/
- 知乎健身话题: https://www.zhihu.com/topic/19552883

---

## 🎉 开始探索!

现在您已经准备好了!

**立即行动**:

1. ✅ 本地运行: `npm run dev` → http://localhost:5173
2. ✅ 在线访问: https://yangzn666.github.io/sport/
3. ✅ 或使用Vercel: https://sport.vercel.app

**祝您学习愉快,训练进步!** ✨

---

**最后更新**: 2026年5月31日
