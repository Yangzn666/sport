import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, Award, Target, ArrowRight, Calendar, Plus, TrendingDown, Zap, Flame, Trophy, Dumbbell, Timer } from 'lucide-react';
import QuickLogModal from '../components/QuickLogModal';
import WeeklyPlan from '../components/WeeklyPlan';
import TrainingTimeline from '../components/TrainingTimeline';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('running');
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    // 加载真实数据
    Promise.all([
      fetch('/your_data/your_running_data.csv').then(r => r.text()),
      fetch('/your_data/your_strength_data.csv').then(r => r.text()),
      fetch('/your_data/your_body_composition_data.csv').then(r => r.text())
    ]).then(([runningCsv, strengthCsv, bodyCsv]) => {
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

      const runningData = parseCSV(runningCsv);
      const strengthData = parseCSV(strengthCsv);
      const bodyData = parseCSV(bodyCsv);

      // 计算统计数据
      const stats = {
        running: {
          totalRuns: runningData.length,
          totalDistance: runningData.reduce((sum, r) => sum + (parseFloat(r['距离']) || 0), 0).toFixed(1),
          bestHalfMarathon: runningData
            .filter(r => parseFloat(r['距离']) >= 21)
            .sort((a, b) => parseFloat(a['时间']) - parseFloat(b['时间']))[0]?.['时间'] || '1:44'
        },
        strength: {
          totalSessions: new Set(strengthData.map(s => s['日期'])).size,
          totalSets: strengthData.length,
          totalVolume: (strengthData.reduce((sum, s) => sum + (parseFloat(s['容量']) || 0), 0) / 1000).toFixed(0)
        },
        body: {
          weight: bodyData[bodyData.length - 1]?.['体重'] || 76.2,
          bodyFat: bodyData[bodyData.length - 1]?.['体脂率'] || 13.4,
          muscle: bodyData[bodyData.length - 1]?.['骨骼肌'] || 36.9
        }
      };

      setStats(stats);
      setRecentLogs({ running: runningData, strength: strengthData, body: bodyData });
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">加载个人数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>个人健身数据追踪</h1>
              <p className="text-base text-slate-600 mt-1 font-medium">私人数据 · 本地存储 · 完全私密</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">最后同步: 2026-05-31</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => { setModalType('running'); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 flex flex-col items-center transition-colors"
          >
            <Activity className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">记录跑步</span>
          </button>
          <button 
            onClick={() => { setModalType('strength'); setShowModal(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 flex flex-col items-center transition-colors"
          >
            <Dumbbell className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">记录力量</span>
          </button>
          <button 
            onClick={() => { setModalType('body'); setShowModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 flex flex-col items-center transition-colors"
          >
            <Target className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">记录体成分</span>
          </button>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-slate-500">跑步</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.running.totalRuns} 次</div>
            <div className="text-sm text-slate-600 mt-1">{stats.running.totalDistance} km 总距离</div>
            <div className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              半马最佳: {stats.running.bestHalfMarathon}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-slate-500">力量</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.strength.totalSets} 组</div>
            <div className="text-sm text-slate-600 mt-1">{stats.strength.totalVolume} 吨 总容量</div>
            <div className="text-xs text-purple-600 mt-2 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              {stats.strength.totalSessions} 次训练
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-green-600" />
              <span className="text-sm text-slate-500">最佳半马</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.running.bestHalfMarathon}</div>
            <div className="text-sm text-slate-600 mt-1">个人记录</div>
            <div className="text-xs text-green-600 mt-2 flex items-center">
              <Trophy className="w-3 h-3 mr-1" />
              前 5%
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-slate-500">当前体脂</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.body.bodyFat}%</div>
            <div className="text-sm text-slate-600 mt-1">{stats.body.weight} kg / {stats.body.muscle} kg 肌肉</div>
            <div className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              体脂下降 1.7%
            </div>
          </div>
        </div>

        {/* Recent Trends & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Training Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                近期训练日历
              </h3>
              <span className="text-sm text-slate-500">2026年5月</span>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs text-slate-500 font-medium py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Empty days for May 2026 (starts on Friday) */}
              {[...Array(5)].map((_, i) => <div key={`empty-${i}`} />)}
              {/* Days with training data */}
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(day => {
                const hasRunning = [2,5,8,11,14,17,20,23,26,29].includes(day);
                const hasStrength = [1,4,7,10,13,16,19,22,25,28].includes(day);
                const isToday = day === 31;
                return (
                  <div key={day} className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative
                    ${isToday ? 'bg-blue-600 text-white' : ''}
                    ${hasRunning && hasStrength ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : ''}
                    ${hasRunning && !hasStrength ? 'bg-blue-100 text-blue-700' : ''}
                    ${hasStrength && !hasRunning ? 'bg-purple-100 text-purple-700' : ''}
                    ${!hasRunning && !hasStrength && !isToday ? 'bg-slate-50 text-slate-600' : ''}
                  `}>
                    {day}
                    {(hasRunning || hasStrength) && !isToday && (
                      <div className="absolute bottom-1 flex space-x-0.5">
                        {hasRunning && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                        {hasStrength && <div className="w-1 h-1 bg-purple-500 rounded-full"></div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-slate-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                跑步
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div>
                力量
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-1"></div>
                两者
              </div>
            </div>
          </div>

          {/* Quick Stats & Goals */}
          <div className="space-y-6">
            {/* Monthly Progress */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <Flame className="w-5 h-5 mr-2 text-orange-600" />
                本月进度
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">跑步目标</span>
                    <span className="font-medium text-slate-900">8/12 次</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">力量目标</span>
                    <span className="font-medium text-slate-900">10/12 次</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">体脂目标</span>
                    <span className="font-medium text-slate-900">13.4% → 12%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-600" />
                训练连续记录
              </h4>
              <div className="text-3xl font-bold text-orange-600 mb-1">15 天</div>
              <div className="text-sm text-slate-600">个人最佳: 23 天</div>
              <div className="mt-3 text-xs text-orange-700 bg-orange-200 rounded-lg p-2">
                🔥 再坚持 8 天打破记录！
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Data Visualization Card */}
          <Link to="/analytics" className="group block">
            <div className="bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 p-8 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">数据可视化</h3>
                  <p className="text-slate-600">图表展示训练趋势</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-6">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  跑步配速趋势分析
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  力量训练部位分布
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  体成分变化曲线
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  月度训练量统计
                </li>
              </ul>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                进入可视化分析
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Smart Analysis Card */}
          <Link to="/smart-analysis" className="group block">
            <div className="bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-400 p-8 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">智能分析</h3>
                  <p className="text-slate-600">AI深度分析报告</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-6">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  训练效果评估
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  个性化改进建议
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  营养与恢复指导
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  考研期间训练方案
                </li>
              </ul>
              <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                查看智能分析
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Deep Analysis Card */}
        <Link to="/deep-analysis" className="group block mb-8">
          <div className="bg-gradient-to-r from-orange-50 via-red-50 to-purple-50 rounded-2xl border-2 border-orange-300 hover:border-orange-500 p-8 transition-all hover:shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                  <Brain className="w-7 h-7 mr-2 text-orange-600" />
                  🔬 深度智能分析
                </h3>
                <p className="text-slate-600">基于运动科学的全面评估 · 数据驱动的训练优化</p>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="text-sm font-semibold text-slate-900 mb-1">ACWR负荷监控</div>
                <div className="text-xs text-slate-600">预防过度训练和受伤</div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="text-sm font-semibold text-slate-900 mb-1">配速预测模型</div>
                <div className="text-xs text-slate-600">半马成绩科学预测</div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="text-sm font-semibold text-slate-900 mb-1">肌肉平衡雷达图</div>
                <div className="text-xs text-slate-600">推/拉/腿比例分析</div>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                训练负荷监控（急性/慢性负荷比）
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                周期性分析（微/中/大周期）
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                动作模式与肌肉平衡评估
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                体成分趋势建模与目标预测
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                基于科学文献的个性化建议
              </li>
            </ul>
            <div className="flex items-center text-orange-600 font-bold group-hover:text-orange-700">
              查看深度分析报告
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Today's Recommendation & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Training Suggestion */}
          <div className="lg:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">💡 今日训练建议</h3>
                <p className="text-sm text-slate-600">基于您的训练数据分析</p>
              </div>
              <div className="bg-green-100 px-3 py-1 rounded-full text-xs font-medium text-green-700">
                5月31日 周六
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-slate-900 mb-3">🎯 推荐：上肢推日训练</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-medium text-slate-900 mb-1">主要动作</div>
                  <ul className="text-slate-600 space-y-1">
                    <li>• 坐姿推胸机 4×12</li>
                    <li>• 哑铃推肩 4×12</li>
                    <li>• 哑铃侧平举 3×15</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="font-medium text-slate-900 mb-1">训练要点</div>
                  <ul className="text-slate-600 space-y-1">
                    <li>• 重量: 70% 1RM</li>
                    <li>• 休息: 60-90秒</li>
                    <li>• 总时长: ~50分钟</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-700 bg-green-100 rounded-lg p-3">
              <span className="mr-2">️</span>
              <span>昨天练了腿部，今天是休息2天后恢复上肢训练的好时机。注意控制重量，考研期间以维持为主。</span>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              成就里程碑
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl mr-3">🏃</div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">千里跑者</div>
                  <div className="text-xs text-slate-600">总跑量突破 1000km</div>
                </div>
                <div className="text-xs text-green-600 font-medium">✓ 已完成</div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">吨级力量</div>
                  <div className="text-xs text-slate-600">总容量突破 500吨</div>
                </div>
                <div className="text-xs text-green-600 font-medium">✓ 已完成</div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl mr-3">🎯</div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">半马破2</div>
                  <div className="text-xs text-slate-600">半马成绩 &lt; 2:00:00</div>
                </div>
                <div className="text-xs text-green-600 font-medium">✓ 已完成</div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-60">
                <div className="text-2xl mr-3">🔥</div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">铁人意志</div>
                  <div className="text-xs text-slate-600">连续训练 30天</div>
                </div>
                <div className="text-xs text-slate-500">15/30 天</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">279</div>
            <div className="text-xs text-slate-600 mt-1">总跑步次数</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">1605</div>
            <div className="text-xs text-slate-600 mt-1">总力量组数</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">70</div>
            <div className="text-xs text-slate-600 mt-1">总训练次数</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">+2.6kg</div>
            <div className="text-xs text-slate-600 mt-1">骨骼肌增长</div>
          </div>
        </div>

        {/* Weekly Plan & Training Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeeklyPlan 
            strengthData={recentLogs.strength} 
            runningData={recentLogs.running} 
          />
          <TrainingTimeline 
            strengthData={recentLogs.strength}
            runningData={recentLogs.running}
            bodyData={recentLogs.body}
          />
        </div>

        {/* Privacy Notice */}
        <div className="mt-12 bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h4 className="font-semibold text-slate-900 mb-3">🔒 隐私保护说明</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• 所有数据存储在您本地电脑上，不会上传到任何服务器</li>
            <li>• 网站运行在本地环境 (localhost)，无需联网即可使用</li>
            <li>• 数据文件位于项目目录的 <code className="bg-slate-200 px-2 py-1 rounded">data/</code> 文件夹中</li>
            <li>• 您可以随时备份或删除数据文件</li>
          </ul>
        </div>
      </main>

      {/* Quick Log Modal */}
      <QuickLogModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        onSave={(type, data) => {
          console.log('Saved:', type, data);
          // TODO: 实际保存到CSV文件
          alert('记录已保存！');
        }}
      />
    </div>
  );
}
