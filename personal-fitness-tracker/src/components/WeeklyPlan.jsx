import { Calendar, Check, Clock, Dumbbell, Activity, Coffee } from 'lucide-react';

export default function WeeklyPlan({ strengthData, runningData }) {
  // 生成本周日期（周一到周日）
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  // 训练计划模板（考研期间优化版）
  const trainingPlan = [
    { day: '周一', type: 'strength', focus: '上肢推日', exercises: ['坐姿推胸机', '哑铃推肩', '哑铃侧平举'], icon: 'dumbbell' },
    { day: '周二', type: 'rest', focus: '主动恢复', exercises: ['散步30分钟', '拉伸'], icon: 'coffee' },
    { day: '周三', type: 'strength', focus: '上肢拉日+腿部', exercises: ['高位下拉', '坐姿划船', '倒蹬'], icon: 'dumbbell' },
    { day: '周四', type: 'rest', focus: '休息', exercises: ['完全休息'], icon: 'coffee' },
    { day: '周五', type: 'strength', focus: '肩部+核心', exercises: ['哑铃推肩', '哑铃侧平举', '平板支撑'], icon: 'dumbbell' },
    { day: '周六', type: 'running', focus: '轻松跑', exercises: ['5-6km 轻松跑'], icon: 'running' },
    { day: '周日', type: 'rest', focus: '休息', exercises: ['完全休息'], icon: 'coffee' },
  ];

  // 检查某天是否有训练记录
  const hasTrainingOnDate = (date, type) => {
    const dateStr = date.toISOString().split('T')[0];
    if (type === 'strength') {
      return strengthData?.some(record => record['日期'] === dateStr);
    } else if (type === 'running') {
      return runningData?.some(record => record['日期'] === dateStr);
    }
    return false;
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dumbbell': return <Dumbbell className="w-5 h-5" />;
      case 'running': return <Activity className="w-5 h-5" />;
      case 'coffee': return <Coffee className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (plan, index) => {
    const date = weekDates[index];
    const isCompleted = hasTrainingOnDate(date, plan.type);
    const isToday = date.toDateString() === new Date().toDateString();
    
    if (isToday) return 'bg-blue-100 border-blue-300';
    if (isCompleted) return 'bg-green-50 border-green-200';
    if (plan.type === 'rest') return 'bg-slate-50 border-slate-200';
    return 'bg-white border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          本周训练计划
        </h3>
        <span className="text-sm text-slate-500">
          {weekDates[0].toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} - 
          {weekDates[6].toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="space-y-3">
        {trainingPlan.map((plan, index) => {
          const date = weekDates[index];
          const isCompleted = hasTrainingOnDate(date, plan.type);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={plan.day}
              className={`rounded-lg border-2 p-4 transition-all ${getStatusColor(plan, index)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${isToday ? 'bg-blue-200 text-blue-700' : ''}
                    ${isCompleted && !isToday ? 'bg-green-200 text-green-700' : ''}
                    ${!isCompleted && !isToday && plan.type !== 'rest' ? 'bg-slate-200 text-slate-600' : ''}
                    ${plan.type === 'rest' ? 'bg-slate-100 text-slate-500' : ''}
                  `}>
                    {getIcon(plan.icon)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-slate-900">{plan.day}</span>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">今天</span>
                      )}
                      {isCompleted && !isToday && (
                        <span className="flex items-center text-green-600 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          已完成
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">{plan.focus}</div>
                    <div className="flex flex-wrap gap-2">
                      {plan.exercises.map((exercise, i) => (
                        <span 
                          key={i}
                          className={`
                            text-xs px-2 py-1 rounded-full
                            ${plan.type === 'strength' ? 'bg-purple-100 text-purple-700' : ''}
                            ${plan.type === 'running' ? 'bg-blue-100 text-blue-700' : ''}
                            ${plan.type === 'rest' ? 'bg-slate-100 text-slate-600' : ''}
                          `}
                        >
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">
                    {date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </div>
                  {plan.type === 'strength' && (
                    <div className="text-xs text-slate-500">~50分钟</div>
                  )}
                  {plan.type === 'running' && (
                    <div className="text-xs text-slate-500">~30分钟</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-xs text-slate-600">力量训练</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-xs text-slate-600">有氧跑步</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-600">3</div>
            <div className="text-xs text-slate-600">休息恢复</div>
          </div>
        </div>
      </div>
    </div>
  );
}
