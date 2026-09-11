import { useState, useEffect } from 'react';
import { Project, BoardColumn, Task, User, Attachment } from './types';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_USERS: User[] = [
  { id: 'u1', email: 'alice@example.com', name: 'Alice (PM)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'u2', email: 'bob@example.com', name: 'Bob (Engineer)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: 'u3', email: 'charlie@example.com', name: 'Charlie (Client)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: '企業 ERP 升級專案', key_code: 'ERP', created_at: new Date().toISOString() },
];

const INITIAL_COLUMNS: BoardColumn[] = [
  { id: 'c1', project_id: 'p1', title: 'To Do', position: 1000, wip_limit: 0 },
  { id: 'c2', project_id: 'p1', title: 'In Progress', position: 2000, wip_limit: 3 },
  { id: 'c3', project_id: 'p1', title: 'Under Review', position: 3000, wip_limit: 0 },
  { id: 'c4', project_id: 'p1', title: 'Done', position: 4000, wip_limit: 0 },
];

const today = new Date();
const todayStr = today.toISOString();
const nextWeekStr = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const nextTwoWeeksStr = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
const prevWeekStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    project_id: 'p1',
    column_id: 'c1',
    task_type: 'TASK',
    title: '資料庫 Schema 設計',
    description: '請依照規格書建立實體關聯圖。',
    status: 'OPEN',
    priority: 'HIGH',
    position: 1000,
    start_date: todayStr,
    due_date: nextWeekStr,
    creator_id: 'u1',
    assignee_ids: ['u2'],
    created_at: todayStr,
    updated_at: todayStr,
  },
  {
    id: 't2',
    project_id: 'p1',
    column_id: 'c2',
    task_type: 'RFI',
    rfi_code: 'RFI-2026-001',
    title: '確認登入驗證 API 規格',
    description: '前端需要確認 SSO 登入的跳轉流程與 Token 格式。',
    status: 'IN_REVIEW',
    priority: 'URGENT',
    position: 2000,
    start_date: prevWeekStr,
    due_date: todayStr,
    creator_id: 'u2',
    assignee_ids: ['u1', 'u3'],
    created_at: prevWeekStr,
    updated_at: todayStr,
  },
  {
    id: 't3',
    project_id: 'p1',
    column_id: 'c1',
    task_type: 'TASK',
    title: '實作看板拖曳功能',
    description: '使用 dnd-kit 實作拖曳排序',
    status: 'OPEN',
    priority: 'MEDIUM',
    position: 3000,
    start_date: nextWeekStr,
    due_date: nextTwoWeeksStr,
    creator_id: 'u2',
    assignee_ids: ['u2'],
    created_at: todayStr,
    updated_at: todayStr,
  }
];

export function useStore() {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  
  const [columns, setColumns] = useState<BoardColumn[]>(() => {
    const saved = localStorage.getItem('app_columns');
    return saved ? JSON.parse(saved) : INITIAL_COLUMNS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem('app_attachments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('app_attachments', JSON.stringify(attachments));
  }, [attachments]);

  const moveTask = (taskId: string, targetColumnId: string, newPosition: number) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, column_id: targetColumnId, position: newPosition, updated_at: new Date().toISOString() } 
        : t
    ));
  };

  const addTask = (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    ));
  };

  const addAttachment = (attachment: Omit<Attachment, 'id' | 'created_at'>) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    setAttachments(prev => [...prev, newAttachment]);
    return newAttachment;
  };

  return {
    users,
    currentUser,
    setCurrentUser,
    projects,
    columns,
    tasks,
    attachments,
    moveTask,
    addTask,
    updateTask,
    addAttachment
  };
}
