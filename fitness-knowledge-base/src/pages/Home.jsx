import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { useState, useEffect } from 'react';
import articleIndex from '../data/articleIndex.json';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalCategories: 5,
    latestUpdate: '',
  });

  useEffect(() => {
    let totalArticles = 0;
    
    articleIndex.forEach(cat => {
      if (cat.type === 'folder' && cat.children) {
        cat.children.forEach(article => {
          if (article.type === 'file' && article.name !== 'intro') {
            totalArticles++;
          }
        });
      }
    });

    setStats({
      totalArticles,
      totalCategories: 5,
      latestUpdate: new Date().toLocaleDateString('zh-CN'),
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero 区域 */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          {/* 品牌标识 */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">健身科学知识库</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fitness Knowledge Base</p>
              </div>
            </div>
            
            {/* 主题切换按钮 */}
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-all">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* 主标题区 */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              循证训练<br/>
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">科学指南</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              基于 PubMed 最新文献的自动化知识聚合平台<br/>
              <span className="text-base md:text-lg text-slate-500 dark:text-slate-400">为您提供权威、前沿的健身科学指导</span>
            </p>
          </div>

          {/* 统计信息卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {stats.totalArticles}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">精选文献</div>
              <div className="mt-3 text-xs text-slate-500">持续更新中</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                {stats.totalCategories}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">知识领域</div>
              <div className="mt-3 text-xs text-slate-500">覆盖全面</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                {stats.latestUpdate}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">最近更新</div>
              <div className="mt-3 text-xs text-slate-500">实时同步</div>
            </div>
          </div>
        </div>
      </header>

      {/* 知识领域卡片 */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            📚 知识领域
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            从基础理论到高级应用,系统化构建您的健身科学知识体系
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/knowledge/${category.id}`}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 卡片顶部装饰条 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              
              <div className="relative">
                {/* 图标 */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  {category.icon}
                </div>
                
                {/* 标题 */}
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                
                {/* 描述 */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {category.description}
                </p>
                
                {/* 子分类标签 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {category.subcategories.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-slate-600">
                      {sub}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-xs rounded-full font-medium">
                      +{category.subcategories.length - 3}
                    </span>
                  )}
                </div>

                {/* 底部信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{category.articleCount || 0} 篇文章</span>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                    进入学习
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* 底部 */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-16 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-3">关于本站</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                基于 PubMed 最新文献的健身科学知识库,为运动爱好者和专业人士提供循证训练指导。
              </p>
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-3">快速链接</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">首页</Link></li>
                <li><Link to="/knowledge/physiology" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">运动生理学</Link></li>
                <li><Link to="/knowledge/strength" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">力量训练</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-3">技术支持</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                React + Vite + Tailwind CSS<br/>
                Markdown + Mermaid + KaTeX
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-500">
            <p>© 2026 健身科学知识库 · 循证训练 · 科学健身</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
