import React from 'react';
import { format, isAfter, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock, Edit2, Trash2, CheckCircle, Circle, AlertTriangle, Share2, User } from 'lucide-react';
import type { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onShare: (task: Task) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, onShare }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'low':
        return 'text-green-400 bg-green-900/30 border-green-500/50';
      default:
        return 'text-gray-400 bg-gray-800/30 border-gray-600/50';
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const isDue = task.due_date && isAfter(new Date(), new Date(task.due_date));
  const isNearDue = task.due_date && 
    !isDue && 
    isAfter(new Date(task.due_date), new Date()) && 
    isAfter(new Date(Date.now() + 24 * 60 * 60 * 1000), new Date(task.due_date));

  return (
    <div className={`glass-effect rounded-xl p-6 transition-all duration-300 hover-lift animate-slide-up ${
      task.completed 
        ? 'border-green-500/50 bg-green-900/20' 
        : isDue 
          ? 'border-red-500/50 bg-red-900/20 glow-gold' 
          : 'border-gray-700/50 hover:border-yellow-500/50'
    } min-w-0`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className="flex-shrink-0 mt-1 transition-all duration-200 hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : (
            <Circle className="h-6 w-6 text-gray-500 hover:text-yellow-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-medium ${
              task.completed 
                ? 'text-gray-500 line-through'
                : 'text-gray-100'
            } truncate sm:whitespace-normal`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isDue && !task.completed && (
                <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
              )}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            } line-clamp-2 sm:line-clamp-none`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-400">
              <span className="px-3 py-1 bg-gray-700/50 rounded-full text-xs font-medium">
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </span>
              
              {task.assigned_to_username && (
                <div className="flex items-center gap-1 text-blue-400">
                  <User className="h-4 w-4" />
                  <span>@{task.assigned_to_username}</span>
                </div>
              )}
              
              {task.due_date && (
                <div className={`flex items-center gap-1 ${
                  isDue && !task.completed 
                    ? 'text-red-400' 
                    : isNearDue && !task.completed 
                      ? 'text-yellow-400' 
                      : 'text-gray-400'
                }`}>
                  <Calendar className="h-4 w-4" />
                  <span>{formatDueDate(task.due_date)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => onShare(task)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                title="Share task"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                title="Edit task"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}