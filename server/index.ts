import express from 'express';
import cors from 'cors';
import { db, initDatabase } from './db.js';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 專案 API
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all();
  res.json(projects);
});

// 使用者 API
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

// 看板欄位 API
app.get('/api/columns', (req, res) => {
  const columns = db.prepare('SELECT * FROM board_columns ORDER BY position ASC').all();
  res.json(columns);
});

// 任務 / RFI API
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY position ASC').all() as any[];
  const formatted = tasks.map(t => ({
    ...t,
    assignee_ids: t.assignee_ids ? JSON.parse(t.assignee_ids) : [],
  }));
  res.json(formatted);
});

app.post('/api/tasks', (req, res) => {
  const {
    id, project_id, column_id, task_type, rfi_code, title, description,
    official_answer, status, priority, position, start_date, due_date,
    creator_id, assignee_ids, created_at, updated_at
  } = req.body;

  const insert = db.prepare(`
    INSERT INTO tasks (
      id, project_id, column_id, task_type, rfi_code, title, description,
      official_answer, status, priority, position, start_date, due_date,
      creator_id, assignee_ids, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id, project_id, column_id, task_type, rfi_code || null, title, description || null,
    official_answer || null, status, priority, position, start_date || null, due_date || null,
    creator_id, JSON.stringify(assignee_ids || []), created_at, updated_at
  );

  res.status(201).json(req.body);
});

app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const now = new Date().toISOString();

  const allowedFields = [
    'column_id', 'task_type', 'rfi_code', 'title', 'description',
    'official_answer', 'status', 'priority', 'position', 'start_date',
    'due_date', 'creator_id', 'assignee_ids'
  ];

  const setClauses: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      if (field === 'assignee_ids') {
        values.push(JSON.stringify(updates[field]));
      } else {
        values.push(updates[field]);
      }
    }
  }

  values.push(id);
  const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
  if (updatedTask) {
    updatedTask.assignee_ids = updatedTask.assignee_ids ? JSON.parse(updatedTask.assignee_ids) : [];
  }
  res.json(updatedTask);
});

// 附件 API
app.get('/api/attachments', (req, res) => {
  const attachments = db.prepare('SELECT * FROM attachments').all() as any[];
  const formatted = attachments.map(a => ({
    ...a,
    is_inline_image: Boolean(a.is_inline_image)
  }));
  res.json(formatted);
});

app.post('/api/attachments', (req, res) => {
  const {
    id, task_id, uploader_id, file_name, file_url,
    file_size, mime_type, is_inline_image, created_at
  } = req.body;

  const insert = db.prepare(`
    INSERT INTO attachments (
      id, task_id, uploader_id, file_name, file_url,
      file_size, mime_type, is_inline_image, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id, task_id, uploader_id, file_name, file_url,
    file_size, mime_type, is_inline_image ? 1 : 0, created_at
  );

  res.status(201).json(req.body);
});

app.listen(PORT, () => {
  console.log(`[SQLite Backend] Server listening on http://localhost:${PORT}`);
});
