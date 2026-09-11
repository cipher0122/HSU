# 專案 AI 代理人開發規範 (AGENTS.md)

本文件定義本專案中 AI Assistant / Agent 開發者與人類協作時必須遵守的行為規範與工作流。

---

## 🎯 核心工作流原則 (Workflows)

### 1. 先討論、後計畫、再實作 (Plan First)
- **禁止未經規劃直接盲改核心功能**。
- 開發任何非輕量修正之新功能前，必須：
  1. 與使用者充份討論並確認需求細節與介面行為。
  2. 在 `doc/dev/` 底下建立 `plan_<功能名稱>.md`。
  3. 計畫內容必須包含：
     - 目標描述 (Goal)
     - 規格設計 (Architecture & Data Model)
     - 預計異動與新增之檔案清單 (Proposed Changes)
     - 驗證與測試計畫 (Verification Plan)
  4. 獲得使用者確認後，始可參照該計畫開始撰寫程式碼。

### 2. 開發完成後回寫規格 (Sync to Spec)
- 功能開發完成且通過驗證後，必須將正式功能規格與行為細節更新至 `doc/spec/` 目錄中對應的章節檔案。
- `doc/spec/` 必須按章節分類（如 `01_SYSTEM_ARCHITECTURE.md`、`02_WORK_PACKAGES.md`、`03_RFI_TRACKER.md` 等），保持規格與實際程式碼的高度一致性。

### 3. 設計系統遵循 (Design Compliance)
- 所有新增或重構的 UI 元件必須嚴格參照 [DESIGN.md](file:///c:/Users/jun/Desktop/傳送門/RFI%20TRACK/HSU/DESIGN.md)。
- 保持包浩斯（Bauhaus）/ 新野獸派（Neo-Brutalism）幾何純粹性、粗黑邊框與硬邊陰影規範。

---

## 🛠️ 開發指令與環境操作

- **啟動開發伺服器**：`npm run dev`（或於 Windows 雙擊 `start-server.bat`）
- **TypeScript 型別檢查**：`npm run lint`（執行 `tsc --noEmit`）
- **專案打包編譯**：`npm run build`
- **關閉伺服器**：執行 `stop-server.bat` 釋放 Port 3000

---

## 📝 檔案結構約束

```text
HSU/
├── doc/
│   ├── dev/            # 開發計畫存放區 (plan_<功能名稱>.md)
│   └── spec/           # 正式功能規格說明 (分章節 .md)
├── src/
│   ├── components/     # UI 元件 (kanban, gantt, rfi, modals)
│   ├── types.ts        # 全域型別定義
│   ├── store.ts        # 狀態管理
│   └── ...
├── DESIGN.md           # 視覺與設計系統指南
├── AGENTS.md           # 本規範文件
├── start-server.bat    # Windows 啟動腳本
└── stop-server.bat     # Windows 關閉腳本
```
