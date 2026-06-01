#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
运动数据分析报告生成与邮件发送脚本
分析跑步、力量训练和体脂数据，生成详细报告并通过邮件发送
"""

import csv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from collections import defaultdict
import statistics

# 邮箱配置
SENDER_EMAIL = "2142744149@qq.com"
RECEIVER_EMAIL = "2142744149@qq.com"
SMTP_SERVER = "smtp.qq.com"
SMTP_PORT = 587
SMTP_PASSWORD = ""  # 需要用户填写QQ邮箱授权码

def load_running_data(filepath):
    """加载跑步数据"""
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['日期']:
                # 提取步频数字
                cadence_str = str(row['步频']) if row['步频'] else '0'
                cadence_digits = ''.join(filter(str.isdigit, cadence_str))
                cadence = int(cadence_digits) if cadence_digits else 0
                
                data.append({
                    'date': row['日期'],
                    'distance': float(row['距离']) if row['距离'] else 0,
                    'time': float(row['时间']) if row['时间'] else 0,
                    'pace': float(row['配速']) if row['配速'] else 0,
                    'heart_rate': int(row['心率']) if row['心率'] and row['心率'] != '--' else 0,
                    'type': row['类型'],
                    'cadence': cadence
                })
    return data

def load_strength_data(filepath):
    """加载力量训练数据"""
    data = []
    with open(filepath, 'r', encoding='utf-8-sig') as f:  # 使用utf-8-sig处理BOM
        reader = csv.DictReader(f)
        for row in reader:
            if '日期' in row and row['日期']:
                data.append({
                    'date': row['日期'],
                    'exercise': row['动作'],
                    'weight': float(row['重量']) if row['重量'] else 0,
                    'sets': int(row['组数']) if row['组数'] else 1,
                    'reps': int(row['次数']) if row['次数'] else 0,
                    'volume': float(row['容量']) if row['容量'] else 0,
                    'body_part': row['部位']
                })
    return data

def load_body_composition_data(filepath):
    """加载体脂数据"""
    data = []
    with open(filepath, 'r', encoding='utf-8-sig') as f:  # 使用utf-8-sig处理BOM
        reader = csv.DictReader(f)
        for row in reader:
            if '日期' in row and row['日期']:
                data.append({
                    'date': row['日期'],
                    'weight': float(row['体重']) if row['体重'] else 0,
                    'body_fat_rate': float(row['体脂率']) if row['体脂率'] else 0,
                    'fat_mass': float(row['脂肪量']) if row['脂肪量'] else 0,
                    'skeletal_muscle': float(row['骨骼肌']) if row['骨骼肌'] else 0,
                    'bmi': float(row['BMI']) if row['BMI'] else 0,
                    'bmr': float(row['基础代谢']) if row['基础代谢'] else 0,
                    'body_type': row['体型']
                })
    return data

def analyze_running_data(data):
    """分析跑步数据"""
    if not data:
        return {}
    
    # 基本统计
    total_runs = len(data)
    total_distance = sum(d['distance'] for d in data)
    total_time = sum(d['time'] for d in data)
    avg_pace = statistics.mean([d['pace'] for d in data if d['pace'] > 0])
    
    # 按类型分类
    type_stats = defaultdict(lambda: {'count': 0, 'distance': 0, 'avg_pace': []})
    for d in data:
        type_stats[d['type']]['count'] += 1
        type_stats[d['type']]['distance'] += d['distance']
        if d['pace'] > 0:
            type_stats[d['type']]['avg_pace'].append(d['pace'])
    
    # 计算各类型的平均配速
    for t in type_stats:
        if type_stats[t]['avg_pace']:
            type_stats[t]['avg_pace'] = statistics.mean(type_stats[t]['avg_pace'])
    
    # 心率分析
    hr_data = [d['heart_rate'] for d in data if d['heart_rate'] > 0]
    avg_hr = statistics.mean(hr_data) if hr_data else 0
    
    # 步频分析
    cadence_data = [d['cadence'] for d in data if d['cadence'] > 0]
    avg_cadence = statistics.mean(cadence_data) if cadence_data else 0
    
    # 半马成绩
    half_marathons = [d for d in data if d['distance'] >= 20 and d['distance'] <= 22]
    
    # 月度跑量
    monthly_distance = defaultdict(float)
    for d in data:
        month = d['date'][:7]  # YYYY-MM
        monthly_distance[month] += d['distance']
    
    # 最近3个月跑量
    recent_months = sorted(monthly_distance.keys())[-3:]
    recent_avg = statistics.mean([monthly_distance[m] for m in recent_months]) if recent_months else 0
    
    return {
        'total_runs': total_runs,
        'total_distance': total_distance,
        'total_time': total_time,
        'avg_pace': avg_pace,
        'avg_hr': avg_hr,
        'avg_cadence': avg_cadence,
        'type_stats': dict(type_stats),
        'half_marathons': half_marathons,
        'monthly_distance': dict(monthly_distance),
        'recent_avg_monthly': recent_avg
    }

def analyze_strength_data(data):
    """分析力量训练数据"""
    if not data:
        return {}
    
    # 基本统计
    total_sessions = len(set(d['date'] for d in data))
    total_volume = sum(d['volume'] for d in data)
    
    # 按部位分类
    body_part_stats = defaultdict(lambda: {'sessions': 0, 'volume': 0, 'exercises': set()})
    for d in data:
        body_part_stats[d['body_part']]['sessions'] += 1
        body_part_stats[d['body_part']]['volume'] += d['volume']
        body_part_stats[d['body_part']]['exercises'].add(d['exercise'])
    
    # 转换为可序列化的格式
    for bp in body_part_stats:
        body_part_stats[bp]['exercises'] = list(body_part_stats[bp]['exercises'])
    
    # 主要动作进步趋势
    exercise_progress = defaultdict(list)
    for d in data:
        if d['weight'] > 0:  # 排除引体向上等自重动作
            exercise_progress[d['exercise']].append({
                'date': d['date'],
                'weight': d['weight'],
                'volume': d['volume']
            })
    
    # 计算每个动作的最大重量
    max_weights = {}
    for exercise, records in exercise_progress.items():
        if records:
            max_weights[exercise] = max(r['weight'] for r in records)
    
    return {
        'total_sessions': total_sessions,
        'total_volume': total_volume,
        'body_part_stats': dict(body_part_stats),
        'exercise_progress': dict(exercise_progress),
        'max_weights': max_weights
    }

def generate_running_report(analysis, raw_data):
    """生成跑步分析报告"""
    report = []
    report.append("=" * 80)
    report.append("🏃‍♂️ 跑步训练综合分析报告")
    report.append("=" * 80)
    report.append(f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    
    # 总体概况
    report.append("\n【一、总体概况】")
    report.append("-" * 80)
    report.append(f"• 总跑步次数: {analysis['total_runs']} 次")
    report.append(f"• 总跑步距离: {analysis['total_distance']:.1f} km")
    report.append(f"• 总跑步时长: {analysis['total_time']:.1f} 分钟 ({analysis['total_time']/60:.1f} 小时)")
    report.append(f"• 平均配速: {analysis['avg_pace']:.2f} min/km")
    report.append(f"• 平均心率: {analysis['avg_hr']:.0f} bpm")
    report.append(f"• 平均步频: {analysis['avg_cadence']:.0f} 步/分钟")
    report.append(f"• 近3个月月均跑量: {analysis['recent_avg_monthly']:.1f} km")
    
    # 训练类型分布
    report.append("\n【二、训练类型分布】")
    report.append("-" * 80)
    for run_type, stats in sorted(analysis['type_stats'].items(), key=lambda x: x[1]['count'], reverse=True):
        percentage = (stats['count'] / analysis['total_runs']) * 100
        report.append(f"• {run_type}: {stats['count']} 次 ({percentage:.1f}%)")
        report.append(f"  - 总距离: {stats['distance']:.1f} km")
        if stats['avg_pace']:
            report.append(f"  - 平均配速: {stats['avg_pace']:.2f} min/km")
    
    # 半马成绩
    if analysis['half_marathons']:
        report.append("\n【三、半程马拉松成绩】")
        report.append("-" * 80)
        for i, hm in enumerate(analysis['half_marathons'], 1):
            report.append(f"{i}. {hm['date']}: {hm['distance']:.2f} km, ")
            report.append(f"   用时: {hm['time']:.1f} 分钟, 配速: {hm['pace']:.2f} min/km, ")
            report.append(f"   平均心率: {hm['heart_rate']} bpm")
        
        best_hm = min(analysis['half_marathons'], key=lambda x: x['time'])
        report.append(f"\n最佳半马成绩: {best_hm['date']}")
        report.append(f"• 距离: {best_hm['distance']:.2f} km")
        report.append(f"• 用时: {best_hm['time']:.1f} 分钟 ({int(best_hm['time'])}分{int((best_hm['time']%1)*60)}秒)")
        report.append(f"• 平均配速: {best_hm['pace']:.2f} min/km")
    
    # 训练频率分析
    report.append("\n【四、训练频率分析】")
    report.append("-" * 80)
    dates = sorted(analysis['monthly_distance'].keys())
    if len(dates) >= 2:
        first_date = datetime.strptime(dates[0], '%Y-%m')
        last_date = datetime.strptime(dates[-1], '%Y-%m')
        months_span = (last_date.year - first_date.year) * 12 + (last_date.month - first_date.month) + 1
        avg_runs_per_month = analysis['total_runs'] / months_span if months_span > 0 else 0
        report.append(f"• 数据跨度: {dates[0]} 至 {dates[-1]} ({months_span} 个月)")
        report.append(f"• 月均跑步次数: {avg_runs_per_month:.1f} 次/月")
        report.append(f"• 月均跑步距离: {analysis['total_distance']/months_span:.1f} km/月")
    
    # 配速区间分析
    report.append("\n【五、配速区间分析】")
    report.append("-" * 80)
    pace_zones = {
        '恢复跑 (<6:30)': [d for d in raw_data if d['pace'] < 6.5 and d['type'] == '恢复跑'],
        '轻松跑 (5:30-6:30)': [d for d in raw_data if 5.5 <= d['pace'] < 6.5 and d['type'] == '轻松跑'],
        '节奏跑 (4:30-5:30)': [d for d in raw_data if 4.5 <= d['pace'] < 5.5 and d['type'] == '节奏跑'],
        '间歇跑 (<4:30)': [d for d in raw_data if d['pace'] < 4.5 and d['type'] == '间歇跑']
    }
    
    for zone_name, runs in pace_zones.items():
        if runs:
            percentage = (len(runs) / analysis['total_runs']) * 100
            report.append(f"• {zone_name}: {len(runs)} 次 ({percentage:.1f}%)")
    
    # 当前状态评估
    report.append("\n【六、当前状态评估】")
    report.append("-" * 80)
    report.append("⚠️  当前状态: 跑步休息期")
    report.append("")
    report.append("优势:")
    report.append("✓ 拥有完整的跑步训练历史（2020-2026）")
    report.append("✓ 已完成多次半程马拉松，具备长距离耐力基础")
    report.append("✓ 训练类型多样化，包含轻松跑、节奏跑、间歇跑等")
    report.append("✓ 步频稳定在160左右，技术动作较为规范")
    report.append("")
    report.append("待改进:")
    report.append("✗ 近期（2026年5月）跑步频率明显下降")
    report.append("✗ 部分训练缺少心率数据，无法精确监控强度")
    report.append("✗ 需要建立更系统的周期性训练计划")
    
    return "\n".join(report)

def generate_strength_report(analysis):
    """生成力量训练分析报告"""
    report = []
    report.append("=" * 80)
    report.append("🏋️♂️ 力量训练综合分析报告")
    report.append("=" * 80)
    report.append(f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    
    # 总体概况
    report.append("\n【一、总体概况】")
    report.append("-" * 80)
    report.append(f"• 总训练次数: {analysis['total_sessions']} 次")
    report.append(f"• 总训练组数: 1605 组")
    report.append(f"• 总训练容量: {analysis['total_volume']/1000:.1f} 吨")
    report.append(f"• 平均单次容量: {analysis['total_volume']/analysis['total_sessions']:.0f} kg")
    report.append(f"• 数据时间跨度: 2024-11-17 至 2026-05-29")
    
    # 部位训练分布
    report.append("\n【二、部位训练分布】")
    report.append("-" * 80)
    sorted_parts = sorted(analysis['body_part_stats'].items(), 
                         key=lambda x: x[1]['sessions'], reverse=True)
    
    for body_part, stats in sorted_parts:
        percentage = (stats['sessions'] / analysis['total_sessions']) * 100
        volume_tons = stats['volume'] / 1000
        report.append(f"• {body_part}: {stats['sessions']} 次 ({percentage:.1f}%)")
        report.append(f"  - 训练容量: {volume_tons:.1f} 吨")
        report.append(f"  - 涉及动作: {', '.join(stats['exercises'][:5])}")
        if len(stats['exercises']) > 5:
            report.append(f"              等共{len(stats['exercises'])}个动作")
    
    # 主要动作最大重量
    report.append("\n【三、主要动作最大重量记录】")
    report.append("-" * 80)
    
    important_exercises = ['高位下拉', '坐姿划船', '坐姿推胸', '哑铃推肩', 
                          '夹胸', '倒蹬', '哈克深蹲']
    
    for exercise in important_exercises:
        if exercise in analysis['max_weights']:
            max_weight = analysis['max_weights'][exercise]
            report.append(f"• {exercise}: {max_weight:.1f} kg")
    
    # 训练频率分析
    report.append("\n【四、训练频率分析】")
    report.append("-" * 80)
    report.append(f"• 总训练天数: {analysis['total_sessions']} 天")
    report.append(f"• 平均每周训练: {analysis['total_sessions']/78:.1f} 次/周")
    report.append("  （基于78周的数据跨度）")
    
    # 健身房切换影响
    report.append("\n【五、健身房切换影响】")
    report.append("-" * 80)
    report.append("• 2024.11 - 2025.02: 滨江杭二健身房")
    report.append("  - 器械特点: 传统固定器械为主")
    report.append("  - 可用动作: 单腿后踢等特殊器械")
    report.append("")
    report.append("• 2025.03 - 2026.05: 滨江乐刻健身房")
    report.append("  - 器械特点: 现代化健身连锁")
    report.append("  - 变化: 失去单腿后踢器械，调整训练动作")
    
    # 训练亮点
    report.append("\n【六、训练亮点】")
    report.append("-" * 80)
    report.append("✓ 背部训练量最大（626组，占39%），重视拉类动作")
    report.append("✓ 胸部训练系统化（432组，占27%），推类动作均衡")
    report.append("✓ 腿部训练覆盖全面（224组），包含倒蹬、哈克深蹲等复合动作")
    report.append("✓ 肩部训练注重细节（195组），包含侧平举、面拉等小肌群训练")
    report.append("✓ 手臂训练针对性强（111组），二头三头均衡发展")
    
    # 待改进方面
    report.append("\n【七、待改进方面】")
    report.append("-" * 80)
    report.append(" 核心训练较少（仅5组），建议增加腹肌、腰背稳定性训练")
    report.append("✗ 部分动作记录不完整（如引体向上无负重数据）")
    report.append("✗ 训练频率波动较大，建议建立固定训练日程")
    report.append("✗ 缺少明确的渐进超负荷计划")
    
    return "\n".join(report)

def generate_body_composition_report(body_data):
    """生成体脂分析报告"""
    report = []
    report.append("=" * 80)
    report.append("⚖️ 身体成分变化分析报告")
    report.append("=" * 80)
    report.append(f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    
    if not body_data:
        report.append("暂无体脂数据")
        return "\n".join(report)
    
    # 最新数据
    latest = body_data[-1]
    earliest = body_data[0]
    
    report.append("\n【一、最新身体数据】")
    report.append("-" * 80)
    report.append(f"测量日期: {latest['date']}")
    report.append(f"• 体重: {latest['weight']:.1f} kg")
    report.append(f"• 体脂率: {latest['body_fat_rate']:.1f}%")
    report.append(f"• 脂肪量: {latest['fat_mass']:.1f} kg")
    report.append(f"• 骨骼肌: {latest['skeletal_muscle']:.1f} kg")
    report.append(f"• BMI: {latest['bmi']:.1f}")
    report.append(f"• 基础代谢: {latest['bmr']:.0f} kcal")
    report.append(f"• 体型评估: {latest['body_type']}")
    
    # 变化趋势
    report.append("\n【二、身体成分变化趋势】")
    report.append("-" * 80)
    weight_change = latest['weight'] - earliest['weight']
    fat_change = latest['body_fat_rate'] - earliest['body_fat_rate']
    muscle_change = latest['skeletal_muscle'] - earliest['skeletal_muscle']
    
    report.append(f"时间跨度: {earliest['date']} 至 {latest['date']}")
    report.append("")
    report.append(f"• 体重变化: {weight_change:+.1f} kg ({weight_change/earliest['weight']*100:+.1f}%)")
    report.append(f"• 体脂率变化: {fat_change:+.1f}%")
    report.append(f"• 骨骼肌变化: {muscle_change:+.1f} kg ({muscle_change/earliest['skeletal_muscle']*100:+.1f}%)")
    report.append(f"• BMI变化: {latest['bmi'] - earliest['bmi']:+.1f}")
    
    # 阶段分析
    report.append("\n【三、阶段性分析】")
    report.append("-" * 80)
    
    if len(body_data) >= 3:
        mid = body_data[len(body_data)//2]
        report.append("第一阶段（增肌期）:")
        report.append(f"  {earliest['date']} → {mid['date']}")
        report.append(f"  • 体重: {earliest['weight']:.1f} → {mid['weight']:.1f} kg")
        report.append(f"  • 体脂率: {earliest['body_fat_rate']:.1f}% → {mid['body_fat_rate']:.1f}%")
        report.append("")
        report.append("第二阶段（继续增重）:")
        report.append(f"  {mid['date']} → {latest['date']}")
        report.append(f"  • 体重: {mid['weight']:.1f} → {latest['weight']:.1f} kg")
        report.append(f"  • 体脂率: {mid['body_fat_rate']:.1f}% → {latest['body_fat_rate']:.1f}%")
    
    # 评估与建议
    report.append("\n【四、评估与建议】")
    report.append("-" * 80)
    report.append("评估:")
    report.append(f"✓ 体重增长 {weight_change:.1f} kg，主要来自肌肉增长（+{muscle_change:.1f} kg骨骼肌）")
    report.append(f"✓ 体型从\"矫健\"转变为\"运动型\"，符合力量训练目标")
    report.append(f" 体脂率上升 {fat_change:.1f}%，需关注饮食控制")
    report.append(f"✓ BMI保持在健康范围（21.0 → 23.9）")
    report.append("")
    report.append("建议:")
    report.append("1. 保持当前力量训练强度，继续增加肌肉量")
    report.append("2. 适当增加有氧训练，控制体脂率上升速度")
    report.append("3. 优化饮食结构，保证蛋白质摄入（1.6-2.0g/kg体重）")
    report.append("4. 定期监测体脂，目标体脂率维持在12-15%")
    
    return "\n".join(report)

def generate_recommendations(running_analysis, strength_analysis, body_data):
    """生成综合建议"""
    report = []
    report.append("=" * 80)
    report.append("📋 综合训练建议")
    report.append("=" * 80)
    report.append("")
    
    # 跑步建议
    report.append("\n【跑步训练建议】")
    report.append("-" * 80)
    report.append("鉴于您当前处于跑步休息期，建议按以下阶段恢复：")
    report.append("")
    report.append("第1阶段（第1-2周）- 适应期:")
    report.append("• 频率: 每周2-3次")
    report.append("• 内容: 轻松跑3-5km，配速6:00-6:30")
    report.append("• 目标: 重建跑步习惯，激活心肺功能")
    report.append("• 心率控制: 140-150 bpm（有氧区间）")
    report.append("")
    report.append("第2阶段（第3-4周）- 积累期:")
    report.append("• 频率: 每周3-4次")
    report.append("• 内容: ")
    report.append("  - 2次轻松跑5-8km")
    report.append("  - 1次节奏跑4-6km（配速5:00-5:30）")
    report.append("  - 1次长距离10-12km（周末）")
    report.append("• 目标: 提升有氧耐力，恢复跑步节奏")
    report.append("")
    report.append("第3阶段（第5-8周）- 强化期:")
    report.append("• 频率: 每周4-5次")
    report.append("• 内容:")
    report.append("  - 2次轻松跑6-10km")
    report.append("  - 1次间歇跑（如8×400m或6×800m）")
    report.append("  - 1次节奏跑6-8km")
    report.append("  - 1次长距离12-15km")
    report.append("• 目标: 提升速度和耐力，为半马做准备")
    report.append("")
    report.append("第4阶段（第9-12周）- 比赛准备期:")
    report.append("• 频率: 每周4-5次")
    report.append("• 内容: 模拟比赛配速训练")
    report.append("• 目标: 半程马拉松PB突破")
    report.append("• 预期成绩: 基于您之前1:44的半马成绩，")
    report.append("           目标可设定为1:40-1:42")
    report.append("")
    report.append("关键建议:")
    report.append("1. 使用心率带或运动手表监控训练强度")
    report.append("2. 保持步频在160-170之间")
    report.append("3. 每次跑步前充分热身，跑后拉伸")
    report.append("4. 注意恢复，保证充足睡眠（7-8小时）")
    
    # 力量训练建议
    report.append("\n【力量训练建议】")
    report.append("-" * 80)
    report.append("基于您当前的训练数据和体脂变化，建议：")
    report.append("")
    report.append("训练分化方案（推荐推拉腿分化）:")
    report.append("")
    report.append("Day 1 - 推日（胸、肩、三头）:")
    report.append("• 上斜哑铃卧推 4×8-10")
    report.append("• 平板推胸机 4×8-10")
    report.append("• 哑铃推肩 4×10-12")
    report.append("• 哑铃侧平举 3×12-15")
    report.append("• 三头下拉 3×12-15")
    report.append("• 面拉 3×15")
    report.append("")
    report.append("Day 2 - 拉日（背、二头）:")
    report.append("• 引体向上 4×力竭")
    report.append("• 高位下拉 4×8-10")
    report.append("• 坐姿划船 4×8-10")
    report.append("• 反向飞鸟 3×12-15")
    report.append("• 哑铃弯举 3×10-12")
    report.append("• 锤式弯举 3×10-12")
    report.append("")
    report.append("Day 3 - 腿日（腿、臀、核心）:")
    report.append("• 哈克深蹲 4×8-10")
    report.append("• 倒蹬 4×10-12")
    report.append("• 向上踢腿 3×12-15")
    report.append("• 夹腿 3×12-15")
    report.append("• 髋外展 3×12-15")
    report.append("• 绳索卷腹 3×15")
    report.append("• 平板支撑 3×60秒")
    report.append("")
    report.append("Day 4 - 休息或有氧")
    report.append("Day 5 - 重复推日")
    report.append("Day 6 - 重复拉日")
    report.append("Day 7 - 休息")
    report.append("")
    report.append("渐进超负荷原则:")
    report.append("1. 每2周尝试增加重量2.5-5kg")
    report.append("2. 或者增加次数1-2次")
    report.append("3. 或者减少组间休息时间")
    report.append("4. 记录每次训练，追踪进步")
    report.append("")
    report.append("核心训练加强（针对目前不足）:")
    report.append("• 每周至少3次核心训练，每次10-15分钟")
    report.append("• 动作: 平板支撑、俄罗斯转体、死虫式、鸟狗式")
    report.append("• 目标: 增强核心稳定性，提升整体力量表现")
    
    # 营养建议
    report.append("\n【营养建议】")
    report.append("-" * 80)
    report.append(f"基于您的体重 {body_data[-1]['weight']:.1f} kg 和训练量：")
    report.append("")
    report.append("每日热量需求:")
    bmr = body_data[-1]['bmr']
    tdee = bmr * 1.55  # 中等活动水平
    report.append(f"• 基础代谢(BMR): {bmr:.0f} kcal")
    report.append(f"• 日常消耗(TDEE): {tdee:.0f} kcal")
    report.append(f"• 增肌期目标: {tdee + 300:.0f} kcal/天")
    report.append(f"• 减脂期目标: {tdee - 300:.0f} kcal/天")
    report.append("")
    report.append("宏量营养素分配（增肌期）:")
    protein = body_data[-1]['weight'] * 1.8
    fat = body_data[-1]['weight'] * 0.9
    carbs = (tdee + 300 - protein*4 - fat*9) / 4
    report.append(f"• 蛋白质: {protein:.0f}g/天 ({protein*4:.0f} kcal, 占{(protein*4/(tdee+300))*100:.0f}%)")
    report.append(f"• 脂肪: {fat:.0f}g/天 ({fat*9:.0f} kcal, 占{(fat*9/(tdee+300))*100:.0f}%)")
    report.append(f"• 碳水: {carbs:.0f}g/天 ({carbs*4:.0f} kcal, 占{(carbs*4/(tdee+300))*100:.0f}%)")
    report.append("")
    report.append("食物选择建议:")
    report.append("• 蛋白质来源: 鸡胸肉、牛肉、鱼、鸡蛋、蛋白粉")
    report.append("• 碳水来源: 燕麦、糙米、红薯、全麦面包")
    report.append("• 脂肪来源: 坚果、橄榄油、牛油果、深海鱼")
    report.append("• 蔬菜: 每餐至少200g绿叶蔬菜")
    report.append("")
    report.append("训练前后营养:")
    report.append("• 训练前1-2小时: 碳水+少量蛋白质（如香蕉+酸奶）")
    report.append("• 训练后30分钟内: 蛋白质+快速碳水（如蛋白粉+白面包）")
    report.append("• 全天均匀分配蛋白质摄入（每餐20-30g）")
    
    # 恢复建议
    report.append("\n【恢复与心理建议】")
    report.append("-" * 80)
    report.append("睡眠:")
    report.append("• 每晚7-9小时高质量睡眠")
    report.append("• 固定作息时间，避免熬夜")
    report.append("• 睡前1小时避免电子屏幕")
    report.append("")
    report.append("主动恢复:")
    report.append("• 每周1-2次泡沫轴放松")
    report.append("• 训练后进行10-15分钟拉伸")
    report.append("• 每月1次按摩或物理治疗")
    report.append("")
    report.append("压力管理:")
    report.append("• 保持训练日志，记录心情和状态")
    report.append("• 设置合理目标，避免过度追求")
    report.append("• 培养训练外的兴趣爱好")
    report.append("• 必要时寻求专业心理咨询")
    report.append("")
    report.append("警惕过度训练信号:")
    report.append("✗ 持续疲劳、睡眠质量下降")
    report.append("✗ 训练表现持续下滑")
    report.append("✗ 静息心率升高")
    report.append("✗ 情绪波动、易怒")
    report.append("✗ 免疫力下降、容易生病")
    report.append("→ 出现以上症状时，立即安排减量周或完全休息")
    
    # 总结
    report.append("\n【总结】")
    report.append("-" * 80)
    report.append("您是一位训练经验丰富、数据意识强的运动爱好者。")
    report.append("过去几年您在跑步和力量训练方面都取得了显著进步：")
    report.append("")
    report.append("✓ 跑步: 完成多次半马，最佳成绩1:44，具备良好的有氧基础")
    report.append("✓ 力量: 系统训练1605组，背部和胸部发展突出")
    report.append("✓ 身体成分: 体重从66.6kg增至75.6kg，肌肉量显著提升")
    report.append("")
    report.append("当前挑战:")
    report.append("• 跑步处于休息期，需要科学恢复")
    report.append("• 体脂率有所上升，需要优化饮食")
    report.append("• 核心训练不足，需要加强")
    report.append("")
    report.append("未来3个月目标建议:")
    report.append("1. 跑步: 恢复训练，半马成绩突破1:40")
    report.append("2. 力量: 继续增肌，重点加强腿部和核心")
    report.append("3. 体脂: 控制在12-15%区间")
    report.append("4. 整体: 建立可持续的训练-恢复-营养体系")
    report.append("")
    report.append("记住: 健身是一场马拉松，不是短跑。")
    report.append("保持耐心，坚持科学训练，您一定能达到理想状态！💪")
    report.append("")
    report.append("=" * 80)
    report.append("报告结束")
    report.append("=" * 80)
    
    return "\n".join(report)

def send_email(subject, content):
    """发送邮件"""
    try:
        # 创建邮件
        msg = MIMEMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECEIVER_EMAIL
        msg['Subject'] = subject
        
        # 添加邮件内容
        text_part = MIMEText(content, 'plain', 'utf-8')
        msg.attach(text_part)
        
        # 连接SMTP服务器并发送
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SMTP_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()
        
        print("✅ 邮件发送成功！")
        return True
    except Exception as e:
        print(f"❌ 邮件发送失败: {str(e)}")
        print("\n提示: 请检查:")
        print("1. QQ邮箱是否开启了SMTP服务")
        print("2. 是否使用了正确的授权码（不是登录密码）")
        print("3. 网络连接是否正常")
        return False

def main():
    """主函数"""
    print("=" * 80)
    print("运动数据分析报告生成系统")
    print("=" * 80)
    print()
    
    # 加载数据
    print("正在加载数据...")
    running_data = load_running_data('d:/学习/健身/fitness-knowledge-base/data/your_data/your_running_data.csv')
    strength_data = load_strength_data('d:/学习/健身/fitness-knowledge-base/data/your_data/your_strength_data.csv')
    body_data = load_body_composition_data('d:/学习/健身/fitness-knowledge-base/data/your_data/your_body_composition_data.csv')
    
    print(f"✓ 跑步数据: {len(running_data)} 条记录")
    print(f"✓ 力量训练数据: {len(strength_data)} 条记录")
    print(f"✓ 体脂数据: {len(body_data)} 条记录")
    print()
    
    # 分析数据
    print("正在分析数据...")
    running_analysis = analyze_running_data(running_data)
    strength_analysis = analyze_strength_data(strength_data)
    
    print("✓ 跑步数据分析完成")
    print("✓ 力量训练数据分析完成")
    print()
    
    # 生成报告
    print("正在生成报告...")
    running_report = generate_running_report(running_analysis, running_data)
    strength_report = generate_strength_report(strength_analysis)
    body_report = generate_body_composition_report(body_data)
    recommendations = generate_recommendations(running_analysis, strength_analysis, body_data)
    
    # 合并完整报告
    full_report = f"""
{running_report}

{strength_report}

{body_report}

{recommendations}
"""
    
    print("✓ 报告生成完成")
    print()
    
    # 保存报告到文件
    report_filename = f"运动训练综合分析报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(report_filename, 'w', encoding='utf-8') as f:
        f.write(full_report)
    
    print(f"✓ 报告已保存到: {report_filename}")
    print()
    
    # 发送邮件
    print("正在发送邮件...")
    email_subject = f"【运动训练分析报告】{datetime.now().strftime('%Y-%m-%d')}"
    
    # 注意: 需要用户手动填写QQ邮箱授权码
    print("\n⚠️  重要提示:")
    print("要发送邮件，您需要:")
    print("1. 登录QQ邮箱网页版")
    print("2. 进入 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务")
    print("3. 开启 IMAP/SMTP 服务")
    print("4. 获取授权码（16位字符串）")
    print("5. 将授权码填入脚本中的 SMTP_PASSWORD 变量")
    print()
    
    # 询问是否发送邮件
    send_choice = input("是否现在发送邮件？(y/n): ").strip().lower()
    
    if send_choice == 'y':
        password = input("请输入QQ邮箱授权码: ").strip()
        global SMTP_PASSWORD
        SMTP_PASSWORD = password
        
        success = send_email(email_subject, full_report)
        
        if success:
            print(f"\n✅ 报告已成功发送至: {RECEIVER_EMAIL}")
        else:
            print(f"\n❌ 邮件发送失败，请查看上面保存的报告文件: {report_filename}")
    else:
        print(f"\n 报告已保存，您可以稍后手动发送邮件")
        print(f"   报告文件: {report_filename}")
    
    print("\n" + "=" * 80)
    print("分析完成！")
    print("=" * 80)

if __name__ == "__main__":
    main()
