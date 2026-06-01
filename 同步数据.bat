@echo off
echo ========================================
echo   数据同步脚本
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/2] 同步数据到个人追踪器...
xcopy "fitness-knowledge-base\data\your_data\*" "personal-fitness-tracker\public\your_data\" /E /I /Y
if %errorlevel% equ 0 (
    echo ✓ 个人追踪器数据同步成功
) else (
    echo ✗ 个人追踪器数据同步失败
)

echo.
echo [2/2] 同步数据到备份目录...
xcopy "fitness-knowledge-base\data\your_data\*" "personal-fitness-tracker\data\your_data\" /E /I /Y
if %errorlevel% equ 0 (
    echo ✓ 备份数据同步成功
) else (
    echo ✗ 备份数据同步失败
)

echo.
echo ========================================
echo   同步完成！
echo ========================================
echo.
echo 现在可以启动个人追踪器：
echo   cd personal-fitness-tracker
echo   npm run dev
echo.
pause
