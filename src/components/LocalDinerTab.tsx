import React, { useState } from 'react';
import { Plus, Utensils, Calendar, ChefHat } from 'lucide-react';
import { MealCard } from './MealCard';
import { MealForm } from './MealForm';
import { useLocalMeals } from '../hooks/useLocalMeals';
import type { Meal, CreateMealData } from '../types/meal';

export function LocalDinerTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formLoading, setFormLoading] = useState(false);
  
  const { meals, loading, createMeal, updateMeal, deleteMeal } = useLocalMeals();

  const handleCreateMeal = async (mealData: CreateMealData) => {
    setFormLoading(true);
    const { error } = editingMeal 
      ? await updateMeal(editingMeal.id, mealData)
      : await createMeal(mealData);
    setFormLoading(false);
    
    if (!error) {
      setShowForm(false);
      setEditingMeal(null);
      setSelectedDate('');
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleDeleteMeal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      await deleteMeal(id);
    }
  };

  const handleAddMealForDate = (date: string) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  // Generate next 14 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMeals = meals.filter(meal => meal.date === dateStr);
      
      days.push({
        date: dateStr,
        dateObj: date,
        meals: dayMeals,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    
    return days;
  };

  const days = generateDays();
  const totalMeals = meals.length;
  const mealsByType = meals.reduce((acc, meal) => {
    acc[meal.meal_type] = (acc[meal.meal_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 sm:p-3 gold-gradient rounded-2xl">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-text">Diner</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base mb-2">Plan your family meals for the next 2 weeks</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            {totalMeals} meals planned
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            14 days
          </span>
          {Object.entries(mealsByType).map(([type, count]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {count} {type}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="btn-gold px-6 sm:px-8 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex items-center gap-2 hover-lift mx-auto text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" />
          Add Meal
        </button>
      </div>

      {/* Calendar View */}
      <div className="space-y-6">
        {days.map((day) => (
          <div key={day.date} className="glass-effect rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
                  {day.isToday ? 'Today' : day.isTomorrow ? 'Tomorrow' : day.dateObj.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-gray-400">
                  {day.dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <button
                onClick={() => handleAddMealForDate(day.date)}
                className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover-lift transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Meal</span>
              </button>
            </div>

            {day.meals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No meals planned for this day</p>
                <button
                  onClick={() => handleAddMealForDate(day.date)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 transition-colors"
                >
                  Add the first meal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.meals
                  .sort((a, b) => {
                    const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
                    return order[a.meal_type] - order[b.meal_type];
                  })
                  .map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={handleEditMeal}
                      onDelete={handleDeleteMeal}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meal Form Modal */}
      {showForm && (
        <MealForm
          onSubmit={handleCreateMeal}
          onClose={() => {
            setShowForm(false);
            setEditingMeal(null);
            setSelectedDate('');
          }}
          loading={formLoading}
          editingMeal={editingMeal}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}