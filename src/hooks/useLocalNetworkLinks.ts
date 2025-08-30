import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { NetworkLink } from '../types/user';

export function useNetworkLinks() {
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const data = await localApi.getNetworkLinks();
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching network links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData: Omit<NetworkLink, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await localApi.createNetworkLink(linkData);
      setLinks((prev) => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating link:', error);
      return { data: null, error };
    }
  };

  const updateLink = async (id: string, updates: Partial<NetworkLink>) => {
    try {
      const data = await localApi.updateNetworkLink(id, updates);
      setLinks((prev) => prev.map((link) => (link.id === id ? data : link)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating link:', error);
      return { data: null, error };
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await localApi.deleteNetworkLink(id);
      setLinks((prev) => prev.filter((link) => link.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    refetchLinks: fetchLinks,
  };
}