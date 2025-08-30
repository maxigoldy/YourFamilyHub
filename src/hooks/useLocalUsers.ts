import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { AppUser, UpdateUserData } from '../types/user';

export function useLocalUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await localApi.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: UpdateUserData) => {
    try {
      await localApi.updateUser(id, updates);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)));
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await localApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error };
    }
  };

  const getAllUsernames = async () => {
    try {
      const data = await localApi.getUsernames();
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching usernames:', error);
      return { data: [], error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updateUser,
    deleteUser,
    getAllUsernames,
    refetchUsers: fetchUsers,
  };
}