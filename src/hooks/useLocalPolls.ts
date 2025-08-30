import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { Poll, CreatePollData, UpdatePollData, PollVote } from '../types/poll';
import { useLocalAuth } from './useLocalAuth';

export function useLocalPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useLocalAuth();

  const fetchPolls = async () => {
    try {
      const data = await localApi.getPolls();
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }

  const createPoll = async (pollData: CreatePollData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const expiresAt = new Date(Date.now() + pollData.duration_minutes * 60 * 1000);
      const options = pollData.options.map(text => ({ text, votes: 0 }));

      const data = await localApi.createPoll({
        ...pollData,
        options,
        expires_at: expiresAt.toISOString()
      });
      
      setPolls((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating poll:', error);
      return { data: null, error };
    }
  };

  const updatePoll = async (id: string, updates: UpdatePollData) => {
    try {
      const updateData: any = { ...updates };

      // If updating options, convert to proper format
      if (updates.options) {
        updateData.options = updates.options.map(text => ({ text, votes: 0 }));
      }

      // If updating duration, recalculate expires_at
      if (updates.duration_minutes) {
        const expiresAt = new Date(Date.now() + updates.duration_minutes * 60 * 1000);
        updateData.expires_at = expiresAt.toISOString();
      }

      const data = await localApi.updatePoll(id, updateData);
      setPolls((prev) => prev.map((poll) => (poll.id === id ? data : poll)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating poll:', error);
      return { data: null, error };
    }
  };

  const deletePoll = async (id: string) => {
    try {
      await localApi.deletePoll(id);
      setPolls((prev) => prev.filter((poll) => poll.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting poll:', error);
      return { error };
    }
  };

  const vote = async (pollId: string, optionIndex: number) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      await localApi.votePoll(pollId, optionIndex);
      
      // Refresh polls to get updated vote counts
      await fetchPolls();
      
      return { error: null };
    } catch (error) {
      console.error('Error voting:', error);
      return { error };
    }
  };

  const getUserVotes = async (pollId: string) => {
    if (!appUser) return { data: [], error: null };

    try {
      const data = await localApi.getPollVotes(pollId);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return { data: [], error };
    }
  };

  const getAllVotes = async (pollId: string) => {
    try {
      const data = await localApi.getPollVotes(pollId);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching all votes:', error);
      return { data: [], error };
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return {
    polls,
    loading,
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    getUserVotes,
    getAllVotes,
    refetchPolls: fetchPolls,
  };
}