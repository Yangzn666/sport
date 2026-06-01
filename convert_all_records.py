# 读取原始记录文件
with open('d:/学习/健身/记录.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 解析记录
records = []
i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # 查找日期行
    if line and '.' in line and len(line) == 10:  # 格式如 2026.05.18
        try:
            date = line
            time_str = lines[i+1].strip() if i+1 < len(lines) else ''
            kcal = lines[i+2].strip() if i+2 < len(lines) else ''
            distance_str = lines[i+3].strip() if i+3 < len(lines) else ''
            pace_str = lines[i+4].strip() if i+4 < len(lines) else ''
            hr_str = lines[i+5].strip() if i+5 < len(lines) else ''
            cadence_str = lines[i+6].strip() if i+6 < len(lines) else ''
            
            # 提取数据
            if 'km' in distance_str and 'kcal' in kcal:
                # 时间转换
                h, m, s = map(int, time_str.split(':'))
                time_minutes = h * 60 + m + s / 60
                
                # 距离
                distance = float(distance_str.replace('km', ''))
                
                # 配速转换
                pace_clean = pace_str.replace("''", '').replace("'", '').replace('m:s/km', '').strip()
                if "'" in pace_clean:
                    parts = pace_clean.split("'")
                    pace_min = int(parts[0])
                    pace_sec = int(parts[1]) if len(parts) > 1 else 0
                    pace_decimal = pace_min + pace_sec / 60
                else:
                    pace_decimal = 0
                
                # 心率
                if hr_str == '--':
                    hr_value = '--'
                else:
                    hr_value = str(int(float(hr_str.replace('bpm', ''))))
                
                # 步频
                cadence = cadence_str.replace('步/分钟', '')
                
                # 判断类型
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
                
                # 日期格式转换
                date_formatted = date.replace('.', '-')
                
                records.append({
                    'date': date_formatted,
                    'distance': distance,
                    'time': round(time_minutes, 2),
                    'pace': round(pace_decimal, 2),
                    'heart_rate': hr_value,
                    'type': run_type,
                    'cadence': cadence
                })
                
                i += 7  # 跳过已处理的行
                continue
        except:
            pass
    
    i += 1

# 写入CSV
csv_lines = ['日期,距离,时间,配速,心率,类型,步频']
for record in records:
    csv_line = f"{record['date']},{record['distance']},{record['time']},{record['pace']},{record['heart_rate']},{record['type']},{record['cadence']}"
    csv_lines.append(csv_line)

with open('d:/学习/健身/fitness-knowledge-base/data/your_data/your_running_data.csv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(csv_lines))

print(f'成功转换 {len(records)} 条记录')
print(f'第一条: {records[0] if records else "无"}')
print(f'最后一条: {records[-1] if records else "无"}')
