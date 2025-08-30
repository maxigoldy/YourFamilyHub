export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to_username?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  assigned_to_username?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
  assigned_to_username?: string;
}