import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DataAnalytics() {
  const navigate = useNavigate();
  const [runningData, setRunningData] = useState([]);
  const [strengthData, setStrengthData] = useState([]);
  const [bodyCompositionData, setBodyCompositionData] = useState([]);
  const [activeTab, setActiveTab] = useState('running');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('running');

  // 加载真实跑步数据
  useEffect(() => {
    fetch('/your_data/your_running_data.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(d => d['日期']);
        
        const parsedData = data.map(row => ({
          date: row['日期'],
          distance: parseFloat(row['距离']) || 0,
          time: parseFloat(row['时间']) || 0,
          pace: parseFloat(row['配速']) || 0,
          heartRate: row['心率'] === '--' || !row['心率'] ? 0 : parseInt(row['心率']) || 0,
          type: row['类型'] || '未知',
          cadence: parseInt(row['步频']) || 0,
        }));
        
        setRunningData(parsedData);
      })
      .catch(error => console.error('Error loading running data:', error));
  }, []);

  // 加载真实力量训练数据
  useEffect(() => {
    fetch('/your_data/your_strength_data.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(d => d['日期']);
        
        const parsedData = data.map(row => ({
          date: row['日期'],
          exercise: row['动作'] || '',
          weight: parseFloat(row['重量']) || 0,
          sets: parseInt(row['组数']) || 1,
          reps: parseInt(row['次数']) || 0,
          volume: parseFloat(row['容量']) || 0,
          bodyPart: row['部位'] || '其他',
        }));
        
        setStrengthData(parsedData);
      })
      .catch(error => console.error('Error loading strength data:', error));
  }, []);

  // 加载体脂秤数据
  useEffect(() => {
    fetch('/your_data/your_body_composition_data.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(d => d['日期']);
        
        const parsedData = data.map(row => ({
          date: row['日期'],
          time: row['时间'] || '',
          weight: parseFloat(row['体重']) || 0,
          bodyFatRate: parseFloat(row['体脂率']) || 0,
          fatMass: parseFloat(row['脂肪量']) || 0,
          skeletalMuscle: parseFloat(row['骨骼肌']) || 0,
          bodyWater: parseFloat(row['身体水分']) || 0,
          bmi: parseFloat(row['BMI']) || 0,
          bmr: parseFloat(row['基础代谢']) || 0,
          whr: parseFloat(row['腰臀比']) || 0,
          bodyType: row['体型'] || '',
        }));
        
        setBodyCompositionData(parsedData);
      })
      .catch(error => console.error('Error loading body composition data:', error));
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback((event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;
        if (data.length > 0) {
          if (type === 'running') {
            const parsedData = data.map(row => ({
              date: row['日期'] || row['date'] || '',
              distance: parseFloat(row['距离'] || row['distance'] || 0),
              time: parseFloat(row['时间'] || row['time'] || 0),
              pace: parseFloat(row['配速'] || row['pace'] || 0),
              heartRate: parseInt(row['心率'] || row['heartRate'] || 0),
              type: row['类型'] || row['type'] || '未知',
            })).filter(d => d.date);
            setRunningData(parsedData);
          } else {
            const parsedData = data.map(row => ({
              date: row['日期'] || row['date'] || '',
              exercise: row['动作'] || row['exercise'] || '',
              weight: parseFloat(row['重量'] || row['weight'] || 0),
              sets: parseInt(row['组数'] || row['sets'] || 0),
              reps: parseInt(row['次数'] || row['reps'] || 0),
              volume: parseFloat(row['容量'] || row['volume'] || 0),
              bodyPart: row['部位'] || row['bodyPart'] || '全身',
            })).filter(d => d.date);
            setStrengthData(parsedData);
          }
        }
        setShowImportModal(false);
      },
      header: true,
      skipEmptyLines: true,
    });
  }, []);

  // 跑步数据分析
  const runningAnalysis = useCallback(() => {
    if (!runningData.length) return null;

    const totalDistance = runningData.reduce((sum, d) => sum + d.distance, 0);
    const totalTime = runningData.reduce((sum, d) => sum + d.time, 0);
    const avgPace = totalTime / totalDistance;
    const avgHeartRate = runningData.filter(d => d.heartRate > 0).reduce((sum, d) => sum + d.heartRate, 0) / 
                        runningData.filter(d => d.heartRate > 0).length;
    const avgCadence = runningData.filter(d => d.cadence > 0).reduce((sum, d) => sum + d.cadence, 0) / 
                      runningData.filter(d => d.cadence > 0).length;

    // 按周统计跑量
    const weeklyData = {};
    runningData.forEach(d => {
      const week = d.date.substring(0, 7); // YYYY-MM
      if (!weeklyData[week]) {
        weeklyData[week] = { week, distance: 0, runs: 0 };
      }
      weeklyData[week].distance += d.distance;
      weeklyData[week].runs += 1;
    });

    // 配速趋势（按月）
    const monthlyPace = {};
    runningData.forEach(d => {
      const month = d.date.substring(0, 7);
      if (!monthlyPace[month]) {
        monthlyPace[month] = { month, pace: 0, count: 0 };
      }
      monthlyPace[month].pace += d.pace;
      monthlyPace[month].count += 1;
    });
    const paceTrend = Object.values(monthlyPace).map(m => ({
      month: m.month,
      pace: m.pace / m.count,
    }));

    return {
      totalDistance,
      totalTime,
      avgPace,
      avgHeartRate,
      avgCadence,
      weeklyData: Object.values(weeklyData),
      paceTrend,
      totalRuns: runningData.length,
    };
  }, [runningData]);

  // 健身数据分析
  const strengthAnalysis = useCallback(() => {
    if (!strengthData.length) return null;

    const totalVolume = strengthData.reduce((sum, d) => sum + d.volume, 0);
    const totalSessions = new Set(strengthData.map(d => d.date)).size;

    // 按部位统计
    const bodyPartData = {};
    strengthData.forEach(d => {
      if (!bodyPartData[d.bodyPart]) {
        bodyPartData[d.bodyPart] = { name: d.bodyPart, value: 0 };
      }
      bodyPartData[d.bodyPart].value += d.volume;
    });

    // 按动作统计趋势
    const exerciseTrends = {};
    strengthData.forEach(d => {
      if (!exerciseTrends[d.exercise]) {
        exerciseTrends[d.exercise] = [];
      }
      exerciseTrends[d.exercise].push({
        date: d.date,
        weight: d.weight,
        volume: d.volume,
      });
    });

    return {
      totalVolume,
      totalSessions,
      bodyPartData: Object.values(bodyPartData),
      exerciseTrends,
    };
  }, [strengthData]);

  const runningStats = runningAnalysis();
  const strengthStats = strengthAnalysis();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-serif font-bold text-slate-900">运动数据分析</h1>
            </div>
            <button
              onClick={() => {
                setImportType(activeTab);
                setShowImportModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              导入数据
            </button>
          </div>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('running')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'running'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
             跑步数据
          </button>
          <button
            onClick={() => setActiveTab('strength')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'strength'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ️ 健身数据
          </button>
          <button
            onClick={() => setActiveTab('body')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'body'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ️ 体脂数据
          </button>
        </div>
      </div>

      {/* 跑步数据分析 */}
      {activeTab === 'running' && runningStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">总距离</div>
              <div className="text-2xl font-bold text-blue-600">{runningStats.totalDistance.toFixed(1)} km</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">总次数</div>
              <div className="text-2xl font-bold text-green-600">{runningStats.totalRuns} 次</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">平均配速</div>
              <div className="text-2xl font-bold text-purple-600">{runningStats.avgPace.toFixed(2)}</div>
              <div className="text-xs text-slate-400">min/km</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">平均心率</div>
              <div className="text-2xl font-bold text-red-600">{Math.round(runningStats.avgHeartRate || 0)}</div>
              <div className="text-xs text-slate-400">bpm</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">平均步频</div>
              <div className="text-2xl font-bold text-orange-600">{Math.round(runningStats.avgCadence || 0)}</div>
              <div className="text-xs text-slate-400">步/分</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">总时长</div>
              <div className="text-2xl font-bold text-indigo-600">{(runningStats.totalTime / 60).toFixed(1)}</div>
              <div className="text-xs text-slate-400">小时</div>
            </div>
          </div>

          {/* 跑量趋势图 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">月跑量趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={runningStats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="distance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 配速趋势图 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">配速变化趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={runningStats.paceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: 'min/km', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pace" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 训练类型分布 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">训练类型分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={runningData.reduce((acc, curr) => {
                    const existing = acc.find(a => a.name === curr.type);
                    if (existing) {
                      existing.value += 1;
                    } else {
                      acc.push({ name: curr.type, value: 1 });
                    }
                    return acc;
                  }, [])}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {runningData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 健身数据分析 */}
      {activeTab === 'strength' && strengthStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">总训练容量</div>
              <div className="text-3xl font-bold text-slate-900">{(strengthStats.totalVolume / 1000).toFixed(1)} 吨</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">训练次数</div>
              <div className="text-3xl font-bold text-slate-900">{strengthStats.totalSessions} 次</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">平均单次容量</div>
              <div className="text-3xl font-bold text-slate-900">{Math.round(strengthStats.totalVolume / strengthStats.totalSessions)} kg</div>
            </div>
          </div>

          {/* 部位训练分布 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">部位训练容量分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strengthStats.bodyPartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 力量进步趋势 */}
          {Object.entries(strengthStats.exerciseTrends).map(([exercise, data]) => (
            <div key={exercise} className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">{exercise} - 力量进步趋势</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* 体脂数据分析 */}
      {activeTab === 'body' && bodyCompositionData.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">当前体重</div>
              <div className="text-2xl font-bold text-blue-600">
                {bodyCompositionData[bodyCompositionData.length - 1]?.weight.toFixed(1)} kg
              </div>
              <div className="text-xs text-slate-400 mt-1">
                变化: {(bodyCompositionData[bodyCompositionData.length - 1]?.weight - bodyCompositionData[0]?.weight).toFixed(1)} kg
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">当前体脂率</div>
              <div className="text-2xl font-bold text-orange-600">
                {bodyCompositionData[bodyCompositionData.length - 1]?.bodyFatRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                变化: {(bodyCompositionData[bodyCompositionData.length - 1]?.bodyFatRate - bodyCompositionData[0]?.bodyFatRate).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">骨骼肌</div>
              <div className="text-2xl font-bold text-green-600">
                {bodyCompositionData[bodyCompositionData.length - 1]?.skeletalMuscle.toFixed(1)} kg
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">BMI</div>
              <div className="text-2xl font-bold text-purple-600">
                {bodyCompositionData[bodyCompositionData.length - 1]?.bmi.toFixed(1)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">基础代谢</div>
              <div className="text-2xl font-bold text-red-600">
                {bodyCompositionData[bodyCompositionData.length - 1]?.bmr.toFixed(0)} kcal
              </div>
            </div>
          </div>

          {/* 体重和体脂率趋势 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">体重 & 体脂率趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyCompositionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" label={{ value: '%', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" name="体重" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="bodyFatRate" name="体脂率" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 肌肉量和脂肪量趋势 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">肌肉量 & 脂肪量趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyCompositionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="skeletalMuscle" name="骨骼肌" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="fatMass" name="脂肪量" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BMI和基础代谢趋势 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">BMI & 基础代谢趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyCompositionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" label={{ value: 'BMI', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" label={{ value: 'kcal', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="bmi" name="BMI" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="bmr" name="基础代谢" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 身体成分历史表格 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">测量历史</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-600">日期</th>
                    <th className="text-right py-3 px-4 text-slate-600">体重</th>
                    <th className="text-right py-3 px-4 text-slate-600">体脂率</th>
                    <th className="text-right py-3 px-4 text-slate-600">脂肪量</th>
                    <th className="text-right py-3 px-4 text-slate-600">骨骼肌</th>
                    <th className="text-right py-3 px-4 text-slate-600">BMI</th>
                    <th className="text-right py-3 px-4 text-slate-600">体型</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyCompositionData.map((data, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{data.date}</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.weight.toFixed(1)} kg</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.bodyFatRate.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.fatMass.toFixed(1)} kg</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.skeletalMuscle.toFixed(1)} kg</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.bmi.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-slate-900">{data.bodyType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 导入数据弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">导入{importType === 'running' ? '跑步' : '健身'}数据</h3>
            <p className="text-slate-600 mb-6">请上传 CSV 文件，确保包含以下字段：</p>
            
            {importType === 'running' ? (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm text-slate-700">
                <p className="font-semibold mb-2">必需字段：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>日期 (date)</li>
                  <li>距离 (distance) - 公里</li>
                  <li>时间 (time) - 分钟</li>
                  <li>配速 (pace) - 分钟/公里</li>
                  <li>心率 (heartRate) - bpm</li>
                  <li>类型 (type) - 如：轻松跑、节奏跑等</li>
                </ul>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm text-slate-700">
                <p className="font-semibold mb-2">必需字段：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>日期 (date)</li>
                  <li>动作名称 (exercise)</li>
                  <li>重量 (weight) - kg</li>
                  <li>组数 (sets)</li>
                  <li>次数 (reps)</li>
                  <li>容量 (volume) = 重量 × 组数 × 次数</li>
                  <li>部位 (bodyPart)</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <label className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-center cursor-pointer hover:bg-blue-700 transition-all">
                选择文件
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, importType)}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
