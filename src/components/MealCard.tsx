import React from 'react';
import { Edit2, Trash2, User, Clock } from 'lucide-react';
import type { Meal } from '../types/meal';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'lunch':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'dinner':
        return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
      case 'snack':
        return 'text-green-400 bg-green-900/30 border-green-500/50';
      default:
        return 'text-gray-400 bg-gray-800/30 border-gray-600/50';
    }
  };

  const getMealTypeEmoji = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍿';
      default:
        return '🍽️';
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="glass-effect rounded-xl p-4 transition-all duration-300 hover-lift animate-slide-up border-gray-700/50 hover:border-yellow-500/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getMealTypeEmoji(meal.meal_type)}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getMealTypeColor(meal.meal_type)}`}>
              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-100 mb-1">{meal.meal_name}</h3>
          
          {meal.description && (
            <p className="text-sm text-gray-400 mb-2">{meal.description}</p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>@{meal.added_by_username || 'unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(meal.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(meal)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
            title="Edit meal"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(meal.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Delete meal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}