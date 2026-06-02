import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { useState, useEffect } from 'react';
import articleIndex from '../data/articleIndex.json';
import SearchModal from '../components/SearchModal';
import ThemeToggle from '../components/ThemeToggle';
import TrainingStats from '../components/TrainingStats';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalCategories: 5,
    latestUpdate: '',
    totalAuthors: 0
  });

  useEffect(() => {
    // 计算统计数据
    let totalArticles = 0;
    let authors = new Set();
    let latestDate = new Date(0);

    articleIndex.forEach(cat => {
      if (cat.type === 'folder' && cat.children) {
        cat.children.forEach(article => {
          if (article.type === 'file' && article.name !== 'intro') {
            totalArticles++;
            // 从文件名提取 PMID（最后一段）
            const pmid = article.name.split('_').pop();
            if (pmid && !isNaN(pmid)) {
              authors.add(pmid);
            }
          }
        });
      }
    });

    setStats({
      totalArticles,
      totalCategories: 5,
      latestUpdate: new Date().toLocaleDateString('zh-CN'),
      totalAuthors: authors.size
    });
  }, []);

  // Ctrl+K 快捷键打开搜索
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCategories = categories.map(cat => {
    const catData = articleIndex.find(c => c.name === cat.id);
    const articleCount = catData?.children?.filter(c => c.type === 'file' && c.name !== 'intro').length || 0;
    
    return {
      ...cat,
      articleCount,
      matched: cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               cat.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
    };
  }).filter(cat => cat.matched);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero 区域 */}
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          {/* 顶部工具栏 */}
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>
          
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-4">
              健身科学知识库
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              基于 PubMed 最新文献的自动化知识聚合平台，为您提供循证训练指导
            </p>
          </div>

          {/* 搜索框 - 点击打开高级搜索 */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full px-6 py-4 text-left bg-white border-2 border-slate-300 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  🔍 搜索知识点、文献标题、训练方法...
                </span>
                <kbd className="hidden md:inline-block px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-mono">
                  Ctrl+K
                </kbd>
              </div>
            </button>
          </div>

          {/* 统计仪表盘 - 简约风格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4">
            <div className="bg-slate-50 rounded-xl p-4 md:p-6 text-center border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.totalArticles}</div>
              <div className="text-xs md:text-sm text-slate-600">篇文献</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 md:p-6 text-center border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.totalCategories}</div>
              <div className="text-xs md:text-sm text-slate-600">个分类</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 md:p-6 text-center border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.totalAuthors}</div>
              <div className="text-xs md:text-sm text-slate-600">位研究者</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 md:p-6 text-center border border-slate-200">
              <div className="text-base md:text-lg font-semibold text-slate-900 mb-1">{stats.latestUpdate}</div>
              <div className="text-xs md:text-sm text-slate-600">最后更新</div>
            </div>
          </div>
        </div>
      </header>

      {/* 分类卡片网格 */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* 训练统计面板 */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            我的训练数据
          </h2>
          <TrainingStats />
        </section>

        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-slate-800">
            知识分类
          </h2>
          <span className="text-xs md:text-sm text-slate-500">
            共 {filteredCategories.length} 个分类
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCategories.map((cat, index) => (
            <div 
              key={cat.id} 
              className="group bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-blue-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6 md:p-8">
                {/* 标题和文献数 */}
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl font-serif font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg whitespace-nowrap border border-blue-200 ml-2">
                    {cat.articleCount} 篇
                  </span>
                </div>

                {/* 子分类标签 */}
                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                  {cat.subcategories.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-200">
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="bg-slate-50 text-slate-500 text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-200">
                      +{cat.subcategories.length - 3}
                    </span>
                  )}
                </div>

                {/* 描述文字 */}
                <p className="text-slate-600 text-sm mb-4 md:mb-6 line-clamp-2 leading-relaxed">
                  {cat.id === 'running' && '基于生物力学和运动经济学的最新研究，优化跑步姿态与训练效率'}
                  {cat.id === 'strength' && '肌肥大机制、神经适应与核心稳定性的循证训练方法'}
                  {cat.id === 'physiology' && '能量代谢、心肺功能与运动适应性的生理学基础'}
                  {cat.id === 'nutrition' && '宏量营养素、运动补剂与水合状态的科学指导'}
                  {cat.id === 'recovery' && '睡眠优化、过度训练监测与运动心理学应用'}
                </p>

                {/* 操作按钮 */}
                <div className="flex gap-2 md:gap-3">
                  <Link 
                    to={`/knowledge/${cat.id}`} 
                    className="flex-1 inline-flex items-center justify-center px-3 md:px-5 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-sm md:text-base shadow-sm hover:shadow-md hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5 md:mr-2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    学习知识
                  </Link>
                  <Link 
                    to={`/category/${cat.id}`} 
                    className="inline-flex items-center px-3 md:px-5 py-2.5 md:py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-medium text-sm md:text-base hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5 md:mr-2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    查看文献
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 最近更新时间 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-50 px-6 py-3 rounded-lg border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600">
              数据最后更新：{stats.latestUpdate} | 数据来源：PubMed | 自动同步
            </span>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p className="font-medium">健身科学知识库 v2.0 | 基于 PubMed API 自动化构建</p>
          <p className="mt-2 text-slate-500">所有文献均来自同行评审的学术期刊，请结合专业指导进行实践</p>
        </div>
      </footer>

      {/* 全局搜索模态框 */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </div>
  );
}
