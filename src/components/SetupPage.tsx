import React, { useState } from 'react';
import { Settings, User, Key, Shield, Sparkles } from 'lucide-react';
import { useLocalSettings } from '../hooks/useLocalSettings';

interface SetupPageProps {
  onSetupComplete: (user: any) => void;
}

export function SetupPage({ onSetupComplete }: SetupPageProps) {
  const [formData, setFormData] = useState({
    admin_username: '',
    admin_password: '',
    family_code: '',
    app_name: 'YourFamily'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setupApp } = useLocalSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.admin_username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.admin_password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.family_code.trim()) {
      setError('Family code is required');
      setLoading(false);
      return;
    }

    if (!formData.app_name.trim()) {
      setError('App name is required');
      setLoading(false);
      return;
    }

    try {
      const { error, user } = await setupApp(formData);
      
      if (error) {
        setError(error.message);
      } else {
        onSetupComplete(user);
      }
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-4 gold-gradient rounded-2xl mb-6 glow-gold">
            <Sparkles className="h-12 w-12 text-black" />
          </div>
          <h1 className="text-4xl font-bold gold-text mb-2">Welcome to YourFamily</h1>
          <p className="text-gray-300 text-lg">
            Let's set up your self-hosted family hub
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Configure your admin account and family settings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* App Name */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-100">App Configuration</h3>
            </div>
            
            <div>
              <label htmlFor="app_name" className="block text-sm font-medium text-gray-300 mb-2">
                App Name
              </label>
              <input
                type="text"
                id="app_name"
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
                placeholder="YourFamily"
                required
                maxLength={50}
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be displayed in the header and throughout the app
              </p>
            </div>
          </div>

          {/* Admin Account */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-100">Administrator Account</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin_username" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Username
                </label>
                <input
                  type="text"
                  id="admin_username"
                  value={formData.admin_username}
                  onChange={(e) => setFormData({ ...formData, admin_username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
                  placeholder="admin"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
              
              <div>
                <label htmlFor="admin_password" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="admin_password"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
                  placeholder="Choose a secure password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              The admin account has full access to all features and settings
            </p>
          </div>

          {/* Family Settings */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-100">Family Settings</h3>
            </div>
            
            <div>
              <label htmlFor="family_code" className="block text-sm font-medium text-gray-300 mb-2">
                Family Code
              </label>
              <input
                type="text"
                id="family_code"
                value={formData.family_code}
                onChange={(e) => setFormData({ ...formData, family_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 input-dark rounded-lg transition-all duration-200"
                placeholder="YOURFAMILY"
                required
                maxLength={20}
              />
              <p className="text-xs text-gray-400 mt-1">
                Family members will need this code to create accounts
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="glass-effect rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Security Notice</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Your data is stored locally in a SQLite database (data.db)</p>
              <p>• No external network connections are made</p>
              <p>• Admin password is used for accessing admin settings</p>
              <p>• Family code controls who can create new accounts</p>
              <p>• Keep your admin credentials secure</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-4 px-6 rounded-xl font-semibold text-lg focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover-lift"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Settings className="h-6 w-6" />
                Complete Setup
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            After setup, you can access admin settings to modify these configurations
          </p>
        </div>
      </div>
    </div>
  );
}