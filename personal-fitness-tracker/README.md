# 个人健身数据追踪系统 🔒

## 项目简介

这是一个**完全私密**的个人健身数据追踪网站，与公共知识库分离部署，确保您的训练数据只在本地运行。

## 核心特性

### 🛡️ 隐私保护
- ✅ **100%本地运行**：所有数据存储在您的电脑上
- ✅ **无需联网**：网站运行在 `localhost:5182`
- ✅ **数据隔离**：与公共知识库完全独立
- ✅ **随时删除**：可随时备份或删除所有数据

### 📊 功能模块

1. **数据可视化** (`/analytics`)
   - 跑步配速趋势分析
   - 力量训练部位分布
   - 体成分变化曲线
   - 月度训练量统计

2. **智能分析** (`/smart-analysis`)
   - 训练效果评估
   - 个性化改进建议
   - 营养与恢复指导
   - 考研期间训练方案

### 📁 项目结构

```
personal-fitness-tracker/
├── data/                    # 数据备份目录
│   └── your_data/
│       ├── your_running_data.csv        # 跑步记录
│       ├── your_strength_data.csv       # 力量训练
│       └── your_body_composition_data.csv  # 体成分数据
├── public/                  # 网站公共文件
│   └── your_data/           # 运行时数据目录（与data同步）
── src/
│   ├── pages/
│   │   ├── Dashboard.jsx         # 主页仪表盘
│   │   ├── DataAnalytics.jsx     # 数据可视化页面
│   │   ── SmartAnalysis.jsx     # 智能分析页面
│   ├── App.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 快速开始

### 1. 安装依赖

```bash
cd d:\学习\健身\personal-fitness-tracker
npm install
```

### 2. 启动网站

```bash
npm run dev
```

网站将自动在浏览器中打开：`http://localhost:5182`

### 3. 更新数据

**方法1：直接编辑CSV文件**
- 修改 `data/your_data/` 中的CSV文件
- 重启网站即可看到更新

**方法2：使用Python脚本**
```bash
# 在父目录（d:\学习\健身）运行
python parse_all_strength_data.py
# 然后复制到public目录
Copy-Item "data\your_data\*" "personal-fitness-tracker\public\your_data\" -Recurse
```

## 数据说明

### 跑步数据 (`your_running_data.csv`)
- 日期、距离、时间、配速、心率、类型、步频

### 力量训练 (`your_strength_data.csv`)
- 日期、动作、重量(kg)、次数、组数、容量(kg)

### 体成分 (`your_body_composition_data.csv`)
- 日期、体重、体脂率、骨骼肌、基础代谢、BMI

## 与公共知识库的区别

| 特性 | 公共知识库 | 个人追踪器 |
|------|-----------|-----------|
| **端口** | 5173 | 5182 |
| **数据类型** | 健身知识文献 | 您的私人训练数据 |
| **访问权限** | 公开 | 仅本地 |
| **数据位置** | `fitness-knowledge-base/` | `personal-fitness-tracker/` |
| **分析功能** | ❌ | ✅ |

## 备份建议

### 定期备份
```bash
# 备份到云盘或外部硬盘
xcopy "d:\学习\健身\personal-fitness-tracker\data" "D:\Backup\FitnessData" /E /I /Y
```

### 版本控制（可选）
```bash
git init
git add data/your_data/*.csv
git commit -m "Backup fitness data"
```

## 技术栈

- **前端框架**：React 19
- **构建工具**：Vite 8
- **样式框架**：Tailwind CSS 4
- **图表库**：Recharts
- **路由**：React Router DOM 7
- **数据解析**：PapaParse

## 常见问题

### Q: 如何同步数据到两个网站？
A: 运行以下命令同步：
```bash
Copy-Item "fitness-knowledge-base\data\your_data\*" "personal-fitness-tracker\public\your_data\" -Recurse
```

### Q: 数据安全吗？
A: 完全安全。所有数据仅在您的本地电脑上，不会上传到任何服务器。

### Q: 可以同时运行两个网站吗？
A: 可以！它们运行在不同端口：
- 公共知识库：`http://localhost:5173`
- 个人追踪器：`http://localhost:5182`

## 联系与支持

如有问题，请查看项目目录中的文档或联系开发者。

---

**🔒 隐私声明**：本项目完全离线运行，不收集、不上传、不共享任何个人数据。
