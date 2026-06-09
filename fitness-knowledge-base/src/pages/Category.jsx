import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import articleIndex from '../data/articleIndex.json';

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 查找该分类下的所有文章
    const catData = articleIndex.find(c => c.name === category);
    if (catData && catData.children) {
      const realArticles = catData.children.filter(c => c.type === 'file' && c.name !== 'intro');
      setArticles(realArticles);
    }
    setLoading(false);
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium group">
            <div className="mr-2 p-1 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            返回知识库
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded">
            {category.toUpperCase()} • {articles.length} 篇文献
          </span>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 分类标题和统计 */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
                {category === 'running' ? '跑步科学' :
                 category === 'strength' ? '力量与体能' :
                 category === 'physiology' ? '运动生理学' :
                 category === 'nutrition' ? '营养与补剂' :
                 category === 'recovery' ? '恢复与心理' : category}
              </h1>
            </div>
          </div>
          <p className="text-lg text-slate-600 ml-20">
            基于 <span className="font-semibold text-blue-600">{articles.length}</span> 篇最新权威文献的知识汇总（2020-2026）
          </p>
        </div>

        {/* 快速统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
            <div className="text-xs text-slate-500 mt-1">文献总数</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-purple-600">{articles.filter(a => a.title.includes('Review') || a.title.includes('Meta')).length}</div>
            <div className="text-xs text-slate-500 mt-1">综述研究</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-green-600">2020-2026</div>
            <div className="text-xs text-slate-500 mt-1">时间范围</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-orange-600">PubMed</div>
            <div className="text-xs text-slate-500 mt-1">数据来源</div>
          </div>
        </div>

        {/* 文献列表 */}
        <div className="space-y-6">
          {articles.map((article, index) => (
            <article key={article.name} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* 左侧序号装饰 */}
              <div className="flex">
                <div className="w-16 md:w-20 bg-gradient-to-b from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">{String(index + 1).padStart(2, '0')}</span>
                </div>
                
                <div className="flex-1 p-6 md:p-8">
                  {/* 文章标题 */}
                  <h2 className="text-xl md:text-2xl font-serif font-semibold text-slate-900 mb-4 leading-tight">
                    {article.title}
                  </h2>

                  {/* 元数据 */}
                  <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {article.title.includes('Review') || article.title.includes('Meta') ? '综述研究' : '原始研究'}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      PMID: {article.name.split('_').pop()}
                    </span>
                  </div>

                  {/* 摘要预览 */}
                  <div className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {/* 这里会显示摘要的前 200 字 */}
                    点击查看完整研究摘要、实验设计和实践应用建议...
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to={`/article/${category}/${article.name}`}
                      className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      阅读全文
                    </Link>
                    <a 
                      href={`https://pubmed.ncbi.nlm.nih.gov/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      PubMed 原文
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 底部统计 */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
          <p>数据来源：自动化文献搜集智能体 v2.0 | PubMed | 生成时间：{new Date().toLocaleDateString()}</p>
          <p className="mt-2">点击"阅读全文"查看每篇文献的详细摘要、实验设计和实践应用建议</p>
        </footer>
      </main>
    </div>
  );
}
