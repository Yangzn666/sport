import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SmartAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  const [runningData, setRunningData] = useState([]);
  const [strengthData, setStrengthData] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // 加载数据
  useEffect(() => {
    Promise.all([
      fetch('/data/your_data/your_running_data.csv').then(r => r.text()),
      fetch('/data/your_data/your_strength_data.csv').then(r => r.text()),
      fetch('/data/your_data/your_body_composition_data.csv').then(r => r.text())
    ]).then(([runningCsv, strengthCsv, bodyCsv]) => {
      // 解析CSV数据（简化版）
      const parseCSV = (csv) => {
        const lines = csv.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
          return obj;
        });
      };

      setRunningData(parseCSV(runningCsv));
      setStrengthData(parseCSV(strengthCsv));
      setBodyData(parseCSV(bodyCsv));
      
      // 生成分析
      generateAnalysis(parseCSV(runningCsv), parseCSV(strengthCsv), parseCSV(bodyCsv));
    });
  }, []);

  const generateAnalysis = (running, strength, body) => {
    // 跑步分析
    const runningStats = {
      totalRuns: running.length,
      totalDistance: running.reduce((sum, r) => sum + (parseFloat(r['距离']) || 0), 0),
      avgPace: running.reduce((sum, r) => sum + (parseFloat(r['配速']) || 0), 0) / running.length,
      bestHalfMarathon: running
        .filter(r => parseFloat(r['距离']) >= 21)
        .sort((a, b) => parseFloat(a['时间']) - parseFloat(b['时间']))[0]
    };

    // 力量训练分析
    const strengthStats = {
      totalSessions: new Set(strength.map(s => s['日期'])).size,
      totalSets: strength.length,
      totalVolume: strength.reduce((sum, s) => sum + (parseFloat(s['容量']) || 0), 0),
      topExercises: {}
    };

    strength.forEach(s => {
      const exercise = s['动作'];
      if (!strengthStats.topExercises[exercise]) {
        strengthStats.topExercises[exercise] = { sets: 0, volume: 0 };
      }
      strengthStats.topExercises[exercise].sets++;
      strengthStats.topExercises[exercise].volume += parseFloat(s['容量']) || 0;
    });

    // 体成分分析
    const latestBody = body[body.length - 1];
    const firstBody = body[0];
    const bodyChanges = {
      weightChange: parseFloat(latestBody['体重']) - parseFloat(firstBody['体重']),
      fatChange: parseFloat(latestBody['体脂率']) - parseFloat(firstBody['体脂率']),
      muscleChange: parseFloat(latestBody['骨骼肌']) - parseFloat(firstBody['骨骼肌'])
    };

    setAnalysis({
      running: runningStats,
      strength: strengthStats,
      body: bodyChanges,
      latestBody: latestBody
    });
  };

  const tabs = [
    { id: 'overview', label: '总览', icon: '📊' },
    { id: 'running', label: '跑步分析', icon: '🏃' },
    { id: 'strength', label: '力量分析', icon: '💪' },
    { id: 'body', label: '体成分', icon: '️' },
    { id: 'recommendations', label: '建议', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-slate-500 hover:text-slate-700 text-sm mb-2 inline-block">
                ← 返回首页
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">智能分析报告</h1>
              <p className="text-slate-600 mt-1">基于您的训练数据生成的深度分析</p>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                📅 最后更新: 2026-05-31
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysis ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">正在加载数据并生成分析...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Running Summary */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🏃</span>
                      <h3 className="text-lg font-semibold text-slate-900">跑步概览</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-500">总跑步次数</div>
                        <div className="text-2xl font-bold text-blue-600">{analysis.running.totalRuns} 次</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">总距离</div>
                        <div className="text-2xl font-bold text-blue-600">{analysis.running.totalDistance.toFixed(1)} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">平均配速</div>
                        <div className="text-2xl font-bold text-blue-600">{analysis.running.avgPace.toFixed(2)} min/km</div>
                      </div>
                    </div>
                  </div>

                  {/* Strength Summary */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">💪</span>
                      <h3 className="text-lg font-semibold text-slate-900">力量训练概览</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-500">训练次数</div>
                        <div className="text-2xl font-bold text-purple-600">{analysis.strength.totalSessions} 次</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">总组数</div>
                        <div className="text-2xl font-bold text-purple-600">{analysis.strength.totalSets} 组</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">总容量</div>
                        <div className="text-2xl font-bold text-purple-600">{(analysis.strength.totalVolume / 1000).toFixed(1)} 吨</div>
                      </div>
                    </div>
                  </div>

                  {/* Body Composition Summary */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">️</span>
                      <h3 className="text-lg font-semibold text-slate-900">体成分变化</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-500">体重变化</div>
                        <div className={`text-2xl font-bold ${analysis.body.weightChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysis.body.weightChange > 0 ? '+' : ''}{analysis.body.weightChange.toFixed(1)} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">体脂率变化</div>
                        <div className={`text-2xl font-bold ${analysis.body.fatChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {analysis.body.fatChange > 0 ? '+' : ''}{analysis.body.fatChange.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">骨骼肌变化</div>
                        <div className={`text-2xl font-bold ${analysis.body.muscleChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysis.body.muscleChange > 0 ? '+' : ''}{analysis.body.muscleChange.toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 关键洞察</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-slate-700">
                        您在过去{Math.floor(analysis.strength.totalSessions / 52)}年中完成了{analysis.running.totalRuns}次跑步和{analysis.strength.totalSessions}次力量训练，展现了出色的坚持力
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-slate-700">
                        体成分改善显著：体重增加{analysis.body.weightChange.toFixed(1)}kg的同时，骨骼肌增长{analysis.body.muscleChange.toFixed(1)}kg
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">!</span>
                      <span className="text-slate-700">
                        建议关注核心训练（当前仅5组），每周至少增加3次10-15分钟的核心练习
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Running Analysis Tab */}
            {activeTab === 'running' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">🏃 跑步表现分析</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">最佳半马成绩</h4>
                      {analysis.running.bestHalfMarathon ? (
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {parseFloat(analysis.running.bestHalfMarathon['时间']).toFixed(1)} 分钟
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            日期: {analysis.running.bestHalfMarathon['日期']} | 
                            配速: {analysis.running.bestHalfMarathon['配速']} min/km
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500">暂无半马记录</div>
                      )}
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">训练类型分布</h4>
                      <div className="text-sm text-slate-600">
                        <p>• 轻松跑: 约60%</p>
                        <p>• 节奏跑: 约20%</p>
                        <p>• 恢复跑: 约10%</p>
                        <p>• 间歇跑: 约4%</p>
                        <p>• 长距离: 约4%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">💡 改进建议</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• 当前处于跑步休息期，建议按12周计划逐步恢复</li>
                      <li>• 第1-2周：每周2-3次轻松跑3-5km，配速6:00-6:30</li>
                      <li>• 第3-4周：增加至每周3-4次，加入节奏跑和长距离</li>
                      <li>• 目标：半马成绩突破1:40（基于之前1:44的基础）</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Strength Analysis Tab */}
            {activeTab === 'strength' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">💪 力量训练分析</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-900 mb-3">部位训练分布</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(analysis.strength.topExercises)
                        .sort((a, b) => b[1].sets - a[1].sets)
                        .slice(0, 6)
                        .map(([exercise, stats]) => (
                          <div key={exercise} className="bg-slate-50 rounded-lg p-3">
                            <div className="text-sm text-slate-600 mb-1">{exercise}</div>
                            <div className="text-lg font-bold text-purple-600">{stats.sets} 组</div>
                            <div className="text-xs text-slate-500">{(stats.volume / 1000).toFixed(1)} 吨</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">✅ 优势</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• 背部训练量最大（626组，占39%），符合"拉类优先"原则</li>
                      <li>• 推类动作均衡（胸部432组 + 肩部195组）</li>
                      <li>• 渐进超负荷执行良好（高位下拉80kg、倒蹬100kg）</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">⚠️ 待改进</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• 核心训练严重不足（仅5组，占0.3%）→ 急需加强！</li>
                      <li>• 腿部训练量偏低（224组，占14%）→ 建议增至6-8组/周</li>
                      <li>• 训练频率波动较大 → 建议固定每周3-4次</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Body Composition Tab */}
            {activeTab === 'body' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">⚖️ 体成分深度分析</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3">最新数据 ({analysis.latestBody['日期']})</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">体重:</span>
                          <span className="font-bold">{analysis.latestBody['体重']} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">体脂率:</span>
                          <span className="font-bold">{analysis.latestBody['体脂率']}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">骨骼肌:</span>
                          <span className="font-bold">{analysis.latestBody['骨骼肌']} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">基础代谢:</span>
                          <span className="font-bold">{analysis.latestBody['基础代谢']} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3">变化趋势</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">体重:</span>
                          <span className={`font-bold ${analysis.body.weightChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.body.weightChange > 0 ? '+' : ''}{analysis.body.weightChange.toFixed(1)} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">体脂率:</span>
                          <span className={`font-bold ${analysis.body.fatChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.body.fatChange > 0 ? '+' : ''}{analysis.body.fatChange.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">骨骼肌:</span>
                          <span className={`font-bold ${analysis.body.muscleChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.body.muscleChange > 0 ? '+' : ''}{analysis.body.muscleChange.toFixed(1)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">🎯 评估与建议</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• 最近5个月实现突破：同时增肌减脂（肌肉+0.9kg，体脂-1.7%）</li>
                      <li>• 当前体脂率13.4%处于理想区间，目标降至12%</li>
                      <li>• 建议每日蛋白质摄入140g（1.85g/kg体重）</li>
                      <li>• 保持现有力量训练强度，增加每周2次低强度有氧</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">💡 综合训练建议</h3>
                  
                  <div className="space-y-6">
                    {/* Training Plan */}
                    <div className="bg-blue-50 rounded-lg p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">📅 推荐训练方案（考研期间优化版）</h4>
                      <div className="text-sm text-slate-700 space-y-2">
                        <p><strong>方案：</strong>全身训练（每周3次，每次50分钟）</p>
                        <p><strong>周一：</strong>坐姿推胸机 4×12-15 + 哑铃推肩 4×12-15 + 核心</p>
                        <p><strong>周三：</strong>高位下拉 4×12-15 + 倒蹬 4×12-15 + 核心</p>
                        <p><strong>周五：</strong>坐姿划船 4×12-15 + 哑铃侧平举 3×12-15 + 核心</p>
                        <p><strong>关键：</strong>重量70% 1RM，休息60-90秒，专注代谢压力</p>
                      </div>
                    </div>

                    {/* Nutrition */}
                    <div className="bg-green-50 rounded-lg p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">️ 营养建议</h4>
                      <div className="text-sm text-slate-700 space-y-2">
                        <p>• <strong>每日热量：</strong>2,500-2,600 kcal（维持期）</p>
                        <p>• <strong>蛋白质：</strong>140g/天（鸡胸肉、牛肉、鱼、鸡蛋）</p>
                        <p>• <strong>碳水：</strong>330g/天（燕麦、糙米、红薯）</p>
                        <p>• <strong>脂肪：</strong>70g/天（坚果、橄榄油、深海鱼）</p>
                        <p>• <strong>训练后：</strong>30分钟内补充乳清蛋白30g + 快速碳水</p>
                      </div>
                    </div>

                    {/* Recovery */}
                    <div className="bg-purple-50 rounded-lg p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">😴 恢复与压力管理</h4>
                      <div className="text-sm text-slate-700 space-y-2">
                        <p>• <strong>睡眠：</strong>每晚7-7.5小时（最低6.5小时）</p>
                        <p>• <strong>主动恢复：</strong>每周2次散步或拉伸30分钟</p>
                        <p>• <strong>泡沫轴：</strong>训练后放松股四头肌、腘绳肌、臀部</p>
                        <p>• <strong>压力管理：</strong>深呼吸练习、正念冥想每天10分钟</p>
                        <p>• <strong>警惕信号：</strong>静息心率升高、睡眠质量下降 → 立即减量</p>
                      </div>
                    </div>

                    {/* Exam Period */}
                    <div className="bg-yellow-50 rounded-lg p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">📚 考研期间特殊安排</h4>
                      <div className="text-sm text-slate-700 space-y-2">
                        <p>• <strong>现在-9月：</strong>每周3次训练，每次50分钟（建立耐力基础）</p>
                        <p>• <strong>10-11月：</strong>每周2次，每次40分钟（保持习惯）</p>
                        <p>• <strong>12月考前2周：</strong>每周1-2次，每次30分钟，重量降至50% 1RM</p>
                        <p>• <strong>考后1周：</strong>主动恢复，无力量训练</p>
                        <p>• <strong>跑步：</strong>暂停至考研结束，改为每周2次低强度有氧</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
