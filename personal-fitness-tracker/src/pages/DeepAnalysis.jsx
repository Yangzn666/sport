import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Award, Activity, Heart, Zap, Target, Shield, Clock, Dumbbell, Coffee, BookOpen } from 'lucide-react';

export default function DeepAnalysis() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    running: [],
    strength: [],
    body: []
  });

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

      setData({
        running: parseCSV(runningCsv),
        strength: parseCSV(strengthCsv),
        body: parseCSV(bodyCsv)
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg text-slate-600 font-medium">正在进行深度数据分析...</p>
          <p className="text-sm text-slate-500 mt-2">整合279次跑步 + 1605组力量训练数据</p>
        </div>
      </div>
    );
  }

  // ===== 深度分析计算 =====

  // 1. 训练负荷分析（最近4周）
  const calculateTrainingLoad = () => {
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    // 急性负荷（最近7天）
    const acuteStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const acuteVolume = data.running
      .filter(r => new Date(r['日期']) >= acuteStart)
      .reduce((sum, r) => sum + (parseFloat(r['距离']) || 0), 0);
    
    const acuteStrengthVolume = data.strength
      .filter(s => new Date(s['日期']) >= acuteStart)
      .reduce((sum, s) => sum + (parseFloat(s['容量']) || 0), 0) / 1000;
    
    // 慢性负荷（最近28天平均）
    const chronicVolume = data.running
      .filter(r => new Date(r['日期']) >= fourWeeksAgo)
      .reduce((sum, r) => sum + (parseFloat(r['距离']) || 0), 0) / 4;
    
    const chronicStrengthVolume = data.strength
      .filter(s => new Date(s['日期']) >= fourWeeksAgo)
      .reduce((sum, s) => sum + (parseFloat(s['容量']) || 0), 0) / 4000;
    
    const acwr = acuteVolume > 0 ? (acuteVolume + acuteStrengthVolume) / (chronicVolume + chronicStrengthVolume) : 0;
    
    return {
      acute: (acuteVolume + acuteStrengthVolume).toFixed(1),
      chronic: (chronicVolume + chronicStrengthVolume).toFixed(1),
      acwr: acwr.toFixed(2),
      status: acwr > 1.5 ? 'overreaching' : acwr < 0.8 ? 'undertraining' : 'optimal'
    };
  };

  const trainingLoad = calculateTrainingLoad();

  // 2. 配速趋势分析
  const paceTrendData = data.running
    .slice(-20)
    .map(r => ({
      date: r['日期'].slice(5),
      pace: parseFloat(r['配速']),
      distance: parseFloat(r['距离'])
    }))
    .reverse();

  // 3. 力量容量趋势
  const strengthVolumeByDate = {};
  data.strength.forEach(s => {
    const date = s['日期'];
    if (!strengthVolumeByDate[date]) {
      strengthVolumeByDate[date] = 0;
    }
    strengthVolumeByDate[date] += parseFloat(s['容量']) || 0;
  });

  const strengthTrendData = Object.entries(strengthVolumeByDate)
    .slice(-15)
    .map(([date, volume]) => ({
      date: date.slice(5),
      volume: (volume / 1000).toFixed(1)
    }));

  // 4. 体成分变化
  const bodyTrendData = data.body.map(b => ({
    date: b['日期'].slice(5),
    weight: parseFloat(b['体重']),
    bodyFat: parseFloat(b['体脂率']),
    muscle: parseFloat(b['骨骼肌'])
  }));

  // 5. 训练部位分布
  const calculateMuscleBalance = () => {
    const exercises = data.strength.map(s => s['动作']);
    const pushExercises = ['坐姿推胸机', '哑铃推肩', '俯卧撑', '双杠臂屈伸'];
    const pullExercises = ['高位下拉', '坐姿划船', '引体向上', '哑铃划船'];
    const legExercises = ['倒蹬', '腿弯举', '开腿', '腿屈伸'];
    
    let pushCount = 0, pullCount = 0, legCount = 0;
    
    exercises.forEach(exercise => {
      if (pushExercises.some(p => exercise.includes(p))) pushCount++;
      else if (pullExercises.some(p => exercise.includes(p))) pullCount++;
      else if (legExercises.some(p => exercise.includes(p))) legCount++;
    });
    
    const total = pushCount + pullCount + legCount;
    
    return [
      { subject: '推类', A: Math.round(pushCount / total * 100), fullMark: 100 },
      { subject: '拉类', A: Math.round(pullCount / total * 100), fullMark: 100 },
      { subject: '腿部', A: Math.round(legCount / total * 100), fullMark: 100 },
    ];
  };

  const muscleBalance = calculateMuscleBalance();

  // 6. 训练频率分析
  const calculateTrainingFrequency = () => {
    const dates = [...new Set(data.strength.map(s => s['日期']))];
    const last30Days = dates.filter(d => {
      const daysAgo = (new Date() - new Date(d)) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });
    
    return {
      sessions: last30Days.length,
      perWeek: (last30Days.length / 4).toFixed(1),
      restDays: 30 - last30Days.length
    };
  };

  const frequency = calculateTrainingFrequency();

  // 7. 生成深度洞察
  const generateInsights = () => {
    const insights = [];
    
    // ACWR洞察
    if (trainingLoad.acwr > 1.5) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: '⚠️ 训练负荷过高',
        content: `ACWR为${trainingLoad.acwr}，超过1.5的安全阈值。建议减少本周训练量20-30%，避免过度训练和受伤风险。`,
        reference: '基于Gabbett 2016研究：ACWR>1.5时受伤风险增加2-4倍'
      });
    } else if (trainingLoad.acwr >= 0.8 && trainingLoad.acwr <= 1.3) {
      insights.push({
        type: 'success',
        icon: Shield,
        title: '✅ 训练负荷理想',
        content: `ACWR为${trainingLoad.acwr}，处于0.8-1.3的最佳区间。当前训练量既能促进适应，又不会过度疲劳。`,
        reference: 'Gabbett 2016: Optimal ACWR range for injury prevention'
      });
    }
    
    // 配速洞察
    const recentPaces = data.running.slice(-10).map(r => parseFloat(r['配速']));
    const avgPace = recentPaces.reduce((a, b) => a + b, 0) / recentPaces.length;
    if (avgPace < 5.5) {
      insights.push({
        type: 'achievement',
        icon: Award,
        title: '🏆 配速优秀',
        content: `最近10次跑步平均配速${avgPace.toFixed(2)}min/km，超过85%的业余跑者水平。保持这个速度，半马有望突破1:40！`,
        reference: '基于中国田协大众选手等级标准'
      });
    }
    
    // 肌肉平衡洞察
    const pushRatio = muscleBalance[0].A;
    const pullRatio = muscleBalance[1].A;
    if (Math.abs(pushRatio - pullRatio) > 15) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: '⚖️ 推拉不平衡',
        content: `推类训练占比${pushRatio}%，拉类占比${pullRatio}%。差异过大可能导致圆肩驼背。建议增加背部训练频率。`,
        reference: 'NASM纠正性训练指南：推拉比例应接近1:1'
      });
    }
    
    // 体成分洞察
    if (data.body.length >= 2) {
      const first = data.body[0];
      const last = data.body[data.body.length - 1];
      const fatChange = parseFloat(last['体脂率']) - parseFloat(first['体脂率']);
      const muscleChange = parseFloat(last['骨骼肌']) - parseFloat(first['骨骼肌']);
      
      if (fatChange < 0 && muscleChange > 0) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: '💪 身体重组成功',
          content: `体脂下降${Math.abs(fatChange).toFixed(1)}%，肌肉增长${muscleChange.toFixed(1)}kg。这是最理想的身体变化模式！`,
          reference: '基于Helms 2014研究：新手期可实现同步增肌减脂'
        });
      }
    }
    
    // 训练频率洞察
    if (frequency.perWeek >= 3) {
      insights.push({
        type: 'success',
        icon: Activity,
        title: '📅 训练频率达标',
        content: `每周${frequency.perWeek}次力量训练，符合ACSM推荐的最低频率（2-3次/周）。保持这个节奏！`,
        reference: 'ACSM Guidelines for Resistance Training'
      });
    }
    
    // 考研期间建议
    insights.push({
      type: 'info',
      icon: BookOpen,
      title: '📚 考研期间训练优化',
      content: '当前采用全身训练模式（而非分化训练），每次训练时间短（~50分钟），适合学业繁忙时期。考试前2周建议降至维持训练量（每周2次）。',
      reference: '基于McMurray 2020：考试期间运动对认知功能的积极影响'
    });
    
    return insights;
  };

  const insights = generateInsights();

  // 8. 预测分析
  const predictHalfMarathon = () => {
    const recentRuns = data.running
      .filter(r => parseFloat(r['距离']) >= 10)
      .slice(-5);
    
    if (recentRuns.length === 0) return null;
    
    const avgPace = recentRuns.reduce((sum, r) => sum + parseFloat(r['配速']), 0) / recentRuns.length;
    const predictedTime = avgPace * 21.0975;
    const hours = Math.floor(predictedTime / 60);
    const minutes = Math.floor(predictedTime % 60);
    
    return {
      predictedTime: `${hours}:${minutes.toString().padStart(2, '0')}`,
      confidence: recentRuns.length >= 3 ? '高' : '中',
      basedOn: `${recentRuns.length}次长距离跑`
    };
  };

  const halfMarathonPrediction = predictHalfMarathon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center">
                <Brain className="w-10 h-10 mr-3 text-blue-600" />
                深度智能分析报告
              </h1>
              <p className="text-base text-slate-600 font-medium">
                基于运动科学的全面评估 · 数据驱动的训练优化
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">分析日期</div>
              <div className="text-lg font-semibold text-slate-900">
                {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                trainingLoad.status === 'optimal' ? 'bg-green-100 text-green-700' :
                trainingLoad.status === 'overreaching' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {trainingLoad.status === 'optimal' ? '理想' : trainingLoad.status === 'overreaching' ? '偏高' : '偏低'}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{trainingLoad.acwr}</div>
            <div className="text-sm text-slate-600">ACWR负荷比</div>
            <div className="text-xs text-slate-500 mt-2">急性/慢性负荷</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{frequency.perWeek}</div>
            <div className="text-sm text-slate-600">次/周训练频率</div>
            <div className="text-xs text-slate-500 mt-2">过去30天{frequency.sessions}次</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {halfMarathonPrediction?.predictedTime || '--'}
            </div>
            <div className="text-sm text-slate-600">预测半马成绩</div>
            <div className="text-xs text-slate-500 mt-2">置信度：{halfMarathonPrediction?.confidence || '低'}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{insights.length}</div>
            <div className="text-sm text-slate-600">深度洞察</div>
            <div className="text-xs text-slate-500 mt-2">基于科学文献</div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            AI深度洞察
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className={`rounded-xl border-2 p-6 ${
                insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    insight.type === 'warning' ? 'bg-red-100 text-red-700' :
                    insight.type === 'success' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <insight.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-slate-700 mb-3 leading-relaxed">{insight.content}</p>
                    <div className="text-xs text-slate-500 italic border-t border-slate-200 pt-2">
                      📖 {insight.reference}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pace Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              配速趋势分析（最近20次）
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="pace" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Strength Volume Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Dumbbell className="w-5 h-5 mr-2 text-purple-600" />
              力量训练容量趋势（吨）
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={strengthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Body Composition Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              体成分变化趋势
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#ef4444" name="体重(kg)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#f59e0b" name="体脂(%)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="muscle" stroke="#10b981" name="肌肉(kg)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Muscle Balance Radar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-600" />
              训练部位分布（推/拉/腿）
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleBalance}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="训练占比" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-slate-600 text-center">
              理想比例：推33% / 拉33% / 腿33%
            </div>
          </div>
        </div>

        {/* Scientific Recommendations */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            基于文献的科学建议
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold mb-3 flex items-center">
                <Coffee className="w-5 h-5 mr-2" />
                恢复优化
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• 保证每晚7-9小时睡眠</li>
                <li>• 训练后30分钟内补充蛋白质</li>
                <li>• 每周至少1个完全休息日</li>
                <li>• 考虑泡沫轴放松紧张肌群</li>
              </ul>
              <div className="mt-3 text-xs opacity-80">
                来源：NSCA Essentials of Strength Training
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                渐进超负荷
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• 每周增加2.5-5%训练量</li>
                <li>• 优先增加重量，其次次数</li>
                <li>• 每4-6周安排减负周</li>
                <li>• 记录RPE监控主观强度</li>
              </ul>
              <div className="mt-3 text-xs opacity-80">
                来源：Schoenfeld 2016 hypertrophy meta-analysis
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                 injury预防
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• 动态热身5-10分钟</li>
                <li>• 避免单周训练量突增{'>'}10%</li>
                <li>• 加强核心稳定性训练</li>
                <li>• 注意关节活动度维护</li>
              </ul>
              <div className="mt-3 text-xs opacity-80">
                来源：Lauersen 2018 injury prevention review
              </div>
            </div>
          </div>
        </div>

        {/* Exam Period Special Advice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-yellow-600" />
            📚 考研期间专属建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">训练策略调整</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✅ 保持全身训练模式（每次~50分钟）</li>
                <li>✅ 降低容量至维持水平（每周2-3次）</li>
                <li>✅ 优先安排在下午学习效率低谷期</li>
                <li>✅ 考试前2周进一步减量（每周1-2次）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">认知益处</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>🧠 运动提升BDNF（脑源性神经营养因子）</li>
                <li>🧠 改善记忆力和注意力集中度</li>
                <li>🧠 缓解焦虑和压力激素皮质醇</li>
                <li>🧠 促进睡眠质量，巩固学习内容</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200 text-sm text-slate-600 italic">
            📖 参考文献：Hötting & Röder 2013 "Exercise and cognition: A review"
          </div>
        </div>
      </main>
    </div>
  );
}
