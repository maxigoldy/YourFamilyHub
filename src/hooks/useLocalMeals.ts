import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { Meal, CreateMealData, UpdateMealData } from '../types/meal';
import { useLocalAuth } from './useLocalAuth';

export function useLocalMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useLocalAuth();

  const fetchMeals = async () => {
    try {
      const data = await localApi.getMeals();
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMeal = async (mealData: CreateMealData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.createMeal(mealData);
      setMeals((prev) => [...prev, data].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.meal_type.localeCompare(b.meal_type);
      }));
      return { data, error: null };
    } catch (error) {
      console.error('Error creating meal:', error);
      return { data: null, error };
    }
  };

  const updateMeal = async (id: string, updates: UpdateMealData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.updateMeal(id, updates);
      setMeals((prev) => prev.map((meal) => (meal.id === id ? data : meal)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating meal:', error);
      return { data: null, error };
    }
  };

  const deleteMeal = async (id: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      await localApi.deleteMeal(id);
      setMeals((prev) => prev.filter((meal) => meal.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting meal:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [appUser]);

  return {
    meals,
    loading,
    createMeal,
    updateMeal,
    deleteMeal,
    refetchMeals: fetchMeals,
  };
}