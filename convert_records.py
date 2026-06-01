import re

# 读取原始记录文件
with open('d:/学习/健身/记录.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 使用正则表达式提取每条跑步记录
# 格式：日期、时间、卡路里、距离、配速、心率、步频
pattern = r'(\d{4}\.\d{2}\.\d{2})\s*\n\s*(\d{2}:\d{2}:\d{2})\s*\n\s*(\d+)kcal\s*\n\s*([\d.]+)km\s*\n\s*(\d+\'?\d*\'?m:s/km)\s*\n\s*([-\d.]+bpm|--)\s*\n\s*(\d+)步/分钟'

matches = re.findall(pattern, content)

# 转换为CSV格式
csv_lines = ['日期,距离,时间,配速,心率,类型,步频']

for match in matches:
    date_str = match[0].replace('.', '-')
    time_str = match[1]
    # 将时间转换为分钟
    h, m, s = map(int, time_str.split(':'))
    time_minutes = h * 60 + m + s / 60
    
    distance = float(match[3])
    
    # 解析配速（分:秒/km）
    pace_str = match[4].replace("''", '').replace("'", '')
    if 'm:s/km' in pace_str:
        pace_str = pace_str.replace('m:s/km', '').strip()
    pace_parts = pace_str.split("'")
    if len(pace_parts) == 2:
        pace_min = int(pace_parts[0])
        pace_sec = int(pace_parts[1])
        pace_decimal = pace_min + pace_sec / 60
    else:
        pace_decimal = 0
    
    # 心率
    heart_rate = match[5]
    if heart_rate == '--':
        hr_value = '--'
    else:
        hr_value = str(int(float(heart_rate.replace('bpm', ''))))
    
    # 步频
    cadence = match[6]
    
    # 根据距离和配速判断类型
    if distance >= 20:
        run_type = '半马比赛'
    elif distance >= 15:
        run_type = '长距离'
    elif pace_decimal < 4.5:
        run_type = '间歇跑'
    elif pace_decimal < 5.0:
        run_type = '节奏跑'
    elif pace_decimal > 6.5 or (hr_value != '--' and int(hr_value) < 130):
        run_type = '恢复跑'
    else:
        run_type = '轻松跑'
    
    csv_line = f'{date_str},{distance},{time_minutes:.2f},{pace_decimal:.2f},{hr_value},{run_type},{cadence}'
    csv_lines.append(csv_line)

# 写入CSV文件
with open('d:/学习/健身/fitness-knowledge-base/data/your_data/your_running_data.csv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(csv_lines))

print(f'成功转换 {len(matches)} 条记录')
