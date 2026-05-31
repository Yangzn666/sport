import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KnowledgeBase from './pages/KnowledgeBase';
import Category from './pages/Category';
import Article from './pages/Article';
import 'katex/dist/katex.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/knowledge/:category" element={<KnowledgeBase />} />
        <Route path="/category/:category" element={<Category />} />
        <Route path="/article/:category/:id" element={<Article />} />
      </Routes>
    </Router>
  );
}

export default App;
