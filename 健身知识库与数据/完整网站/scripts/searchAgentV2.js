import fs from 'fs';
import path from 'path';
import xml2js from 'xml-js';

// 真实的 PubMed API 接口配置
const PUBMED_API_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// 针对不同分类的搜索关键词（优化精准度，增加更多高质量文献）
const searchQueries = {
  running: '(running OR runner) AND (biomechanics OR "running economy" OR injury) AND (review[Filter] OR Clinical Trial[Filter]) AND (2020:2026[pdp])',
  strength: '(resistance training OR "strength training" OR "muscle hypertrophy") AND (review[Filter] OR Meta-Analysis[Filter]) AND (2020:2026[pdp])',
  physiology: '(exercise physiology) AND (metabolism OR "cardiovascular" OR VO2max) AND (review[Filter]) AND (2020:2026[pdp])',
  nutrition: '(sports nutrition OR supplementation OR creatine OR protein) AND (performance OR recovery) AND (review[Filter]) AND (2020:2026[pdp])',
  recovery: '(sleep OR recovery OR "overtraining") AND (athletic performance OR "muscle recovery") AND (review[Filter]) AND (2020:2026[pdp])'
};

const reportsDir = path.join('data', 'reports');

// 辅助函数：延迟执行，避免频繁请求 API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPubMedArticles(term, retmax = 5) {
  // 1. 搜索文献 ID
  const searchUrl = `${PUBMED_API_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&sort=relevance&usehistory=y&retmode=json`;
  
  try {
    console.log(`正在搜索 PubMed: ${term}...`);
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const idList = searchData.esearchresult.idlist;

    if (!idList || idList.length === 0) return [];

    // 2. 使用 efetch 获取完整摘要（XML 格式）
    const fetchUrl = `${PUBMED_API_URL}/efetch.fcgi?db=pubmed&id=${idList.join(',')}&retmode=xml`;
    const fetchRes = await fetch(fetchUrl);
    const xmlText = await fetchRes.text();
    
    // 解析 XML 数据（xml2js 直接返回对象，不需要 JSON.parse）
    const jsonData = xml2js.xml2js(xmlText, { compact: true, spaces: 4 });
    
    // 调试：打印数据结构
    console.log('XML 结构:', JSON.stringify(Object.keys(jsonData), null, 2));
    
    let articles = [];
    if (jsonData.PubmedArticleSet) {
      articles = Array.isArray(jsonData.PubmedArticleSet.PubmedArticle) 
        ? jsonData.PubmedArticleSet.PubmedArticle 
        : [jsonData.PubmedArticleSet.PubmedArticle];
    }
    
    console.log(`找到 ${articles.length} 篇文章`);
    
    return articles.map(article => {
      const medline = article.MedlineCitation;
      const articleInfo = medline.Article;
      
      // 提取文章标题（处理复杂结构）
      let title = "Untitled";
      if (articleInfo.ArticleTitle) {
        const titleData = articleInfo.ArticleTitle;
        if (typeof titleData._text === 'string') {
          title = titleData._text;
        } else if (Array.isArray(titleData._text)) {
          // 标题被分段（如有斜体部分），拼接所有文本
          title = titleData._text.join('');
        }
      }
      
      // 提取摘要（处理 compact 格式）
      let abstract = "暂无摘要";
      if (articleInfo.Abstract && articleInfo.Abstract.AbstractText) {
        const abstractText = articleInfo.Abstract.AbstractText;
        if (Array.isArray(abstractText)) {
          abstract = abstractText.map(t => t._text || '').join('\n\n');
        } else {
          abstract = abstractText._text || abstractText;
        }
      }
      
      // 提取作者
      const authorList = medline.Article.AuthorList?.Author || [];
      const authors = (Array.isArray(authorList) ? authorList : [authorList])
        .map(a => {
          const lastName = a.LastName?._text || '';
          const foreName = a.ForeName?._text || '';
          return `${lastName} ${foreName}`.trim();
        })
        .filter(Boolean);
      
      // 提取期刊信息
      const journal = articleInfo.Journal?.Title?._text || 
                      articleInfo.Journal?.ISOAbbreviation?._text || 
                      "Unknown Journal";
      const pubDate = medline.Article.ArticleDate?.[0]?.Year?._text || 
                      medline.Article.Journal?.JournalIssue?.PubDate?.Year?._text || "N/A";
      
      // 提取 DOI
      let doi = "";
      const articleIds = medline.ArticleIdList?.ArticleId || [];
      (Array.isArray(articleIds) ? articleIds : [articleIds]).forEach(id => {
        if (id._attributes?.IdType === "doi") {
          doi = id._text || "";
        }
      });
      
      return {
        title: title,
        abstract: abstract,
        authors: authors.length > 0 ? authors : ["Unknown Author"],
        year: pubDate,
        journal: journal,
        doi: doi,
        pmid: medline.PMID?._text || ""
      };
    });
  } catch (error) {
    console.error(`Error fetching from PubMed for term "${term}":`, error);
    return [];
  }
}

function generateReport(category, paper) {
  const catDir = path.join(reportsDir, category);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  const fileName = `${paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50).toLowerCase()}.md`;
  const filePath = path.join(catDir, fileName);

  // 判断研究类型
  const isReview = paper.abstract.toLowerCase().includes('review') || 
                   paper.abstract.toLowerCase().includes('meta-analysis') ||
                   paper.title.toLowerCase().includes('review');
  
  const studyType = isReview ? '系统综述/Meta分析' : '随机对照试验 (RCT)';
  
  // 提取关键发现（前 300 字）
  const keyFindings = paper.abstract.length > 300 ? paper.abstract.substring(0, 300) + '...' : paper.abstract;

  const content = `# ${paper.title}

> **发表信息**：${paper.authors.join(', ')} (${paper.year}). *${paper.journal}*.  
> **DOI**: ${paper.doi || '暂无'}  
> **PMID**: [${paper.pmid}](https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/)  
> **研究类型**: ${studyType}

##  研究摘要

${paper.abstract}

---

##  核心结论

### 主要发现
> *注：以下结论基于文献摘要自动生成*

${keyFindings}

### 实践意义
- 本研究为 ${category} 领域的训练实践提供了新的循证依据
- 建议结合个体差异和实际训练环境进行应用

---

##  研究机制解析

### 生物学机制
> *注：本节基于文献摘要与领域知识自动生成*

${isReview ? '本文献为综述类研究，综合分析了多项原始研究的结果，提供了该领域的全面视角。' : '本研究通过实验设计验证了特定训练方法对生理指标的影响。'}

### 关键数据指标

| 指标 | 结果 |
|------|------|
| 研究设计 | ${studyType} |
| 发表年份 | ${paper.year} |
| 期刊 | ${paper.journal} |
| 样本量 | 待补充 |
| 干预周期 | 待补充 |

---

##  实践应用建议

### 训练指导
1. **循证实践**：建议结合个体差异参考本研究的结论。
2. **渐进负荷**：遵循科学的渐进性原则，避免过度训练。
3. **监测反馈**：定期评估训练效果并调整参数。
4. **个性化调整**：根据自身生理特征和目标进行参数微调。

### 注意事项
- 本研究结论需结合个体生理特征进行个性化应用
- 建议在专业教练或运动生理学家指导下实施
- 注意监测训练后的恢复情况，避免过度训练

---

##  思维导图

\`\`\`mermaid
graph LR
    A[研究问题] --> B{研究方法}
    B --> C[实验组]
    B --> D[对照组]
    C --> E[结果分析]
    D --> E
    E --> F[实践应用]
    F --> G[效果评估]
    G --> H{是否达标}
    H -->|是| I[维持训练]
    H -->|否| J[调整方案]
\`\`\`

---

##  参考文献

${paper.authors.join(', ')}. (${paper.year}). ${paper.title}. *${paper.journal}*.

**原文链接**：
- 🔗 [PubMed 全文](https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/)
${paper.doi ? `- 🔗 [DOI 全文链接](https://doi.org/${paper.doi})` : ''}

---
*本报告由自动化文献搜集智能体 v2.0 生成 | 数据来源: PubMed | 生成时间: ${new Date().toLocaleDateString('zh-CN')}*
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已生成报告: ${fileName}`);
}

// 主执行逻辑
async function main() {
  console.log('🚀 正在从 PubMed 数据库同步最新前沿文献...\n');

  for (const [category, query] of Object.entries(searchQueries)) {
    const papers = await fetchPubMedArticles(query, 5); // 每个分类抓取 5 篇
    
    for (const paper of papers) {
      generateReport(category, paper);
      await delay(800); // 礼貌性延迟（避免请求过快被拒绝）
    }
    await delay(1500); // 分类间延迟
  }

  console.log('\n✨ 自动化搜寻任务完成！请运行 npm run index 更新索引。');
}

main();
