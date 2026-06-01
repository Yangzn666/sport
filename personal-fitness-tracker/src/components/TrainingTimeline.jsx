import { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, Activity, Scale, Clock } from 'lucide-react';

export default function TrainingTimeline({ strengthData, runningData, bodyData }) {
  const [expandedId, setExpandedId] = useState(null);

  // 合并所有训练记录并按日期排序
  const mergeAndSortLogs = () => {
    const logs = [];

    // 添加力量训练记录
    if (strengthData) {
      const strengthByDate = {};
      strengthData.forEach(record => {
        const date = record['日期'];
        if (!strengthByDate[date]) {
          strengthByDate[date] = { date, exercises: [], totalVolume: 0 };
        }
        strengthByDate[date].exercises.push({
          name: record['动作'],
          weight: record['重量'],
          reps: record['次数'],
          sets: record['组数'],
          volume: record['容量']
        });
        strengthByDate[date].totalVolume += parseFloat(record['容量']) || 0;
      });

      Object.values(strengthByDate).forEach(day => {
        logs.push({
          id: `strength-${day.date}`,
          date: day.date,
          type: 'strength',
          title: `力量训练`,
          duration: '~50分钟',
          summary: `${day.exercises.length}个动作，总容量${(day.totalVolume / 1000).toFixed(1)}吨`,
          details: day.exercises
        });
      });
    }

    // 添加跑步记录
    if (runningData) {
      runningData.forEach(record => {
        logs.push({
          id: `running-${record['日期']}`,
          date: record['日期'],
          type: 'running',
          title: `${record['类型'] || '跑步'}`,
          duration: `${record['时间']}分钟`,
          summary: `${record['距离']}km，配速${record['配速']}min/km${record['心率'] !== '--' ? `，心率${record['心率']}bpm` : ''}`,
          details: record
        });
      });
    }

    // 添加体成分记录
    if (bodyData) {
      bodyData.forEach(record => {
        logs.push({
          id: `body-${record['日期']}`,
          date: record['日期'],
          type: 'body',
          title: '体成分测量',
          duration: '',
          summary: `体重${record['体重']}kg，体脂${record['体脂率']}%，肌肉${record['骨骼肌']}kg`,
          details: record
        });
      });
    }

    // 按日期降序排序，取最近7天
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs.slice(0, 14); // 显示最近14条记录
  };

  const logs = mergeAndSortLogs();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'running': return <Activity className="w-5 h-5" />;
      case 'body': return <Scale className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'strength': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'running': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'body': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-slate-600" />
        最近训练记录
      </h3>

      <div className="space-y-4">
        {logs.map((log) => (
          <div 
            key={log.id}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="w-full p-4 flex items-start justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                  {getTypeIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-slate-900">{log.title}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.date).toLocaleDateString('zh-CN', { 
                        month: 'numeric', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">{log.summary}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {log.duration && (
                  <span className="text-xs text-slate-500">{log.duration}</span>
                )}
                {expandedId === log.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === log.id && (
              <div className="px-4 pb-4 border-t border-slate-200 bg-slate-50">
                {log.type === 'strength' && (
                  <div className="mt-3 space-y-2">
                    {log.details.map((exercise, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{exercise.name}</span>
                        <span className="text-slate-600">
                          {exercise.weight}kg × {exercise.reps} × {exercise.sets}组
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {log.type === 'running' && (
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">距离</div>
                      <div className="font-semibold text-slate-900">{log.details['距离']}km</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">配速</div>
                      <div className="font-semibold text-slate-900">{log.details['配速']}min/km</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">时间</div>
                      <div className="font-semibold text-slate-900">{log.details['时间']}min</div>
                    </div>
                  </div>
                )}

                {log.type === 'body' && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">体重</div>
                      <div className="font-semibold text-slate-900">{log.details['体重']}kg</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">体脂率</div>
                      <div className="font-semibold text-slate-900">{log.details['体脂率']}%</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">骨骼肌</div>
                      <div className="font-semibold text-slate-900">{log.details['骨骼肌']}kg</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-slate-500 text-xs">基础代谢</div>
                      <div className="font-semibold text-slate-900">{log.details['基础代谢']}kcal</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无训练记录</p>
          <p className="text-sm mt-1">点击右上角按钮开始记录训练</p>
        </div>
      )}
    </div>
  );
}
