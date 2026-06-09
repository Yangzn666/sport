# 参考文献数据库使用指南 📚

## 📖 概述

本参考文献数据库是健身知识库的核心组成部分，提供**可追溯、可验证、易访问**的学术文献资源。

---

## 🎯 主要功能

### 1. 文献搜索与过滤
- 🔍 **关键词搜索**：按标题、作者、期刊搜索
- 📂 **分类浏览**：按主题分类查看（运动生理学、力量训练、营养学等）
- ⭐ **证据等级筛选**：按研究质量分级（Meta分析 > RCT > 综述）

### 2. 一键跳转原始文献
- 📄 **DOI链接**：直接跳转到出版商页面
- 🔬 **PubMed链接**：查看摘要和相关研究
- 🔗 **备用链接**：其他可用访问途径

### 3. 文献信息管理
- 📊 **统计面板**：总文献数、分类数、链接数
- 🏷️ **证据等级标注**：Level 1A/1B/2/3
- 📝 **关键发现摘要**：快速了解研究结论

---

## 🚀 快速开始

### 访问方式

#### 方式1：本地访问（推荐）
```bash
# 启动本地服务器
cd "d:\学习\健身"
python -m http.server 8080

# 在浏览器中打开
http://localhost:8080/健身知识库与数据/知识库/references/index.html
```

#### 方式2：直接打开HTML文件
双击 `references/index.html` 文件（部分浏览器可能限制JSON加载）

---

## 📋 文献分类说明

### 1. 运动生理学基础 (Exercise Physiology)
- 能量代谢系统
- 心血管适应
- 肌肉生理
- 神经适应

### 2. 力量训练科学 (Resistance Training)
- 肌肉肥大机制
- 力量增益原理
- 训练量与频率
- 进阶策略

### 3. 有氧训练与耐力科学 (Endurance Training)
- VO2max训练
- 跑步生物力学
- 耐力周期化
- 运动表现优化

### 4. 营养与恢复科学 (Nutrition & Recovery)
- 蛋白质合成
- 补充剂效果
- 饮食策略
- 睡眠与恢复

### 5. 周期化训练高级理论 (Periodization)
- 训练分期
- 负荷管理
- 峰值表现
- 长期规划

### 6. 心理训练与认知表现 (Sports Psychology)
- 动机理论
- 注意力控制
- 压力管理
- 认知功能

### 7. 2024-2026前沿研究汇总 (Recent Research)
- 最新Meta分析
- 突破性发现
- 争议话题
- 未来方向

---

## 🔬 证据等级标准

| 等级 | 类型 | 说明 | 可信度 |
|------|------|------|--------|
| **Level 1A** | Systematic Review + Meta-analysis | 系统评价+荟萃分析 | ⭐⭐⭐⭐⭐ |
| **Level 1B** | Large RCT (n>100) | 大样本随机对照试验 | ⭐⭐⭐⭐ |
| **Level 2A** | Cohort Study | 队列研究 | ⭐⭐⭐ |
| **Level 2B** | Case-Control Study | 病例对照研究 | ⭐⭐⭐ |
| **Level 3** | Expert Consensus | 专家共识/立场声明 | ⭐⭐ |
| **Classic** | 经典文献（被引>1000次） | 奠基性研究 | ⭐⭐⭐⭐⭐ |

---

## 💡 使用技巧

### 1. 高效搜索
```
搜索示例：
- "protein timing" → 查找蛋白质时机相关研究
- "Schoenfeld" → 查找该作者的所有文献
- "hypertrophy mechanisms" → 查找肥大机制研究
```

### 2. 按证据等级筛选
- **制定训练计划**：优先参考 Level 1A/1B 文献
- **了解理论基础**：阅读 Classic 经典文献
- **探索新观点**：查看 Recent Research 最新研究

### 3. 追踪文献引用
每篇文献卡片显示：
- 📄 **cited_in**：该文献在哪些文档中被引用
- 🔗 **相关链接**：快速访问原始论文

---

## 🛠️ 维护与更新

### 添加新文献

#### 方法1：手动编辑 JSON
打开 `references/references.json`，在对应分类下添加：

```json
{
  "id": "RT-RCT-2026-001",
  "title": "文献标题",
  "authors": ["作者1", "作者2"],
  "journal": "期刊名称",
  "year": 2026,
  "doi": "10.xxxx/xxxxx",
  "pubmed_id": "PMID:XXXXX",
  "evidence_level": "Level 1B",
  "category": "resistance_training",
  "key_findings": ["关键发现1", "关键发现2"],
  "cited_in": ["力量训练科学.md"]
}
```

#### 方法2：使用Python脚本
```bash
python add_reference.py --title "..." --doi "..." --category "..."
```

### 验证DOI链接

运行验证脚本检查所有DOI是否有效：
```bash
python validate_dois.py
```

输出示例：
```
✅ 有效: 10.1519/JSC.0b013e3181e840f3
❌ 无效: 10.xxxx/invalid-doi
⚠️  需要更新: 10.xxxx/old-doi
```

---

## 📊 数据统计

### 当前状态（2026-05-31）
- 📚 **总文献数**：41篇
- 📁 **分类数量**：7个
- 🔗 **DOI链接**：待补充
- 🔬 **PubMed链接**：待补充

### 目标（2026-06-30）
- 📚 **总文献数**：150+篇
- ✅ **DOI覆盖率**：>90%
- ✅ **证据等级标注**：100%
- ✅ **经典文献补充**：50+篇

---

## 🔧 技术细节

### 文件结构
```
references/
├── index.html              # 文献数据库网页界面
├── references.json         # 文献数据（JSON格式）
├── README.md               # 本文档
└── scripts/
    ├── extract_references.py    # 文献提取脚本
    ├── validate_dois.py         # DOI验证脚本
    └── add_reference.py         # 添加文献脚本
```

### 数据格式
```json
{
  "metadata": {
    "created_date": "2026-05-31",
    "total_references": 41,
    "files_processed": 7,
    "version": "1.0"
  },
  "categories": {
    "运动生理学基础": {
      "description": "Exercise Physiology - 运动生理学基础理论",
      "references": [...],
      "count": 5
    }
  }
}
```

---

## ❓ 常见问题

### Q1: 为什么有些文献没有DOI链接？
**A**: 早期文献（1990年代前）可能没有DOI。可以尝试：
- 在PubMed搜索标题
- 使用Google Scholar查找
- 联系图书馆获取

### Q2: 如何判断文献质量？
**A**: 参考证据等级：
- Level 1A/1B：高质量，强烈推荐
- Level 2：中等质量，可作为参考
- Level 3：专家意见，需结合其他证据

### Q3: 文献信息有误怎么办？
**A**: 请提交Issue或Pull Request修正，或直接编辑 `references.json`

### Q4: 可以下载PDF吗？
**A**: 
- 开放获取文献：点击DOI链接可直接下载
- 付费文献：通过机构订阅或ResearchGate请求

---

## 📞 反馈与建议

如有问题或建议，请：
1. 📧 发送邮件至：[您的邮箱]
2. 💬 在GitHub Issues中提问
3. 📝 提交Pull Request改进

---

## 📜 许可证

本参考文献数据库采用 **CC BY-NC-SA 4.0** 许可协议。

您可以：
- ✅ 分享和传播
- ✅ 改编和修改

但必须：
- 📝 署名原作者
- 🚫 非商业用途
- 🔄 以相同方式共享

---

## 🙏 致谢

感谢以下数据库提供的文献元数据：
- CrossRef API
- PubMed Central
- Google Scholar

感谢所有原创研究作者的辛勤工作！

---

**最后更新**：2026年5月31日  
**版本**：1.0  
**维护者**：健身知识库团队
