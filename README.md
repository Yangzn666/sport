# 🏋️ 健身与跑步科学知识库

**基于React + Vite构建的专业健身知识管理系统**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.0-green.svg)](https://vitejs.dev/)

---

## ✨ 特性

- 📚 **完整的科学知识体系**: 涵盖运动生理学、力量训练、有氧耐力、营养恢复等领域
- 🔬 **权威文献支持**: 引用40+篇2024-2026年最新Meta-analysis和RCT研究
- 💪 **实践导向**: 每个知识点都配套可执行的训练计划、饮食建议和实操指南
- 📊 **个人数据追踪**: 体脂秤数据分析、训练记录可视化、智能分析报告
- 🎨 **现代化UI**: React 19 + Tailwind CSS 4,响应式设计,支持移动端
- 🔍 **智能搜索**: 快速查找知识点,支持分类浏览和全文检索
- 📈 **Mermaid图表**: 可视化流程图,支持点击放大查看

---

##  快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

---

## 🌐 项目结构

本项目包含两个独立的展示页面:

### 1. 门户页面 (portal.html)
- **访问**: `https://yangzn666.github.io/sport/portal.html`
- **功能**: 项目导航入口,展示所有个人项目
- **内容**: 
  - 健身与跑步科学知识库入口
  - 球王黄佳炀荣耀殿堂入口

### 2. 健身知识库 (index.html + React应用)
- **访问**: `https://yangzn666.github.io/sport/`
- **技术栈**: React 19 + Vite 8 + Tailwind CSS 4
- **功能**: 完整的健身科学知识管理系统
- **内容**: 运动生理学、力量训练、有氧耐力、营养恢复等

### 3. 黄佳炀荣耀殿堂 (THE_GOAT_黄佳炀_球王传奇.html)
- **访问**: `https://yangzn666.github.io/sport/THE_GOAT_黄佳炀_球王传奇.html`
- **功能**: 个人成就展示页面
- **内容**: 65+项荣誉、足球传奇、特效展示

---

```
fitness-knowledge-base/
├── public/
│   └── data/
│       ├── knowledge/          # 知识库Markdown文件
│       │   ├── 运动生理学基础.md
│       │   ├── 力量训练科学.md
│       │   ├── 有氧训练与耐力科学.md
│       │   ├── 营养与恢复科学.md
│       │   ├── 周期化训练高级理论.md
│       │   ├── 心理训练与认知表现.md
│       │   ├── 2024-2026前沿研究汇总.md
│       │   ├── 文献索引.md
│       │   └── README_快速导航.md
│       └── reports/            # 个人数据分析报告
│           └── 体脂秤数据分析报告.md
├── src/
│   ├── pages/                  # 页面组件
│   │   ├── Home.jsx            # 首页仪表盘
│   │   ├── KnowledgeBase.jsx   # 知识库浏览页
│   │   ├── Category.jsx        # 分类页
│   │   ├── Article.jsx         # 文章详情页
│   │   ├── SmartAnalysis.jsx   # 智能分析页
│   │   └── DataAnalytics.jsx   # 数据分析页
│   ├── App.jsx                 # 路由配置
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式
├── scripts/                    # 自动化脚本
│   ├── searchAgent.js          # 文献搜索智能体
│   ├── generateIndex.js        # 索引生成器
│   └── ...
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 📚 知识库内容

### 核心主题

1. **运动生理学基础**
   - 三大供能系统(ATP-CP、糖酵解、有氧氧化)
   - 肌肉适应机制(机械张力、代谢压力、肌肉损伤)
   - 心血管适应(运动员心脏、毛细血管增生)
   - 神经适应(运动学习三阶段、本体感觉)
   - 超量恢复原理(GAS理论、ACWR负荷监控)

2. **力量训练科学**
   - 训练原则(特异性、渐进超负荷、个体差异)
   - 动作技术(深蹲、硬拉、卧推、引体向上)
   - 计划设计(全身训练vs分化训练)
   - 进阶策略(周期化、DUP、减负周)
   - 常见误区纠正

3. **有氧训练与耐力科学**
   - 跑步生物力学(步态周期、着地方式、步频)
   - 训练强度分区(Z1-Z5心率区间)
   - 耐力三要素(VO₂max、乳酸阈值、跑步经济性)
   - 训练方法(LSD、间歇跑、法特莱克)
   - 受伤预防(10%规则、力量训练)

4. **营养与恢复科学**
   - 能量平衡与宏量营养素
   - 蛋白质合成与补充时机
   - 碳水化合物策略(糖原超补偿)
   - 水分与电解质管理
   - 补剂科学性评估(肌酸、咖啡因、β-丙氨酸)
   - 睡眠与压力管理

5. **2024-2026前沿研究汇总**
   - 训练量与频率的剂量-反应关系
   - HIIT提升VO₂max的最新证据
   - 蛋白质补充网络荟萃分析
   - 血流限制训练(BFR)效果验证
   - 金字塔递减间歇法(HIDIT)

---

## 🛠️ 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 8
- **样式方案**: Tailwind CSS 4
- **路由管理**: React Router DOM 7
- **Markdown解析**: react-markdown + remark-gfm
- **图表渲染**: Mermaid.js
- **代码高亮**: Prism.js
- **包管理器**: npm

---

## 🎯 使用场景

### 适合人群

- ✅ 健身爱好者(希望系统化学习科学知识)
- ✅ 跑步爱好者(提升成绩、预防受伤)
- ✅ 力量训练者(增肌、塑形、突破平台期)
- ✅ 体育专业学生(备考、论文参考)
- ✅ 健身教练(提升专业度、服务会员)

### 典型应用

1. **制定训练计划**: 根据目标选择对应的知识点,获取科学的训练方案
2. **解决训练问题**: 遇到瓶颈时查阅相关章节,找到解决方案
3. **学习理论知识**: 系统性阅读,建立完整的知识体系
4. **数据分析**: 上传体脂秤数据,获取个性化分析报告
5. **文献检索**: 通过文献索引找到原始研究,深入阅读

---

## 📖 使用指南

### 浏览知识库

1. 访问首页,查看知识架构概览
2. 点击"知识库"进入分类浏览页面
3. 选择感兴趣的主题(如"运动生理学基础")
4. 阅读文章内容,点击Mermaid图表可放大查看
5. 使用左侧目录快速跳转到指定章节

### 搜索功能

- 在首页搜索框输入关键词(如"VO₂max"、"蛋白质")
- 系统会返回相关的知识点和文章
- 点击结果直接跳转到对应内容

### 个人数据分析

1. 进入"智能分析"页面
2. 上传体脂秤测量数据图片
3. 系统自动生成分析报告
4. 查看与全国平均水平的对比
5. 获取个性化的改进建议

---

## 🔬 科学依据

本知识库所有知识点均引用自**同行评审的顶级期刊**,包括:

- **Sports Medicine** (IF: 11.8)
- **Journal of Strength and Conditioning Research** (IF: 3.6)
- **Medicine & Science in Sports & Exercise** (IF: 4.2)
- **British Journal of Sports Medicine** (IF: 18.4)
- **Nature Reviews Neuroscience** (IF: 34.5)

**证据等级**:
- Level 1 (Meta-analysis): 8篇 ⭐⭐⭐⭐⭐
- Level 2 (RCT): 12篇 ⭐⭐⭐⭐
- Expert Consensus: 3篇 ⭐⭐⭐⭐

完整文献列表请查看: [文献索引.md](public/data/knowledge/文献索引.md)

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request!

### 如何贡献

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 贡献内容

- 📝 补充新的知识点
- 🔬 添加最新的研究文献
- 🐛 修复Bug
- 🎨 优化UI/UX
- 📱 改进移动端适配
- 🌐 国际化支持

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👨‍💻 作者

**杨臻宁**
- GitHub: [@Yangzn666](https://github.com/Yangzn666)
- 项目链接: https://github.com/Yangzn666/sport

---

## 🙏 致谢

感谢以下开源项目:

- [React](https://react.dev/) - 用户界面库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Mermaid](https://mermaid.js.org/) - 图表和流程图渲染
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) - 医学文献数据库

---

## 📞 联系方式

如有问题或建议,欢迎通过以下方式联系:

- 📧 Email: [您的邮箱]
- 💬 GitHub Issues: [提交Issue](https://github.com/Yangzn666/sport/issues)
- 📱 WeChat: [微信号]

---

## 🌟 Star History

如果这个项目对您有帮助,请给个Star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Yangzn666/sport&type=Date)](https://star-history.com/#Yangzn666/sport&Date)

---

**祝您训练顺利,不断突破!** 💪✨
