import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { Task, CreateTaskData, UpdateTaskData } from '../types/task';
import { useLocalAuth } from './useLocalAuth';

export function useLocalTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useLocalAuth();

  const fetchTasks = async () => {
    if (!appUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const data = await localApi.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.createTask(taskData);
      setTasks((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  };

  const updateTask = async (id: string, updates: UpdateTaskData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.updateTask(id, updates);
      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
  };

  const deleteTask = async (id: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      await localApi.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [appUser]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetchTasks: fetchTasks,
  };
}