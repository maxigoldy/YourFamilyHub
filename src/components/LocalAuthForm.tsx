import React, { useState } from 'react';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useLocalSettings } from '../hooks/useLocalSettings';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export function LocalAuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useLocalAuth();
  const { settings } = useLocalSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check username for sign up
    if (isSignUp && !username.trim()) {
      setError('Username is required.');
      setLoading(false);
      return;
    }

    if (isSignUp && username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    // Check family code for sign up
    if (isSignUp && !familyCode.trim()) {
      setError('Family code is required.');
      setLoading(false);
      return;
    }

    try {
      const { error } = isSignUp
        ? await signUp(username, password, familyCode)
        : await signIn(username, password);

      if (error) {
        if (error.message === 'Invalid username or password') {
          setError(
            isSignUp 
              ? 'Unable to create account. Please try again or contact support.'
              : 'Invalid username or password. Please check your credentials or sign up for a new account.'
          );
        } else if (error.message === 'Username already taken') {
          setError('This username is already taken. Please choose a different one.');
        } else if (error.message === 'Invalid family code') {
          setError('Invalid family code. Please contact your family administrator.');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 gold-gradient rounded-2xl mb-4 glow-gold">
            <h1 className="text-3xl font-bold text-black">{settings.app_name}</h1>
          </div>
          <p className="text-gray-300">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Self-hosted family hub
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
              placeholder="Choose a unique username"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-gray-400 mt-1">
              3-20 characters, lowercase letters, numbers, and underscores only
            </p>
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="familyCode" className="block text-sm font-medium text-gray-300 mb-2">
                Family Code
              </label>
              <input
                type="text"
                id="familyCode"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
                placeholder="Enter family code"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Contact your family administrator for the code
              </p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-lift"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setFamilyCode('');
            }}
            className="gold-text hover:text-yellow-400 font-medium transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}