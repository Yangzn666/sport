import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DataAnalytics from './pages/DataAnalytics';
import SmartAnalysis from './pages/SmartAnalysis';
import DeepAnalysis from './pages/DeepAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<DataAnalytics />} />
        <Route path="/smart-analysis" element={<SmartAnalysis />} />
        <Route path="/deep-analysis" element={<DeepAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
