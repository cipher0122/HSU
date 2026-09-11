# 功能開發計畫：改用 SQLite 後端資料庫 (plan_sqlite_backend.md)

本文件依據 AGENTS.md 規範撰寫，旨在將現行前端基於 localStorage 的暫存架構，遷移至由本地 SQLite 資料庫驅動的真正持久化全端系統。

---

## 🎯 1. 目標描述 (Goal)

- **現狀**：目前專案資料（專案、成員、看板欄位、任務 Task、RFI、附件）保存在瀏覽器的 `localStorage` 中。換瀏覽器、無痕模式或清除快取時資料會重置或遺失，無法跨裝置或多人真正協同。
- **目標**：
  1. 引入 SQLite 本地檔案型資料庫（如 `database.sqlite`），無需另外安裝 MySQL 或 PostgreSQL 伺服器，輕量、單檔易備份且效能極高。
  2. 使用專案中已安裝的 `express` 提供 RESTful API 路由（`/api/tasks`, `/api/columns`, `/api/projects`, `/api/users`, `/api/attachments`）。
  3. 前端以非同步 API Client 取代原本同步的 `localStorage` 讀寫，維持 UI 操作響應流暢。
  4. 更新 `start-server.bat` 與 `stop-server.bat`，確保一鍵同時啟動/關閉 Vite 前端（Port 3000）與 Express 後端（Port 3001）。

---

## 🏗️ 2. 系統架構與資料模型設計 (Architecture & Data Model)

### 2.1 技術選型
- **後端執行環境**：Node.js + Express (專案已具備 `express` 與 `@types/express`) + `better-sqlite3`（或純 Node 支援之 SQLite 套件）。
- **API 埠號分配**：
  - 前端：Vite Dev Server (Port 3000)，透過 Vite Proxy 將 `/api` 轉發至後端。
  - 後端：Express Server (Port 3001)。

### 2.2 SQLite 資料庫結構 (Schema)

```sql
-- 專案表
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_code TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

-- 使用者表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT
);

-- 看板欄位表
CREATE TABLE IF NOT EXISTS board_columns (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  wip_limit INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 任務 / RFI 表
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  column_id TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'TASK' | 'RFI'
  rfi_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  official_answer TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  position INTEGER NOT NULL,
  start_date TEXT,
  due_date TEXT,
  creator_id TEXT NOT NULL,
  assignee_ids TEXT, -- JSON 字串陣列
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 附件表
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_inline_image INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

---

## 📝 3. 預計異動與新增檔案清單 (Proposed Changes)

1. **後端模組 [NEW]**
   - `server/db.ts`：SQLite 連線、自動初始化 Table 與 Seed 初始資料（若為空）。
   - `server/index.ts`：Express 伺服器入口、REST API 端點（CRUD for projects, users, columns, tasks, attachments）。
2. **依賴管理 [MODIFY]**
   - `package.json`：新增 `better-sqlite3`（及 `@types/better-sqlite3`）、`cors` 等必要依賴；新增後端啟動 script `npm run server`。
3. **前端整合 [MODIFY]**
   - `vite.config.ts`：配置 `server.proxy`，將 `/api` 代理到 `http://localhost:3001`。
   - `src/api.ts` [NEW]：封裝前後端通訊的 API 函式。
   - `src/store.ts` [MODIFY]：由讀取 `localStorage` 改為透過 API 向後端非同步取得與更新資料。
4. **腳本與環境 [MODIFY]**
   - `start-server.bat`：一鍵同時啟動後端與前端伺服器。
   - `stop-server.bat`：同時釋放 Port 3000 (前端) 與 Port 3001 (後端) 的程序。

---

## 🧪 4. 驗證與測試計畫 (Verification Plan)

1. **資料庫初始化驗證**：啟動後端確認 `database.sqlite` 自動建立，且預設使用者與初始卡片成功寫入。
2. **API 端點驗證**：以 PowerShell/curl 測試 GET/POST/PATCH `/api/tasks` 讀寫正常。
3. **前端功能驗證**：
   - 看板拖曳任務排序/換欄，重新整理頁面後位置保持不變。
   - 新增 RFI 與填寫 Official Answer，資料確實驗收寫入 SQLite。
   - 上傳/貼上附件，確認資料庫與畫面同步更新。
4. **腳本與型別檢查**：
   - 執行 `npm run lint` 確保 TypeScript 編譯無誤。
   - 執行 `stop-server.bat` 與 `start-server.bat` 驗證一鍵啟閉功能正常。
