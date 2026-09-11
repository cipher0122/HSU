import { Project, BoardColumn, Task, User, Attachment } from './types';

export const api = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    return res.json();
  },

  async getColumns(): Promise<BoardColumn[]> {
    const res = await fetch('/api/columns');
    return res.json();
  },

  async getTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks');
    return res.json();
  },

  async createTask(task: Task): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getAttachments(): Promise<Attachment[]> {
    const res = await fetch('/api/attachments');
    return res.json();
  },

  async createAttachment(attachment: Attachment): Promise<Attachment> {
    const res = await fetch('/api/attachments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attachment),
    });
    return res.json();
  },
};
