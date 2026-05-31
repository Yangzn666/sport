import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { categories } from '../data/categories';
import 'katex/dist/katex.min.css';

// Mermaid 渲染组件 - 优化版（支持点击放大）
const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 15,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 60,
        diagramPadding: 20
      },
      themeVariables: {
        primaryColor: '#e0f2fe',
        primaryTextColor: '#0c4a6e',
        primaryBorderColor: '#0ea5e9',
        lineColor: '#94a3b8',
        secondaryColor: '#f0f9ff',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        nodeBorder: '#cbd5e1',
        fontSize: '15px',
        fontFamily: '"Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 20,
        actorMargin: 80,
        width: 200,
        height: 60,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: false,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false
      },
      gantt: {
        titleTopMargin: 25,
        barHeight: 30,
        barGap: 8,
        topPadding: 75,
        sidePadding: 75,
        gridLineStartPadding: 35,
        fontSize: 14,
        fontFamily: '"Noto Sans SC", sans-serif',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d'
      }
    });
    
    const render = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setSvg(`<div class="p-4 text-red-500 bg-red-50 rounded-lg border border-red-200">图表渲染失败: ${err.message}</div>`);
      }
    };
    render();
  }, [chart]);

  return (
    <>
      <div 
        className="flex justify-center items-center my-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsZoomed(true)}
        title="点击放大查看"
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full [&_svg]:max-w-full [&_svg]:h-auto" />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm text-slate-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
              <path d="M11 8v6"/>
              <path d="M8 11h6"/>
            </svg>
            点击放大
          </div>
        </div>
      </div>

      {/* 放大查看弹窗 */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>

            {/* 图表内容 */}
            <div className="p-8 md:p-12">
              <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full [&_svg]:w-full [&_svg]:h-auto" />
            </div>

            {/* 底部提示 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-sm text-slate-600 shadow-lg">
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
    const filePath = subPage 
      ? `/data/knowledge/${category}_${subPage}.md`
      : `/data/knowledge/${category}.md`;
    
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
        setContent(`# 知识库构建中\n\n该分类的知识库正在由 AI 智能体自动生成，请稍后刷新查看。`);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center text-slate-600 hover:text-blue-600 transition-colors font-medium group">
              <div className="mr-2 p-1 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </div>
              返回首页
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">{catInfo?.name}</span>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                {references.length} 篇参考文献
              </span>
            </div>
          </div>
          
          {/* 子页面切换标签 */}
          {category === 'physiology' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleSubPageChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !subPage
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                能量代谢系统
              </button>
              <button
                onClick={() => handleSubPageChange('fibers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'fibers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                肌肉纤维类型
              </button>
              <button
                onClick={() => handleSubPageChange('vo2')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  subPage === 'vo2'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                心肺功能与 VO2 Max
              </button>
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
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">目录</h3>
              <nav className="space-y-1">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left block text-sm transition-all duration-200 rounded-lg px-3 py-2 ${
                      currentSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              {/* 参考文献 */}
              {references.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">参考文献</h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {references.map((ref, idx) => (
                      <li key={idx}>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 line-clamp-2">
                          [{idx + 1}] {ref.title.substring(0, 40)}...
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
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-12">
              {/* 章节标题 */}
              {sections.length > 0 && (
                <div className="mb-8 pb-6 border-b-2 border-slate-200">
                  <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">
                    {catInfo?.name}
                  </h1>
                  <p className="text-lg text-slate-600 italic">
                    {sections.find(s => s.id === currentSection)?.title}
                  </p>
                </div>
              )}

              <article className="prose prose-slate max-w-none" ref={contentRef}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({node, ...props}) => null, // 隐藏 H1，因为已经有标题
                  h2: ({node, children, ...props}) => {
                    // 为每个 H2 生成 ID 并添加锚点
                    const sectionId = String(children).toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[<>:"/\\|?*]/g, '') // 只移除文件系统不允许的字符
                      .substring(0, 50); // 限制长度
                    return (
                      <h2 
                        id={`section-${sectionId}`} 
                        className="text-2xl font-serif font-semibold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-200 scroll-mt-24" 
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
                        className="text-xl font-semibold text-slate-700 mt-8 mb-3 scroll-mt-24" 
                        {...props}
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({node, ...props}) => <p className="text-base leading-relaxed text-slate-700 mb-4 text-justify" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-3 my-6 bg-gradient-to-r from-blue-50 to-transparent text-slate-700 italic rounded-r-lg shadow-sm" {...props} />
                  ),
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match && match[1] === 'mermaid') {
                      return (
                        <div className="my-8 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-x-auto">
                          <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">流程图</div>
                          <Mermaid chart={String(children).replace(/\n$/, '')} />
                        </div>
                      );
                    }
                    return !inline ? (
                      <pre className="bg-slate-900 text-slate-50 p-5 rounded-lg overflow-x-auto my-6 shadow-md">
                        <code className="text-sm font-mono" {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-sm border border-blue-200" {...props}>{children}</code>
                    );
                  },
                  a: ({node, ...props}) => (
                    <a className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 transition-all font-medium" {...props} />
                  ),
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-8 rounded-lg shadow-md border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => (
                    <th className="px-5 py-3 bg-gradient-to-b from-slate-50 to-slate-100 text-left text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-5 py-3 text-sm text-slate-700 border-t border-slate-200 hover:bg-slate-50 transition-colors" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-inside space-y-2 my-4 ml-4" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-inside space-y-2 my-4 ml-4" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-base text-slate-700 leading-relaxed" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-bold text-slate-900" {...props} />
                  ),
                  em: ({node, ...props}) => (
                    <em className="italic text-slate-700" {...props} />
                  ),
                  hr: ({node, ...props}) => (
                    <hr className="my-8 border-t-2 border-slate-200" {...props} />
                  ),
                }}
              >
                {sections.find(s => s.id === currentSection)?.content || content}
              </ReactMarkdown>
            </article>

            {/* 底部导航按钮 */}
            {sections.length > 0 && (
              <div className="mt-12 pt-8 border-t-2 border-slate-200 flex justify-between items-center">
                {(() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  
                  return (
                    <>
                      <button
                        onClick={() => scrollToSection(sections[currentIndex - 1]?.id)}
                        disabled={currentIndex === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          currentIndex === 0
                            ? 'text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m15 18-6-6 6-6"/>
                        </svg>
                        上一节
                      </button>
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
                        {currentIndex + 1} / {sections.length}
                      </span>
                      <button
                        onClick={() => scrollToSection(sections[currentIndex + 1]?.id)}
                        disabled={currentIndex === sections.length - 1}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          currentIndex === sections.length - 1
                            ? 'text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        下一节
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
