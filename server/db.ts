import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
export const db = new DatabaseSync(dbPath);

// 初始化資料表
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_code TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT
    );

    CREATE TABLE IF NOT EXISTS board_columns (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL,
      wip_limit INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      column_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
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
      assignee_ids TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

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
  `);

  // 種子資料檢查與植入
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, email, name, avatar_url) VALUES (?, ?, ?, ?)');
    insertUser.run('u1', 'alice@example.com', 'Alice (PM)', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice');
    insertUser.run('u2', 'bob@example.com', 'Bob (Engineer)', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob');
    insertUser.run('u3', 'charlie@example.com', 'Charlie (Client)', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie');
  }

  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectCount.count === 0) {
    const insertProject = db.prepare('INSERT INTO projects (id, name, key_code, created_at) VALUES (?, ?, ?, ?)');
    insertProject.run('p1', '企業 ERP 升級專案', 'ERP', new Date().toISOString());
  }

  const columnCount = db.prepare('SELECT COUNT(*) as count FROM board_columns').get() as { count: number };
  if (columnCount.count === 0) {
    const insertCol = db.prepare('INSERT INTO board_columns (id, project_id, title, position, wip_limit) VALUES (?, ?, ?, ?, ?)');
    insertCol.run('c1', 'p1', 'To Do', 1000, 0);
    insertCol.run('c2', 'p1', 'In Progress', 2000, 3);
    insertCol.run('c3', 'p1', 'Under Review', 3000, 0);
    insertCol.run('c4', 'p1', 'Done', 4000, 0);
  }

  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (taskCount.count === 0) {
    const today = new Date();
    const todayStr = today.toISOString();
    const nextWeekStr = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const nextTwoWeeksStr = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const prevWeekStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, project_id, column_id, task_type, rfi_code, title, description,
        official_answer, status, priority, position, start_date, due_date,
        creator_id, assignee_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run(
      't1', 'p1', 'c1', 'TASK', null, '資料庫 Schema 設計', '請依照規格書建立實體關聯圖。',
      null, 'OPEN', 'HIGH', 1000, todayStr, nextWeekStr,
      'u1', JSON.stringify(['u2']), todayStr, todayStr
    );

    insertTask.run(
      't2', 'p1', 'c2', 'RFI', 'RFI-2026-001', '確認登入驗證 API 規格', '前端需要確認 SSO 登入的跳轉流程與 Token 格式。',
      null, 'IN_REVIEW', 'URGENT', 2000, prevWeekStr, todayStr,
      'u2', JSON.stringify(['u1', 'u3']), prevWeekStr, todayStr
    );

    insertTask.run(
      't3', 'p1', 'c1', 'TASK', null, '實作看板拖曳功能', '使用 dnd-kit 實作拖曳排序',
      null, 'OPEN', 'MEDIUM', 3000, nextWeekStr, nextTwoWeeksStr,
      'u2', JSON.stringify(['u2']), todayStr, todayStr
    );
  }
}
