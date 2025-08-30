import React, { useState } from 'react';
import { X, Plus, Utensils, Calendar } from 'lucide-react';
import type { CreateMealData, Meal } from '../types/meal';

interface MealFormProps {
  onSubmit: (mealData: CreateMealData) => void;
  onClose: () => void;
  loading?: boolean;
  editingMeal?: Meal | null;
  selectedDate?: string;
}

export function MealForm({ onSubmit, onClose, loading = false, editingMeal, selectedDate }: MealFormProps) {
  const [formData, setFormData] = useState<CreateMealData>({
    date: editingMeal?.date || selectedDate || new Date().toISOString().split('T')[0],
    meal_name: editingMeal?.meal_name || '',
    meal_type: editingMeal?.meal_type || 'dinner',
    description: editingMeal?.description || '',
  });

  React.useEffect(() => {
    if (editingMeal) {
      setFormData({
        date: editingMeal.date,
        meal_name: editingMeal.meal_name,
        meal_type: editingMeal.meal_type,
        description: editingMeal.description || '',
      });
    } else if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [editingMeal, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.meal_name.trim()) {
      alert('Please enter a meal name');
      return;
    }
    onSubmit(formData);
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch', label: 'Lunch', emoji: '☀️' },
    { value: 'dinner', label: 'Dinner', emoji: '🌙' },
    { value: 'snack', label: 'Snack', emoji: '🍿' },
  ];

  // Generate date options for next 2 weeks
  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      options.push({ value: dateStr, label });
    }
    return options;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Utensils className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">
              {editingMeal ? 'Edit Meal' : 'Add Meal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <div className="relative">
              <select
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 input-dark rounded-lg appearance-none"
                required
              >
                {getDateOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, meal_type: type.value as any })}
                  className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                    formData.meal_type === type.value
                      ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-400'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-yellow-500/30'
                  }`}
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meal Name
            </label>
            <input
              type="text"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              className="w-full px-4 py-3 input-dark rounded-lg"
              placeholder="What's for dinner?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 input-dark rounded-lg resize-none"
              placeholder="Recipe notes, ingredients, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 btn-dark rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.meal_name.trim()}
              className="flex-1 btn-gold px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editingMeal ? 'Update Meal' : 'Add Meal'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}