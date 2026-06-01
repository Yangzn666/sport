import re
from datetime import datetime

# 读取原始记录
with open('d:/学习/健身/strength_records.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 解析逻辑
records = []
current_date = None

lines = content.split('\n')
for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # 匹配日期（如：11月17日, 3月3日, 1月1日）
    date_match = re.match(r'(\d{1,2})月(\d{1,2})日', line)
    if date_match:
        month = int(date_match.group(1))
        day = int(date_match.group(2))
        # 根据上下文推断年份（大部分是2024-2026）
        if month >= 11:
            year = 2024
        elif month <= 2:
            year = 2025
        else:
            year = 2025  # 3-10月默认为2025，后续可根据实际调整
        
        current_date = f"{year}-{month:02d}-{day:02d}"
        continue
    
    if not current_date:
        continue
    
    # 匹配训练动作和组数
    # 格式如：横杆下拉 35*8 40*8 40*8
    # 或：引体向上 8 5 8 4 5 3 (只有次数)
    exercise_match = re.match(r'([\u4e00-\u9fa5a-zA-Z]+)\s+(.+)', line)
    if exercise_match:
        exercise_name = exercise_match.group(1).strip()
        sets_data = exercise_match.group(2).strip()
        
        # 解析每一组的数据
        # 情况1: 重量*次数 (如 35*8)
        # 情况2: 只有次数 (如 8)
        # 情况3: 负重量 (如 -20*10)
        # 情况4: 双手重量 (如 2*15*8)
        
        set_items = sets_data.split()
        
        for item in set_items:
            item = item.strip()
            if not item:
                continue
            
            weight = 0
            reps = 0
            
            # 检查是否是双手重量格式 (2*15*8)
            double_match = re.match(r'2\*(\d+)\*(\d+)', item)
            if double_match:
                weight = float(double_match.group(1))
                reps = int(double_match.group(2))
            else:
                # 检查是否有重量*次数
                weight_reps_match = re.match(r'(-?\d+)\*(\d+)', item)
                if weight_reps_match:
                    weight = float(weight_reps_match.group(1))
                    reps = int(weight_reps_match.group(2))
                else:
                    # 只有次数（如引体向上）
                    try:
                        reps = int(item)
                        weight = 0
                    except:
                        continue
            
            # 判断身体部位
            body_part = '其他'
            if any(kw in exercise_name for kw in ['胸', '推胸', '夹胸', '飞鸟', '臂屈伸']):
                body_part = '胸部'
            elif any(kw in exercise_name for kw in ['背', '引体', '下拉', '划船', '飞鸟']):
                body_part = '背部'
            elif any(kw in exercise_name for kw in ['腿', '深蹲', '踢腿', '夹腿', '开腿', '哈克']):
                body_part = '腿部'
            elif any(kw in exercise_name for kw in ['肩', '推肩', '侧平举', '面拉']):
                body_part = '肩部'
            elif any(kw in exercise_name for kw in ['弯举', '二头']):
                body_part = '手臂'
            elif any(kw in exercise_name for kw in ['三头', '臂屈伸']):
                body_part = '手臂'
            elif any(kw in exercise_name for kw in ['腹', '卷腹']):
                body_part = '核心'
            
            records.append({
                'date': current_date,
                'exercise': exercise_name,
                'weight': weight,
                'reps': reps,
                'sets': 1,  # 每条记录代表一组
                'volume': weight * reps,
                'body_part': body_part
            })

# 写入CSV
csv_lines = ['日期,动作,重量,组数,次数,容量,部位']
for record in records:
    csv_line = f"{record['date']},{record['exercise']},{record['weight']},{record['sets']},{record['reps']},{record['volume']:.0f},{record['body_part']}"
    csv_lines.append(csv_line)

with open('d:/学习/健身/fitness-knowledge-base/data/your_data/your_strength_data.csv', 'w', encoding='utf-8-sig') as f:
    f.write('\n'.join(csv_lines))

print(f'成功转换 {len(records)} 条训练记录')
print(f'示例数据:')
for r in records[:5]:
    print(f"  {r['date']} | {r['exercise']} | {r['weight']}kg x {r['reps']}次 | {r['body_part']}")
