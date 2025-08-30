import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { useLocalUsers } from '../hooks/useLocalUsers';
import type { CreateTaskData, Task } from '../types/task';

interface TaskFormProps {
  onSubmit: (taskData: CreateTaskData) => void;
  onClose: () => void;
  loading?: boolean;
  editingTask?: Task | null;
}

export function TaskForm({ onSubmit, onClose, loading = false, editingTask }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    priority: 'medium',
    category: editingTask?.category || 'general',
    due_date: editingTask?.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : '',
    assigned_to_username: editingTask?.assigned_to_username || '',
  });

  const { getAllUsernames } = useLocalUsers();
  const [usernames, setUsernames] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchUsernames = async () => {
      const { data } = await getAllUsernames();
      setUsernames(data);
    };
    fetchUsernames();
  }, []);
  React.useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        category: editingTask.category,
        due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : '',
        assigned_to_username: editingTask.assigned_to_username || '',
      });
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      due_date: formData.due_date || undefined,
      assigned_to_username: formData.assigned_to_username || null,
    });
  };

  const categories = [
    'general', 'work', 'personal', 'health', 'finance', 'learning', 'shopping'
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Plus className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg resize-none text-sm sm:text-base"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assign to User (Optional)
            </label>
            <select
              value={formData.assigned_to_username}
              onChange={(e) => setFormData({ ...formData, assigned_to_username: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
            >
              <option value="">Not assigned</option>
              {usernames.map((username) => (
                <option key={username} value={username}>
                  @{username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 btn-dark rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 btn-gold px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editingTask ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}