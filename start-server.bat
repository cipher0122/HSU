@echo off
chcp 65001 >nul
title 啟動 RFI 專案全端伺服器 (SQLite + Vite)

echo ========================================================
echo   正在啟動 專案與 RFI 追蹤系統 (SQLite 後端 + 前端)
echo ========================================================
echo.

cd /d "%~dp0"

:: 檢查 node_modules 是否存在
if not exist "node_modules\" (
    echo [提示] 尚未安裝依賴套件，正在自動執行 npm install...
    call npm install
    if errorlevel 1 (
        echo [錯誤] 依賴安裝失敗，請檢查網路連線或 Node.js 設定。
        pause
        exit /b 1
    )
)

echo [提示] 正在啟動 SQLite 後端 API (http://localhost:3001)...
start "RFI Backend API (Port 3001)" /B npm run server

:: 稍候 1 秒確保後端連線準備好
timeout /t 1 /nobreak >nul

echo [提示] 正在啟動 Vite 前端伺服器 (http://localhost:3000)...
echo [提示] 瀏覽器將會自動開啟。若要停止所有服務，請執行 stop-server.bat。
echo.

npm run dev
