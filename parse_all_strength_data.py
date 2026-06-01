# 完整的力量训练记录解析脚本
import re

# 动作名称标准化映射
exercise_mapping = {
    # 背部
    '横杆下拉': '高位下拉',
    '高位下拉': '高位下拉',
    '双手下拉': '下拉器械',
    '单手下拉': '下拉器械',
    '单手前拉': '下拉器械',
    '坐姿横拉': '坐姿划船',
    '坐姿划船': '坐姿划船',
    '引体向上': '引体向上',
    '宽距引体': '引体向上',
    '宽距离引体': '引体向上',
    
    # 胸部
    '上胸推': '上斜推胸',
    '上胸': '上斜推胸',
    '中胸': '平板推胸',
    '下胸': '下斜推胸',
    '推胸': '坐姿推胸',
    '脚踩前推': '坐姿推胸',
    '前推': '坐姿推胸',
    '夹胸': '夹胸',
    '蝴蝶机夹胸': '夹胸',
    '蝴蝶结夹胸': '夹胸',
    '蝴蝶机飞鸟': '哑铃飞鸟',
    '哑铃飞鸟': '哑铃飞鸟',
    '哑铃卧推': '哑铃卧推',
    '上斜卧推': '上斜哑铃卧推',
    '臂屈伸': '臂屈伸',
    '辅助臂屈伸': '臂屈伸',
    
    # 肩部
    '推肩': '哑铃推肩',
    '坐姿推肩': '哑铃推肩',
    '站姿推肩': '哑铃推肩',
    '器械推肩': '哑铃推肩',
    '站姿推举': '哑铃推肩',
    '侧平举': '哑铃侧平举',
    '哑铃侧平举': '哑铃侧平举',
    '面拉': '面拉',
    '俯身飞鸟': '反向飞鸟',
    '反向飞鸟': '反向飞鸟',
    '蝴蝶结反向飞鸟': '反向飞鸟',
    '蝴蝶机反向飞鸟': '反向飞鸟',
    '提拉': '直立划船',
    
    # 腿部
    '上踢腿': '向上踢腿',
    '向上踢腿': '向上踢腿',
    '前踢腿': '倒蹬',
    '向前踢腿': '倒蹬',
    '哈克深蹲': '哈克深蹲',
    '双腿内夹': '夹腿',
    '夹腿': '夹腿',
    '开腿': '髋外展',
    '单腿后踢': '单腿后踢',
    '站姿提踵': '站姿提踵',
    
    # 手臂
    '哑铃弯举': '哑铃弯举',
    '弯举': '哑铃弯举',
    '锤式弯举': '锤式弯举',
    '横杆弯举': '杠铃弯举',
    '绳索弯举': '绳索弯举',
    '二头绳索弯举': '绳索弯举',
    '三头下拉': '三头下拉',
    '三头绳索下拉': '三头下拉',
    
    # 核心
    '绳索卷腹': '绳索卷腹',
}

# 身体部位分类
body_part_mapping = {
    '高位下拉': '背部',
    '下拉器械': '背部',
    '坐姿划船': '背部',
    '引体向上': '背部',
    '反向飞鸟': '背部',
    
    '上斜推胸': '胸部',
    '平板推胸': '胸部',
    '下斜推胸': '胸部',
    '坐姿推胸': '胸部',
    '夹胸': '胸部',
    '哑铃飞鸟': '胸部',
    '哑铃卧推': '胸部',
    '上斜哑铃卧推': '胸部',
    '臂屈伸': '胸部',
    
    '哑铃推肩': '肩部',
    '哑铃侧平举': '肩部',
    '面拉': '肩部',
    '直立划船': '肩部',
    
    '向上踢腿': '腿部',
    '倒蹬': '腿部',
    '哈克深蹲': '腿部',
    '夹腿': '腿部',
    '髋外展': '腿部',
    '单腿后踢': '腿部',
    '站姿提踵': '腿部',
    
    '哑铃弯举': '手臂',
    '锤式弯举': '手臂',
    '杠铃弯举': '手臂',
    '绳索弯举': '手臂',
    '三头下拉': '手臂',
    
    '绳索卷腹': '核心',
}

def parse_strength_records_from_text(content):
    """从文本内容解析力量训练记录"""
    records = []
    current_date = None
    current_year = None
    last_month = None
    
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('-'):
            continue
        
        # 匹配日期（如：11月17日, 3月3日）
        date_match = re.match(r'(\d{1,2})月(\d{1,2})日', line)
        if date_match:
            month = int(date_match.group(1))
            day = int(date_match.group(2))
            
            # 根据月份变化推断年份
            if last_month is not None and month < last_month:
                # 月份回退，说明跨年
                if current_year == 2024:
                    current_year = 2025
                elif current_year == 2025:
                    current_year = 2026
            elif current_year is None:
                # 第一次遇到日期
                if month >= 11:
                    current_year = 2024
                else:
                    current_year = 2025
            
            last_month = month
            current_date = f"{current_year}-{month:02d}-{day:02d}"
            continue
        
        if not current_date:
            continue
        
        # 匹配训练动作和组数
        # 格式：动作名 重量*次数 或 动作名 次数
        exercise_match = re.match(r'([\u4e00-\u9fa5a-zA-Z]+)\s*[:：]?\s*(.+)', line)
        if exercise_match:
            exercise_name_raw = exercise_match.group(1).strip()
            sets_data = exercise_match.group(2).strip()
            
            # 标准化动作名称（先尝试完整匹配，再尝试部分匹配）
            exercise_name = exercise_mapping.get(exercise_name_raw, None)
            if not exercise_name:
                # 尝试部分匹配
                for key, value in exercise_mapping.items():
                    if key in exercise_name_raw or exercise_name_raw in key:
                        exercise_name = value
                        break
                if not exercise_name:
                    exercise_name = exercise_name_raw
            
            # 获取身体部位
            body_part = body_part_mapping.get(exercise_name, '其他')
            
            # 解析每一组的数据
            set_items = sets_data.split()
            
            for item in set_items:
                item = item.strip().rstrip(',')
                if not item:
                    continue
                
                weight = 0
                reps = 0
                
                # 检查是否是双手重量格式 (2*15*8)
                double_match = re.match(r'2\*(\d+(?:\.\d+)?)\*(\d+)', item)
                if double_match:
                    weight = float(double_match.group(1))
                    reps = int(double_match.group(2))
                else:
                    # 检查是否有重量*次数
                    weight_reps_match = re.match(r'(-?\d+(?:\.\d+)?)\*(\d+)', item)
                    if weight_reps_match:
                        weight = abs(float(weight_reps_match.group(1)))  # 负数转正数
                        reps = int(weight_reps_match.group(2))
                    else:
                        # 只有次数（如引体向上、臂屈伸）
                        try:
                            reps = int(item)
                            weight = 0
                        except:
                            continue
                
                volume = weight * reps
                
                records.append({
                    'date': current_date,
                    'exercise': exercise_name,
                    'weight': weight,
                    'sets': 1,
                    'reps': reps,
                    'volume': volume,
                    'body_part': body_part
                })
    
    return records

# 读取您的完整训练记录
with open('d:/学习/健身/strength_records.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 解析记录
records = parse_strength_records_from_text(content)

print(f"✅ 成功解析 {len(records)} 条训练记录\n")
print("示例数据（前10条）:")
for i, r in enumerate(records[:10], 1):
    print(f"  {i}. {r['date']} | {r['exercise']:12s} | {r['weight']:6.1f}kg × {r['reps']:2d}次 | 容量:{r['volume']:6.0f} | {r['body_part']}")

# 统计信息
print(f"\n📊 数据统计:")
print(f"  - 总训练次数: {len(records)} 组")
print(f"  - 时间跨度: {records[0]['date']} 至 {records[-1]['date']}")

exercises = set(r['exercise'] for r in records)
print(f"  - 不同动作数: {len(exercises)}")
print(f"  - 动作列表: {', '.join(sorted(exercises))}")

body_parts = {}
for r in records:
    bp = r['body_part']
    body_parts[bp] = body_parts.get(bp, 0) + 1
print(f"\n  各部位训练分布:")
for bp, count in sorted(body_parts.items(), key=lambda x: x[1], reverse=True):
    print(f"    - {bp}: {count} 组")

# 写入CSV
csv_lines = ['日期,动作,重量,组数,次数,容量,部位']
for record in records:
    csv_line = f"{record['date']},{record['exercise']},{record['weight']},{record['sets']},{record['reps']},{record['volume']:.0f},{record['body_part']}"
    csv_lines.append(csv_line)

output_path = 'd:/学习/健身/fitness-knowledge-base/data/your_data/your_strength_data.csv'
with open(output_path, 'w', encoding='utf-8-sig') as f:
    f.write('\n'.join(csv_lines))

print(f"\n✅ CSV文件已保存到: {output_path}")
print(f"   共 {len(records)} 条记录")
