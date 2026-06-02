import { useState, useEffect } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import categories from '../data/categories';

// 搜索组件
function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // 加载所有文章
  useEffect(() => {
    if (!isOpen) return;

    const loadArticles = async () => {
      setIsSearching(true);
      
      try {
        const allArticles = [];
        
        for (const category of categories) {
          try {
            const response = await fetch(`/data/knowledge/${category.knowledgeFile}`);
            if (!response.ok) continue;
            
            const content = await response.text();
            // 简单解析Markdown文件
            const sections = content.split(/^## /m).filter(Boolean);
            
            sections.forEach((section, index) => {
              if (index === 0) {
                // 第一个部分可能是标题
                allArticles.push({
                  title: section.split('\n')[0].replace(/^# /, ''),
                  content: section,
                  category: category.name,
                  categoryId: category.id
                });
              } else {
                const lines = section.split('\n');
                allArticles.push({
                  title: lines[0],
                  content: section,
                  category: category.name,
                  categoryId: category.id
                });
              }
            });
          } catch (err) {
            console.error(`加载 ${category.name} 失败:`, err);
          }
        }
        
        setResults(allArticles.slice(0, 50)); // 限制显示数量
      } catch (err) {
        console.error('加载文章失败:', err);
      } finally {
        setIsSearching(false);
      }
    };
    
    loadArticles();
  }, [isOpen]);

  // 执行搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    const performSearch = async () => {
      try {
        const Fuse = (await import('fuse.js')).default;
        
        const fuse = new Fuse(results, {
          keys: [
            { name: 'title', weight: 0.5 },
            { name: 'content', weight: 0.3 },
            { name: 'category', weight: 0.2 },
          ],
          threshold: 0.4,
          includeScore: true,
          minMatchCharLength: 2,
        });

        const searchResults = fuse.search(searchTerm).slice(0, 10);
        setResults(searchResults.map(r => ({
          ...r.item,
          score: r.score
        })));
      } catch (err) {
        console.error('搜索失败:', err);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? 
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{part}</mark> : 
        part
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* 搜索框 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索知识点、文献、概念..."
            className="flex-1 outline-none text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>搜索中...</p>
            </div>
          ) : results.length === 0 && searchTerm ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>未找到相关结果</p>
              <p className="text-sm mt-2">尝试其他关键词</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(`/knowledge/${result.categoryId}`);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mb-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {highlightText(result.title, searchTerm)}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {result.category}
                        </span>
                        {result.score !== undefined && (
                          <span className="text-gray-500 dark:text-gray-400">
                            匹配度 {Math.round((1 - result.score) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>按 ESC 关闭</span>
            <span>共找到 {results.length} 个结果</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
