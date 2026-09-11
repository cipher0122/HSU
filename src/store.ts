import { useState, useEffect, useCallback } from 'react';
import { Project, BoardColumn, Task, User, Attachment } from './types';
import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

const FALLBACK_USERS: User[] = [
  { id: 'u1', email: 'alice@example.com', name: 'Alice (PM)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'u2', email: 'bob@example.com', name: 'Bob (Engineer)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: 'u3', email: 'charlie@example.com', name: 'Charlie (Client)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
];

const FALLBACK_PROJECTS: Project[] = [
  { id: 'p1', name: '企業 ERP 升級專案', key_code: 'ERP', created_at: new Date().toISOString() },
];

export function useStore() {
  const [users, setUsers] = useState<User[]>(FALLBACK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(FALLBACK_USERS[0]);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化向後端載入資料
  const loadData = useCallback(async () => {
    try {
      const [u, p, c, t, a] = await Promise.all([
        api.getUsers(),
        api.getProjects(),
        api.getColumns(),
        api.getTasks(),
        api.getAttachments(),
      ]);

      if (u.length > 0) {
        setUsers(u);
        setCurrentUser(prev => u.find(user => user.id === prev.id) || u[0]);
      }
      if (p.length > 0) setProjects(p);
      setColumns(c);
      setTasks(t);
      setAttachments(a);
    } catch (err) {
      console.error('Failed to load data from SQLite backend, using local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 移動任務（樂觀更新 + 同步後端）
  const moveTask = async (taskId: string, targetColumnId: string, newPosition: number) => {
    const updatedAt = new Date().toISOString();
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, column_id: targetColumnId, position: newPosition, updated_at: updatedAt } 
        : t
    ));

    try {
      await api.updateTask(taskId, {
        column_id: targetColumnId,
        position: newPosition,
      });
    } catch (err) {
      console.error('Failed to persist task move:', err);
    }
  };

  // 新增任務
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };

    // 樂觀更新
    setTasks(prev => [...prev, newTask]);

    try {
      await api.createTask(newTask);
    } catch (err) {
      console.error('Failed to persist new task:', err);
    }
  };

  // 更新任務
  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates, updated_at: now } : t
    ));

    try {
      await api.updateTask(taskId, updates);
    } catch (err) {
      console.error('Failed to persist task update:', err);
    }
  };

  // 新增附件
  const addAttachment = async (attachmentData: Omit<Attachment, 'id' | 'created_at'>) => {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    setAttachments(prev => [...prev, newAttachment]);

    try {
      await api.createAttachment(newAttachment);
    } catch (err) {
      console.error('Failed to persist attachment:', err);
    }

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
    isLoading,
    moveTask,
    addTask,
    updateTask,
    addAttachment,
    refresh: loadData,
  };
}
