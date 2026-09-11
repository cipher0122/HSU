@echo off
chcp 65001 >nul
title 關閉 RFI 專案伺服器

echo ========================================================
echo       正在停止 專案與 RFI 追蹤系統伺服器 (Port 3000)...
echo ========================================================
echo.

set PORT=3000
set FOUND=0

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set PID=%%a
    set FOUND=1
)

if "%FOUND%"=="1" (
    echo [提示] 偵測到正在監聽 Port %PORT% 的程序 (PID: %PID%)，正在關閉...
    taskkill /F /PID %PID% >nul 2>&1
    echo [成功] 伺服器已成功關閉！
) else (
    echo [提示] 目前 Port %PORT% 沒有正在運行的伺服器程序。
)

echo.
echo 請按任意鍵結束...
pause >nul
