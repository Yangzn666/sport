#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速发送邮件脚本 - 用于发送运动训练分析报告
使用说明：
1. 登录QQ邮箱网页版
2. 进入 设置 → 账户 → POP3/IMAP/SMTP服务
3. 开启 IMAP/SMTP 服务
4. 获取授权码（16位字符串）
5. 运行此脚本并输入授权码
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# 配置信息
SENDER_EMAIL = "2142744149@qq.com"
RECEIVER_EMAIL = "2142744149@qq.com"
SMTP_SERVER = "smtp.qq.com"
SMTP_PORT = 587

def send_report_email():
    """发送报告邮件"""
    print("=" * 80)
    print("运动训练分析报告 - 邮件发送工具")
    print("=" * 80)
    print()
    
    # 读取报告文件
    report_files = [
        "运动训练综合分析报告_20260531_001714.txt",
    ]
    
    if not report_files:
        print("❌ 未找到报告文件")
        return
    
    report_file = report_files[0]
    print(f"📄 找到报告文件: {report_file}")
    print()
    
    try:
        with open(report_file, 'r', encoding='utf-8') as f:
            report_content = f.read()
        print(f"✓ 报告内容已读取 ({len(report_content)} 字符)")
    except Exception as e:
        print(f"❌ 读取报告文件失败: {e}")
        return
    
    print()
    
    # 获取授权码
    print("⚠️  重要提示:")
    print("请确保您已开启QQ邮箱的SMTP服务并获取授权码")
    print()
    
    auth_code = input("请输入QQ邮箱授权码（16位）: ").strip()
    
    if not auth_code or len(auth_code) != 16:
        print("❌ 授权码格式不正确（应为16位字符串）")
        return
    
    print()
    print("正在连接邮件服务器...")
    
    try:
        # 创建邮件
        msg = MIMEMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECEIVER_EMAIL
        msg['Subject'] = f"【运动训练综合分析报告】{datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        # 添加邮件内容
        text_part = MIMEText(report_content, 'plain', 'utf-8')
        msg.attach(text_part)
        
        # 连接SMTP服务器
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1)  # 显示调试信息
        server.starttls()
        
        print("✓ TLS加密连接已建立")
        
        # 登录
        server.login(SENDER_EMAIL, auth_code)
        print("✓ 登录成功")
        
        # 发送邮件
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        print("✓ 邮件发送成功")
        
        # 关闭连接
        server.quit()
        print("✓ 连接已关闭")
        
        print()
        print("=" * 80)
        print("✅ 报告已成功发送至: " + RECEIVER_EMAIL)
        print("=" * 80)
        print()
        print("请检查您的QQ邮箱收件箱（包括垃圾邮件文件夹）")
        
    except smtplib.SMTPAuthenticationError:
        print()
        print("=" * 80)
        print("❌ 认证失败！")
        print("=" * 80)
        print()
        print("可能原因:")
        print("1. 授权码错误（请重新获取）")
        print("2. 未开启SMTP服务")
        print("3. 授权码已过期")
        print()
        print("解决方法:")
        print("1. 登录 https://mail.qq.com")
        print("2. 设置 → 账户 → POP3/IMAP/SMTP服务")
        print("3. 确认已开启 IMAP/SMTP 服务")
        print("4. 重新生成授权码")
        
    except smtplib.SMTPException as e:
        print()
        print("=" * 80)
        print(f"❌ SMTP错误: {e}")
        print("=" * 80)
        
    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ 发送失败: {e}")
        print("=" * 80)
        print()
        print("报告文件已保存在:")
        print(f"  {report_file}")
        print()
        print("您可以:")
        print("1. 手动复制报告内容通过QQ邮箱发送")
        print("2. 将报告文件作为附件发送")
        print("3. 检查网络连接后重试")

if __name__ == "__main__":
    send_report_email()
