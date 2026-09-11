@echo off
chcp 65001 >nul
title 關閉 RFI 專案全端伺服器

echo ========================================================
echo   正在停止 專案與 RFI 追蹤系統伺服器 (Port 3000 & 3001)
echo ========================================================
echo.

:: 停止 Port 3000 (Vite 前端)
set PORT1=3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT1% " ^| findstr "LISTENING"') do (
    echo [提示] 偵測到前端 Port %PORT1% 程序 (PID: %%a)，正在關閉...
    taskkill /F /PID %%a >nul 2>&1
)

:: 停止 Port 3001 (SQLite 後端 API)
set PORT2=3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT2% " ^| findstr "LISTENING"') do (
    echo [提示] 偵測到後端 Port %PORT2% 程序 (PID: %%a)，正在關閉...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [成功] 所有前端與後端伺服器已安全停止！
echo 請按任意鍵結束...
pause >nul
