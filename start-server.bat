@echo off
chcp 65001 >nul
title 啟動 RFI 專案伺服器

echo ========================================================
echo       正在啟動 專案與 RFI 追蹤系統 (OpenTrack)...
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

echo [提示] 正在啟動 Vite 伺服器 (http://localhost:3000)...
echo [提示] 瀏覽器將會自動開啟。若要停止伺服器，可直接關閉此視窗或執行 stop-server.bat。
echo.

npm run dev
