@echo off
echo ========================================
echo   个人健身数据追踪器 - 启动脚本
echo ========================================
echo.
echo 正在启动网站...
echo 端口: http://localhost:5182
echo.
echo 按 Ctrl+C 停止服务器
echo.

cd /d "%~dp0"
npm run dev
