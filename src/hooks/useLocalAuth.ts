import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';

interface AuthUser {
  user_id: string;
  username: string;
  is_admin: boolean;
}

export function useLocalAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedToken = localStorage.getItem('goldytask_token');
    if (storedToken) {
      try {
        const userData = JSON.parse(atob(storedToken));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('goldytask_token');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await localApi.login(username, password);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('goldytask_token', response.token);
        return { error: null };
      }
      
      return { error: new Error('Login failed') };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (username: string, password: string, familyCode: string) => {
    try {
      const response = await localApi.register(username, password, familyCode);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('goldytask_token', response.token);
        return { error: null };
      }
      
      return { error: new Error('Registration failed') };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('goldytask_token');
    return { error: null };
  };

  return {
    user,
    appUser: user ? {
      id: user.user_id,
      username: user.username,
      is_admin: user.is_admin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : null,
    loading,
    signIn,
    signUp,
    signOut,
    refetchAppUser: () => null,
  };
}