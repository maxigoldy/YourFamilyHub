import { useState } from 'react';
import { localApi } from '../lib/localApi';
import { useLocalAuth } from './useLocalAuth';

export interface TaskShare {
  id: string;
  task_id: string;
  shared_by: string;
  shared_with_email: string | null;
  share_token: string;
  expires_at: string | null;
  created_at: string;
}

export function useTaskSharing() {
  const [loading, setLoading] = useState(false);
  const { user } = useLocalAuth();

  const createShare = async (taskId: string, username?: string, expiresInDays?: number) => {
    if (!user) return { error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const shareToken = crypto.randomUUID();

      // For now, return a mock share since task sharing isn't implemented in local API
      return { 
        data: { 
          id: shareToken, 
          task_id: taskId, 
          share_token: shareToken,
          expires_at: expiresAt 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating share:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getSharedTaskByToken = async (shareToken: string) => {
    try {
      // For now, return null since task sharing isn't fully implemented
      return { data: null, error: new Error('Task sharing not available in local mode') };
    } catch (error) {
      console.error('Error fetching shared task:', error);
      return { data: null, error };
    }
  };

  const addSharedTaskToUser = async (shareToken: string) => {
    return { data: null, error: new Error('Task sharing not available in local mode') };
  };

  const createShare_old = async (taskId: string, email?: string, expiresInDays?: number) => {
    if (!user) return { error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Generate share token on client-side to avoid encoding issues
      const shareToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from('task_shares')
        .insert([
          {
            task_id: taskId,
            shared_by: user.id,
            shared_with_email: email || null,
            expires_at: expiresAt,
            share_token: shareToken,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating share:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getTaskShares = async (taskId: string) => {
    if (!user) return { data: [], error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('task_shares')
        .select('*')
        .eq('task_id', taskId)
        .eq('shared_by', user.id);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching shares:', error);
      return { data: [], error };
    }
  };

  const deleteShare = async (shareId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('task_shares')
        .delete()
        .eq('id', shareId)
        .eq('shared_by', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting share:', error);
      return { error };
    }
  };

  const getSharedTask = async (shareToken: string) => {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('task_shares')
        .select(`
          *,
          tasks (*)
        `)
        .eq('share_token', shareToken)
        .single();

      if (shareError) throw shareError;

      // Check if share has expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        throw new Error('Share link has expired');
      }

      return { data: shareData, error: null };
    } catch (error) {
      console.error('Error fetching shared task:', error);
      return { data: null, error };
    }
  };

  return {
    loading,
    createShare,
    getSharedTaskByToken,
    addSharedTaskToUser,
    getTaskShares,
    deleteShare,
    getSharedTask,
  };
}