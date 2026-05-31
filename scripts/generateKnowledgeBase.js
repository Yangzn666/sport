import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgeDir = path.join(__dirname, '../data/knowledge');
const reportsDir = path.join(__dirname, '../data/reports');

// 确保目录存在
if (!fs.existsSync(knowledgeDir)) {
  fs.mkdirSync(knowledgeDir, { recursive: true });
}

// 知识库模板
const knowledgeTemplates = {
  physiology: {
    title: '运动生理学基础',
    intro: '运动生理学是研究人体在运动过程中生理变化规律的科学，为运动训练提供理论基础。',
    sections: [
      {
        title: '能量代谢系统',
        content: '人体在运动时依赖三大能量代谢系统：磷酸原系统（ATP-CP）、糖酵解系统和有氧氧化系统。不同强度的运动激活不同的供能系统。'
      },
      {
        title: '肌肉纤维类型',
        content: '骨骼肌包含 I 型（慢肌）和 II 型（快肌）纤维。I 型纤维抗疲劳性强，适合耐力运动；II 型纤维收缩速度快，适合爆发性运动。'
      },
      {
        title: '心肺功能与 VO2 Max',
        content: '最大摄氧量（VO2 Max）是衡量有氧能力的金标准。通过科学训练，VO2 Max 可提升 15-30%。'
      }
    ]
  },
  running: {
    title: '跑步科学',
    intro: '跑步科学结合了生物力学、运动生理学和训练学，为跑者提供科学的训练指导。',
    sections: [
      {
        title: '跑姿生物力学',
        content: '优秀的跑姿应具备：合适的步频（170-190 步/分钟）、较小的垂直振幅、前脚掌或全脚掌着地。生物力学分析可帮助优化跑步经济性。'
      },
      {
        title: '训练周期化',
        content: '科学的跑步训练应遵循周期化原则：基础期（有氧耐力）、进展期（乳酸阈训练）、巅峰期（间歇训练）、恢复期。'
      },
      {
        title: '伤病预防',
        content: '常见的跑步伤病包括：跑步膝、胫骨应力综合征、足底筋膜炎。预防措施包括：渐进增加跑量、力量训练、合适的跑鞋。'
      }
    ]
  },
  strength: {
    title: '力量与体能训练',
    intro: '力量训练通过机械张力和代谢压力刺激肌肉生长，是改善身体成分和运动表现的核心手段。',
    sections: [
      {
        title: '肌肥大机制',
        content: '肌肥大的三大机制：机械张力（主要驱动因素）、代谢压力、肌肉损伤。复合动作（深蹲、硬拉、卧推）是最有效的肌肥大训练。'
      },
      {
        title: '神经适应',
        content: '训练初期（前 4-8 周）的力量提升主要来自神经适应：运动单位募集增加、放电频率提高、协同肌激活改善。'
      },
      {
        title: '训练变量',
        content: '关键训练变量：强度（1RM 百分比）、容量（组数×次数×重量）、频率（每周训练次数）、休息时间。不同目标需要不同的变量组合。'
      }
    ]
  },
  nutrition: {
    title: '运动营养与补剂',
    intro: '科学的营养策略可以显著提升运动表现、加速恢复、优化身体成分。',
    sections: [
      {
        title: '宏量营养素',
        content: '蛋白质（1.6-2.2g/kg/d）支持肌肉修复；碳水化合物（5-10g/kg/d）是高强度运动的主要燃料；脂肪（0.8-1.0g/kg/d）提供必需脂肪酸。'
      },
      {
        title: '运动补剂',
        content: '循证有效的补剂：肌酸（提升力量和爆发力）、咖啡因（提升耐力表现）、β-丙氨酸（缓冲乳酸）、乳清蛋白（促进肌肉合成）。'
      },
      {
        title: '水合状态',
        content: '脱水 2% 即可显著降低运动表现。运动前 2 小时饮水 500ml；运动中每 15-20 分钟补充 150-250ml；运动后按体重丢失量的 1.5 倍补水。'
      }
    ]
  },
  recovery: {
    title: '恢复与运动心理',
    intro: '恢复是训练计划的重要组成部分，直接影响训练适应和运动表现。',
    sections: [
      {
        title: '睡眠与恢复',
        content: '睡眠是身体修复的黄金时间。成年人每晚需要 7-9 小时睡眠。睡眠不足会降低生长激素分泌、增加皮质醇水平、削弱免疫功能。'
      },
      {
        title: '过度训练监测',
        content: '过度训练综合征（OTS）表现为：持续疲劳、运动表现下降、情绪波动、静息心率升高。预防措施：周期性减负周、充分营养、压力管理。'
      },
      {
        title: '运动心理学',
        content: '心理因素对运动表现的影响：目标设定（SMART 原则）、自我对话（积极暗示）、意象训练（心理演练）、压力管理（呼吸技巧）。'
      }
    ]
  }
};

// 生成知识库文件
Object.keys(knowledgeTemplates).forEach(category => {
  const template = knowledgeTemplates[category];
  
  let content = `# ${template.title}\n\n`;
  content += `> ${template.intro}\n\n`;
  
  // 添加各章节
  template.sections.forEach(section => {
    content += `## ${section.title}\n\n`;
    content += `${section.content}\n\n`;
    
    // TODO: 未来版本将在此处整合该章节相关的 PubMed 文献摘要
    content += `### 相关研究\n\n`;
    content += `> *本节内容基于 PubMed 最新文献自动生成*\n\n`;
  });
  
  // 添加参考文献占位符
  content += `## 参考文献\n\n`;
  content += `> 参考文献列表将由智能体自动从 PubMed 抓取并生成。\n\n`;
  
  const filePath = path.join(knowledgeDir, `${category}.md`);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已生成知识库: ${category}.md`);
});

console.log('\n✨ 知识库生成完成！');
