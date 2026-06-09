import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { categories } from '../data/categories';
import { useTheme } from '../contexts/ThemeContext';
import 'katex/dist/katex.min.css';

// Category ID 到文件名的映射
const categoryFileMap = {
  'physiology': '运动生理学基础',
  'running': '有氧训练与耐力科学',
  'strength': '力量训练科学',
  'nutrition': '营养与恢复科学',
  'recovery': '周期化训练高级理论'
};

// Mermaid 渲染组件 - 优化版（支持点击放大）
const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: '"Noto Sans SC", "Merriweather", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 16,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 25,
        nodeSpacing: 60,
        rankSpacing: 80,
        diagramPadding: 25
      },
      themeVariables: {
        primaryColor: '#dbeafe',
        primaryTextColor: '#1e40af',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#f0f9ff',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        nodeBorder: '#cbd5e1',
        fontSize: '16px',
        fontFamily: '"Noto Sans SC", "Merriweather", sans-serif'
      }
    });
    
    const render = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setSvg(`<div class="p-6 text-red-600 bg-red-50 rounded-xl border-2 border-red-200">图表渲染失败: ${err.message}</div>`);
      }
    };
    render();
  }, [chart]);

  return (
    <>
      <div 
        className="flex justify-center items-center my-8 p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsZoomed(true)}
        title="点击放大查看"
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full [&_svg]:max-w-full [&_svg]:h-auto" />
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-lg text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
              <path d="M11 8v6"/>
              <path d="M8 11h6"/>
            </svg>
            点击放大
          </div>
        </div>
      </div>

      {/* 放大查看弹窗 - 优化版 */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-auto border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 z-10 bg-white dark:bg-slate-700 rounded-full p-3 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>

            <div className="p-12 md:p-16">
              <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full [&_svg]:w-full [&_svg]:h-auto" />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 px-6 py-3 rounded-full text-sm text-slate-600 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-700">
              点击任意区域关闭
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function KnowledgeBase() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState([]);
  const [sections, setSections] = useState([]); // 存储分页面数据
  const [currentSection, setCurrentSection] = useState(''); // 当前显示的章节
  const contentRef = useRef(null); // 内容区域引用

  // 获取当前子页面参数
  const subPage = new URLSearchParams(window.location.search).get('page');

  // 切换子页面
  const handleSubPageChange = useCallback((newSubPage) => {
    if (newSubPage) {
      navigate(`/knowledge/${category}?page=${newSubPage}`);
    } else {
      navigate(`/knowledge/${category}`);
    }
  }, [category, navigate]);

  useEffect(() => {
    // 检查是否有子页面参数
    const basePath = import.meta.env.BASE_URL || '/';
    
    // 将 category ID 转换为实际文件名
    const fileName = categoryFileMap[category] || category;
    
    const filePath = subPage 
      ? `${basePath}data/knowledge/${fileName}_${subPage}.md`
      : `${basePath}data/knowledge/${fileName}.md`;
    
    // 重置状态
    setLoading(true);
    setContent('');
    setSections([]);
    setCurrentSection('');
    setToc([]);
    setReferences([]);
    
    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(text => {
        setContent(text);
        
        // 解析章节结构
        const parsedSections = parseSections(text);
        setSections(parsedSections);
        
        // 如果有章节，默认显示第一个
        if (parsedSections.length > 0) {
          setCurrentSection(parsedSections[0].id);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }
        
        // 提取目录（所有 ## 和 ### 标题）
        const headings = [];
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.startsWith('## ') || line.startsWith('### ')) {
            const level = line.startsWith('###') ? 3 : 2;
            const title = line.replace(/^#+\s/, '');
            const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            headings.push({ level, title, id });
          }
        });
        setToc(headings);

        // 提取参考文献（所有链接）
        const refMatches = text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        const refs = refMatches.map(match => {
          const [, title, url] = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
          return { title, url };
        });
        setReferences(refs.slice(-10)); // 只显示最后10个引用
      })
      .catch(err => {
        console.error('Error loading knowledge base:', err);
        console.error('Attempted to load:', filePath);
        console.error('Category:', category, 'Mapped to:', fileName);
        setContent(`# 加载失败\n\n**请求路径**: \`${filePath}\`\n\n**错误信息**: ${err.message}\n\n请检查文件是否存在于 public/data/knowledge/ 目录中。`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, subPage]); // 添加 subPage 到依赖数组

  // 解析章节结构
  const parseSections = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let content = [];
    let skipIntro = true; // 跳过开头的引导内容
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        const title = line.replace(/^##\s/, '');
        
        // 跳过"章节导航"这个特殊章节
        if (title === '章节导航') {
          skipIntro = true;
          currentSection = null;
          content = [];
          return;
        }
        
        // 保存上一个章节（如果不是要跳过的引导内容）
        if (currentSection && !skipIntro) {
          sections.push({
            id: currentSection.id,
            title: currentSection.title,
            content: content.join('\n')
          });
        }
        
        // 开始新章节
        // 修复：保留中文字符，使用 encodeURIComponent 处理特殊字符
        const id = title.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[<>:"/\\|?*]/g, '') // 只移除文件系统不允许的字符
          .substring(0, 50); // 限制长度
        currentSection = { id, title };
        content = [];
        skipIntro = false;
      } else if (currentSection && !skipIntro) {
        content.push(line);
      }
    });
    
    // 保存最后一个章节
    if (currentSection && !skipIntro) {
      sections.push({
        id: currentSection.id,
        title: currentSection.title,
        content: content.join('\n')
      });
    }
    
    return sections;
  };

  // 滚动到指定章节
  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    
    setCurrentSection(sectionId);
    
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        const offsetTop = element.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // 使用 IntersectionObserver 监听章节滚动
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace('section-', '');
            setCurrentSection(sectionId);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const catInfo = categories.find(c => c.id === category);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* 顶部信息栏 */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </div>
              <span>返回首页</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{catInfo?.name}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{references.length} 篇参考文献</span>
              </div>
            </div>
          </div>
          
          {/* 子页面切换标签 */}
          {category === 'physiology' && (
            <div className="flex gap-3 mt-4">
              {[
                { label: '能量代谢系统', page: null },
                { label: '肌肉纤维类型', page: 'fibers' },
                { label: '心肺功能与 VO2 Max', page: 'vo2' }
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => handleSubPageChange(tab.page)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    (!subPage && tab.page === null) || subPage === tab.page
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          
          {category === 'running' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleSubPageChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !subPage
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                跑姿生物力学
              </button>
              <button
                onClick={() => handleSubPageChange('biomechanics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'biomechanics'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                生物力学详解
              </button>
              <button
                onClick={() => handleSubPageChange('plans')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'plans'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                训练计划设计
              </button>
            </div>
          )}
          
          {category === 'strength' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleSubPageChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !subPage
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                肌肥大机制
              </button>
              <button
                onClick={() => handleSubPageChange('hypertrophy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'hypertrophy'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                肌肥大深度解析
              </button>
              <button
                onClick={() => handleSubPageChange('periodization')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'periodization'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                周期化模型
              </button>
              <button
                onClick={() => handleSubPageChange('technique')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'technique'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                动作技术与部位锻炼
              </button>
              <button
                onClick={() => handleSubPageChange('programs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'programs'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                训练计划设计
              </button>
            </div>
          )}
          
          {category === 'nutrition' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleSubPageChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !subPage
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                宏量营养素
              </button>
              <button
                onClick={() => handleSubPageChange('protein')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'protein'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                蛋白质科学
              </button>
              <button
                onClick={() => handleSubPageChange('supplements')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'supplements'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                补剂证据汇总
              </button>
              <button
                onClick={() => handleSubPageChange('carbs_fats')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'carbs_fats'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                碳水与脂肪科学
              </button>
            </div>
          )}
          
          {category === 'recovery' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleSubPageChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !subPage
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                睡眠与恢复
              </button>
              <button
                onClick={() => handleSubPageChange('sleep')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'sleep'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                睡眠科学详解
              </button>
              <button
                onClick={() => handleSubPageChange('overtraining')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'overtraining'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                过度训练预防
              </button>
              <button
                onClick={() => handleSubPageChange('psychology')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'psychology'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                心理技能训练
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 左侧目录 */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
              {/* 目录标题 */}
              <div className="mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                  章节目录
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">点击跳转至对应章节</p>
              </div>
              
              {/* 目录列表 */}
              <nav className="space-y-2">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left block text-sm transition-all duration-300 rounded-xl px-4 py-3 ${
                      currentSection === section.id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:pl-5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="line-clamp-2">{section.title}</span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* 参考文献 */}
              {references.length > 0 && (
                <div className="mt-10 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
                  <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                      参考文献
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">共 {references.length} 篇</p>
                  </div>
                  <ul className="space-y-3">
                    {references.map((ref, idx) => (
                      <li key={idx} className="group">
                        <a 
                          href={ref.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed"
                        >
                          <span className="inline-block w-5 text-slate-400 dark:text-slate-500 font-mono mr-1">[{idx + 1}]</span>
                          {ref.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 max-w-4xl">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12">
              {/* 章节标题 */}
              {sections.length > 0 && (
                <div className="mb-10 pb-8 border-b-2 border-slate-200 dark:border-slate-700">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                    {catInfo?.name}
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 italic font-light">
                    {sections.find(s => s.id === currentSection)?.title}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>阅读时间: 约 {Math.ceil(content.length / 1000)} 分钟</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{sections.length} 个章节</span>
                    </div>
                  </div>
                </div>
              )}

              <article className="prose prose-slate prose-lg max-w-none dark:prose-invert" ref={contentRef}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({node, ...props}) => null,
                  h2: ({node, children, ...props}) => {
                    const sectionId = String(children).toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[<>:"/\\|?*]/g, '')
                      .substring(0, 50);
                    return (
                      <h2 
                        id={`section-${sectionId}`} 
                        className="text-3xl font-serif font-bold text-slate-900 dark:text-white mt-12 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700 scroll-mt-24" 
                        {...props}
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3: ({node, children, ...props}) => {
                    const sectionId = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return (
                      <h3 
                        id={sectionId} 
                        className="text-2xl font-serif font-semibold text-slate-800 dark:text-slate-200 mt-10 mb-4 scroll-mt-24" 
                        {...props}
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({node, ...props}) => (
                    <p className="text-lg leading-loose text-slate-700 dark:text-slate-300 mb-6 text-justify" {...props} />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-6 py-4 my-8 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent text-slate-700 dark:text-slate-300 italic rounded-r-xl shadow-sm" {...props} />
                  ),
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match && match[1] === 'mermaid') {
                      return (
                        <div className="my-10 p-8 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-x-auto">
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            流程图
                          </div>
                          <Mermaid chart={String(children).replace(/\n$/, '')} />
                        </div>
                      );
                    }
                    return !inline ? (
                      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-50 p-6 rounded-xl overflow-x-auto my-8 shadow-lg border border-slate-700">
                        <code className="text-sm font-mono" {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-mono text-sm border border-blue-200 dark:border-blue-800" {...props}>{children}</code>
                    );
                  },
                  a: ({node, ...props}) => (
                    <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-all font-medium" {...props} />
                  ),
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-10 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => (
                    <th className="px-6 py-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-left text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b-2 border-slate-300 dark:border-slate-600" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-inside space-y-3 my-6 ml-4 marker:text-blue-600 dark:marker:text-blue-400" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-inside space-y-3 my-6 ml-4 marker:text-blue-600 dark:marker:text-blue-400 marker:font-semibold" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                  ),
                  em: ({node, ...props}) => (
                    <em className="italic text-slate-700 dark:text-slate-300" {...props} />
                  ),
                  hr: ({node, ...props}) => (
                    <hr className="my-12 border-t-2 border-slate-200 dark:border-slate-700" {...props} />
                  ),
                }}
              >
                {sections.find(s => s.id === currentSection)?.content || content}
              </ReactMarkdown>
            </article>

            {/* 底部导航按钮 */}
            {sections.length > 0 && (
              <div className="mt-16 pt-10 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center">
                {(() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  
                  return (
                    <>
                      <button
                        onClick={() => scrollToSection(sections[currentIndex - 1]?.id)}
                        disabled={currentIndex === 0}
                        className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                          currentIndex === 0
                            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m15 18-6-6 6-6"/>
                        </svg>
                        上一节
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-5 py-2.5 rounded-full shadow-sm">
                          {currentIndex + 1} / {sections.length}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => scrollToSection(sections[currentIndex + 1]?.id)}
                        disabled={currentIndex === sections.length - 1}
                        className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                          currentIndex === sections.length - 1
                            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl hover:-translate-y-0.5'
                        }`}
                      >
                        下一节
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
