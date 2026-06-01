import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function QuickLogModal({ isOpen, onClose, type, onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    // Running fields
    distance: '',
    time: '',
    pace: '',
    heartRate: '',
    runType: '轻松跑',
    // Strength fields
    exercise: '',
    weight: '',
    reps: '',
    sets: '',
    // Body composition fields
    weight_bc: '',
    bodyFat: '',
    muscle: '',
    bmi: '',
    bmr: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(type, formData);
    onClose();
    setFormData({
      date: new Date().toISOString().split('T')[0],
      distance: '', time: '', pace: '', heartRate: '', runType: '轻松跑',
      exercise: '', weight: '', reps: '', sets: '',
      weight_bc: '', bodyFat: '', muscle: '', bmi: '', bmr: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {type === 'running' && '记录跑步'}
            {type === 'strength' && '记录力量训练'}
            {type === 'body' && '记录体成分'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date field for all types */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Running form */}
          {type === 'running' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">距离 (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">时间 (分钟)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">配速 (min/km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pace}
                    onChange={(e) => setFormData({...formData, pace: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">心率 (可选)</label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="--"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">训练类型</label>
                <select
                  value={formData.runType}
                  onChange={(e) => setFormData({...formData, runType: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>轻松跑</option>
                  <option>节奏跑</option>
                  <option>间歇跑</option>
                  <option>长距离</option>
                  <option>恢复跑</option>
                </select>
              </div>
            </>
          )}

          {/* Strength form */}
          {type === 'strength' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">动作名称</label>
                <input
                  type="text"
                  value={formData.exercise}
                  onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：高位下拉"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">重量 (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">次数</label>
                  <input
                    type="number"
                    value={formData.reps}
                    onChange={(e) => setFormData({...formData, reps: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">组数</label>
                  <input
                    type="number"
                    value={formData.sets}
                    onChange={(e) => setFormData({...formData, sets: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Body composition form */}
          {type === 'body' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_bc}
                    onChange={(e) => setFormData({...formData, weight_bc: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">体脂率 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">骨骼肌 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muscle}
                    onChange={(e) => setFormData({...formData, muscle: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">基础代谢 (kcal)</label>
                  <input
                    type="number"
                    value={formData.bmr}
                    onChange={(e) => setFormData({...formData, bmr: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
