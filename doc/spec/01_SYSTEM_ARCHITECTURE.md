# 系統架構與後端規格說明 (01_SYSTEM_ARCHITECTURE.md)

本文件定義「專案與 RFI 追蹤系統 (OpenTrack)」的整體架構、資料持久化層與前後端通訊機制。

---

## 1. 系統架構概覽

本專案為前後端分離之全端架構：
- **前端展示層 (Frontend)**：React 19 + TypeScript + Vite，配合 Tailwind CSS v4 與 Motion 呈現包浩斯（Bauhaus）風格。
- **後端服務層 (Backend API)**：Node.js + Express，提供標準 RESTful API。
- **資料持久化層 (Database)**：本地檔案型 **SQLite (`database.sqlite`)**，使用 Node.js 內建高效能 `node:sqlite (DatabaseSync)` 驅動。

```text
[ React UI 前端 ] (Port 3000)
       │
       │ Vite Proxy 轉發 /api/*
       ▼
[ Express API 後端 ] (Port 3001)
       │
       │ DatabaseSync 讀寫
       ▼
[ database.sqlite ] (本地資料庫檔案)
```

---

## 2. 資料庫結構 (Database Schema)

### 2.1 專案表 `projects`
- `id` (TEXT, PK)：專案識別碼。
- `name` (TEXT)：專案名稱。
- `key_code` (TEXT)：專案代碼縮寫（如 `ERP`）。
- `description` (TEXT)：專案描述。
- `created_at` (TEXT)：建立時間 ISO 字串。

### 2.2 使用者表 `users`
- `id` (TEXT, PK)：使用者 ID。
- `email` (TEXT)：電子郵件。
- `name` (TEXT)：顯示名稱與角色標籤。
- `avatar_url` (TEXT)：頭像圖片連結。

### 2.3 看板欄位表 `board_columns`
- `id` (TEXT, PK)：欄位 ID。
- `project_id` (TEXT)：所屬專案 ID。
- `title` (TEXT)：欄位標題（如 To Do, In Progress, Under Review, Done）。
- `position` (INTEGER)：欄位排序索引。
- `wip_limit` (INTEGER)：在製品（WIP）數量上限限制（0 代表無限制）。

### 2.4 任務與 RFI 表 `tasks`
- `id` (TEXT, PK)：任務/RFI UUID。
- `project_id` (TEXT)：所屬專案。
- `column_id` (TEXT)：當前所在看板欄位 ID。
- `task_type` (TEXT)：`'TASK'` 或 `'RFI'`。
- `rfi_code` (TEXT, 可空)：RFI 編號（如 `RFI-2026-001`）。
- `title` (TEXT)：標題。
- `description` (TEXT)：內容描述。
- `official_answer` (TEXT, 可空)：官方/建築師正式回覆。
- `status` (TEXT)：狀態（`'OPEN'` | `'IN_PROGRESS'` | `'IN_REVIEW'` | `'RESOLVED'` | `'CLOSED'` | `'REJECTED'`）。
- `priority` (TEXT)：優先級（`'LOW'` | `'MEDIUM'` | `'HIGH'` | `'URGENT'`）。
- `position` (INTEGER)：欄內排序權重。
- `start_date` (TEXT, 可空)：預計開始時間。
- `due_date` (TEXT, 可空)：截止時間。
- `creator_id` (TEXT)：建立者 ID。
- `assignee_ids` (TEXT)：負責人 ID 陣列（儲存為 JSON 字串）。
- `created_at` (TEXT)：建立時間。
- `updated_at` (TEXT)：更新時間。

### 2.5 附件表 `attachments`
- `id` (TEXT, PK)：附件 UUID。
- `task_id` (TEXT)：所屬任務/RFI ID。
- `uploader_id` (TEXT)：上傳者 ID。
- `file_name` (TEXT)：檔案名稱。
- `file_url` (TEXT)：檔案資料 URL 或路徑。
- `file_size` (INTEGER)：檔案位元組大小。
- `mime_type` (TEXT)：MIME 類型。
- `is_inline_image` (INTEGER)：是否為剪貼簿內嵌圖片（1 為是，0 為否）。
- `created_at` (TEXT)：建立時間。

---

## 3. RESTful API 規範

| 方法 | 路徑 | 說明 |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | 取得專案清單 |
| `GET` | `/api/users` | 取得使用者名單 |
| `GET` | `/api/columns` | 取得看板欄位與 WIP 設定 |
| `GET` | `/api/tasks` | 取得所有任務與 RFI |
| `POST` | `/api/tasks` | 新增任務或 RFI |
| `PATCH` | `/api/tasks/:id` | 更新任務（移動欄位、變更狀態、官方回覆等） |
| `GET` | `/api/attachments` | 取得附件清單 |
| `POST` | `/api/attachments` | 新增圖檔附件 |

---

## 4. 前端狀態同步機制

前端 `src/store.ts` 採用 **樂觀更新 (Optimistic UI Update)** 策略：
1. 當使用者拖曳任務卡片或點擊儲存回覆時，React 狀態立即更新，確保畫面反應即時流暢。
2. 同步發送非同步 `PATCH` / `POST` 請求給後端寫入 SQLite。
3. 重新整理頁面或換瀏覽器開啟時，前端自動調用 API 重新由 SQLite 載入最新狀態。
