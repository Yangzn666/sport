import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KnowledgeBase from './pages/KnowledgeBase';
import Category from './pages/Category';
import Article from './pages/Article';
import { useState, useEffect, Suspense, lazy } from 'react';
import 'katex/dist/katex.min.css';

// 懒加载页面组件
const LazyHome = lazy(() => import('./pages/Home'));
const LazyKnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const LazyCategory = lazy(() => import('./pages/Category'));
const LazyArticle = lazy(() => import('./pages/Article'));

// Loading组件
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">加载中...</p>
        <p className="text-gray-500 text-sm mt-2">首次加载可能需要10-30秒</p>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟最小加载时间，确保用户看到loading状态
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LazyHome />} />
          <Route path="/knowledge/:category" element={<LazyKnowledgeBase />} />
          <Route path="/category/:category" element={<LazyCategory />} />
          <Route path="/article/:category/:id" element={<LazyArticle />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
