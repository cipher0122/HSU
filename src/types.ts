export type RoleType = 'SUPER_ADMIN' | 'PM' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Project {
  id: string;
  name: string;
  key_code: string;
  description?: string;
  created_at: string;
}

export interface BoardColumn {
  id: string;
  project_id: string;
  title: string;
  position: number;
  wip_limit: number;
}

export type TaskType = 'TASK' | 'RFI';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  project_id: string;
  column_id: string;
  task_type: TaskType;
  rfi_code?: string;
  title: string;
  description?: string;
  official_answer?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  start_date?: string;
  due_date?: string;
  creator_id: string;
  assignee_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_inline_image: boolean;
  created_at: string;
}
