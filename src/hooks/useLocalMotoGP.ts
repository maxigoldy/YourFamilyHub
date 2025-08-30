import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { MotoGPEvent, CreateMotoGPEventData, UpdateMotoGPEventData } from '../types/motogp';
import { useLocalAuth } from './useLocalAuth';

export function useLocalMotoGP() {
  const [events, setEvents] = useState<MotoGPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useLocalAuth();

  const fetchEvents = async () => {
    try {
      const data = await localApi.getMotoGPEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching MotoGP events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateMotoGPEventData) => {
    if (!appUser) return { error: new Error('User not authenticated') };
    if (!appUser.is_admin) return { error: new Error('Only administrators can perform this action.') };

    try {
      const data = await localApi.createMotoGPEvent(eventData);
      setEvents((prev) => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      return { data, error: null };
    } catch (error) {
      console.error('Error creating MotoGP event:', error);
      return { data: null, error };
    }
  };

  const updateEvent = async (id: string, updates: UpdateMotoGPEventData) => {
    if (!appUser) return { error: new Error('User not authenticated') };
    if (!appUser.is_admin) return { error: new Error('Only administrators can perform this action.') };

    try {
      const data = await localApi.updateMotoGPEvent(id, updates);
      setEvents((prev) => prev.map((event) => (event.id === id ? data : event)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating MotoGP event:', error);
      return { data: null, error };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };
    if (!appUser.is_admin) return { error: new Error('Only administrators can perform this action.') };

    try {
      await localApi.deleteMotoGPEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting MotoGP event:', error);
      return { error };
    }
  };

  const clearAllEvents = async () => {
    if (!appUser) return { error: new Error('User not authenticated') };
    if (!appUser.is_admin) return { error: new Error('Only administrators can perform this action.') };

    try {
      await localApi.clearMotoGPEvents();
      setEvents([]);
      return { error: null };
    } catch (error) {
      console.error('Error clearing MotoGP events:', error);
      return { error };
    }
  };

  const importFromICS = async (icsContent: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };
    if (!appUser.is_admin) return { error: new Error('Only administrators can perform this action.') };

    try {
      const response = await localApi.importMotoGPCalendar(icsContent);
      await fetchEvents(); // Refresh events
      return { data: response, error: null };
    } catch (error) {
      console.error('Error importing ICS:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [appUser]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    clearAllEvents,
    importFromICS,
    refetchEvents: fetchEvents,
  };
}