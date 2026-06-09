import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import articleIndex from '../data/articleIndex.json';
import 'katex/dist/katex.min.css';

// Mermaid 渲染组件
const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif'
    });
    
    const render = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setSvg(`<div class="p-4 text-red-500">图表渲染失败</div>`);
      }
    };
    render();
  }, [chart]);

  return (
    <div className="my-8 p-6 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

export default function Article() {
  const { category, id } = useParams();
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState({ title: '' });

  useEffect(() => {
    const findFile = (items) => {
      for (const item of items) {
        if (item.type === 'folder') {
          if (item.name === category) {
            const found = item.children?.find(c => c.type === 'file' && c.name === id);
            if (found) return found;
          }
          const found = findFile(item.children || []);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(articleIndex);
    if (file) {
      const basePath = import.meta.env.BASE_URL || '/';
      const filePath = `${basePath}data/knowledge/${file.path}`;
      fetch(filePath)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then(text => {
          setContent(text);
          setMeta({ title: file.title });
        })
        .catch(err => {
          console.error("Error loading article:", err);
          setContent(`# 报告加载失败\n\n无法找到文件: ${filePath}`);
        });
    } else {
      setContent(`# 未找到相关报告`);
    }
  }, [category, id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
            <div className="mr-2 p-1 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            返回知识库
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{category}</span>
        </div>
      </header>

      {/* 正文内容 */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* 文章头部装饰 */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="p-8 md:p-12">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({node, ...props}) => (
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6 leading-tight" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <div className="flex items-center mt-10 mb-6">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>
                    <h2 className="text-xl md:text-2xl font-serif font-semibold text-slate-800" {...props} />
                  </div>
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-lg font-semibold text-slate-700 mt-8 mb-3" {...props} />
                ),
                p: ({node, ...props}) => <p className="text-lg leading-relaxed text-slate-700 mb-6" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-6 py-3 my-6 bg-blue-50/30 text-slate-600 italic rounded-r-lg" {...props} />
                ),
                code: ({node, inline, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match && match[1] === 'mermaid') {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                  }
                  return !inline ? (
                    <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-x-auto my-6 shadow-inner">
                      <code className="text-sm font-mono" {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                  );
                },
                a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-600 transition-all font-medium" {...props} />,
                hr: () => <hr className="my-10 border-slate-200" />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-700" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-8 rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props} />,
                td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 border-t border-slate-100" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
        
        {/* 底部元数据 */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>数据来源：自动化文献搜集智能体 v2.0 | PubMed | 生成时间：{new Date().toLocaleDateString()}</p>
        </footer>
      </main>
    </div>
  );
}
