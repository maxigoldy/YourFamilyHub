import React, { useState } from 'react';
import { Shield, Users, Edit2, Trash2, Save, X, Plus, Settings, Key, Type, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLocalUsers } from '../hooks/useLocalUsers';
import { useNetworkLinks } from '../hooks/useLocalNetworkLinks';
import { useLocalSettings } from '../hooks/useLocalSettings';
import { localApi } from '../lib/localApi';
import type { AppUser, NetworkLink } from '../types/user';

export function LocalAdminSettings() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editingLink, setEditingLink] = useState<NetworkLink | null>(null);
  const [showNewLink, setShowNewLink] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });
  const [appSettings, setAppSettings] = useState({
    app_name: '',
    admin_password: '',
    family_code: '',
    motogp_enabled: true
  });
  
  const { users, loading: usersLoading, updateUser, deleteUser, refetchUsers } = useLocalUsers();
  const { links, loading: linksLoading, createLink, updateLink, deleteLink, refetchLinks } = useNetworkLinks();
  const { settings, updateSettings } = useLocalSettings();

  React.useEffect(() => {
    setAppSettings({
      app_name: settings.app_name,
      admin_password: '',
      family_code: '',
      motogp_enabled: settings.motogp_enabled
    });
  }, [settings]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await localApi.verifyAdminPassword(adminPassword);
      if (response.success) {
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      alert(error.message || 'Invalid admin password');
    }
  };

  const handleUpdateUser = async (user: AppUser) => {
    if (!editingUser) return;
    
    const { error } = await updateUser(user.id, {
      username: editingUser.username,
      is_admin: editingUser.is_admin,
    });
    
    if (!error) {
      setEditingUser(null);
      refetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user @${username}? This will remove all their data and cannot be undone.`)) {
      const { error } = await deleteUser(userId);
      if (!error) {
        refetchUsers();
      }
    }
  };

  const handleCreateLink = async () => {
    if (!newLink.name || !newLink.url) return;
    
    const { error } = await createLink(newLink);
    if (!error) {
      setNewLink({ name: '', url: '', description: '' });
      setShowNewLink(false);
      refetchLinks();
    }
  };

  const handleUpdateLink = async (link: NetworkLink) => {
    if (!editingLink) return;
    
    const { error } = await updateLink(link.id, {
      name: editingLink.name,
      url: editingLink.url,
      description: editingLink.description,
    });
    
    if (!error) {
      setEditingLink(null);
      refetchLinks();
    }
  };

  const handleDeleteLink = async (linkId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" network link?`)) {
      const { error } = await deleteLink(linkId);
      if (!error) {
        refetchLinks();
      }
    }
  };

  const handleSaveAppSettings = async () => {
    try {
      const { error } = await updateSettings({
        app_name: appSettings.app_name,
        motogp_enabled: appSettings.motogp_enabled
      });
      
      if (!error) {
        // Also update admin password and family code if provided
        if (appSettings.admin_password || appSettings.family_code) {
          await localApi.updateSettings({
            admin_password: appSettings.admin_password || undefined,
            family_code: appSettings.family_code || undefined
          });
        }
        
        setShowAppSettings(false);
        alert('Settings updated successfully!');
        
        // Reload page to reflect app name changes
        if (appSettings.app_name !== settings.app_name) {
          window.location.reload();
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update settings');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="glass-effect rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="p-3 gold-gradient rounded-2xl inline-block mb-4">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold gold-text">Admin Access</h2>
            <p className="text-gray-400 mt-2">Enter admin password to continue</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 input-dark rounded-lg mb-4"
              placeholder="Admin password"
              required
            />
            <button
              type="submit"
              className="w-full btn-gold py-3 rounded-lg font-medium"
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 gold-gradient rounded-2xl">
            <Shield className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-3xl font-bold gold-text">Admin Settings</h2>
        </div>
        <p className="text-gray-400">Manage users, settings, and system configuration</p>
      </div>

      {/* App Settings */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-100">App Settings</h3>
          </div>
          <button
            onClick={() => setShowAppSettings(!showAppSettings)}
            className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {showAppSettings ? 'Hide Settings' : 'Edit Settings'}
          </button>
        </div>

        {showAppSettings ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Type className="inline h-4 w-4 mr-1" />
                  App Name
                </label>
                <input
                  type="text"
                  value={appSettings.app_name}
                  onChange={(e) => setAppSettings({ ...appSettings, app_name: e.target.value })}
                  className="w-full px-3 py-2 input-dark rounded-lg"
                  placeholder="GoldFamily"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Key className="inline h-4 w-4 mr-1" />
                  New Admin Password
                </label>
                <input
                  type="password"
                  value={appSettings.admin_password}
                  onChange={(e) => setAppSettings({ ...appSettings, admin_password: e.target.value })}
                  className="w-full px-3 py-2 input-dark rounded-lg"
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                Family Code
              </label>
              <input
                type="text"
                value={appSettings.family_code}
                onChange={(e) => setAppSettings({ ...appSettings, family_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 input-dark rounded-lg"
                placeholder="Leave empty to keep current"
              />
              <p className="text-xs text-gray-400 mt-1">
                Required for new family members to register
              </p>
            </div>

            <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
              <div>
                <h4 className="text-gray-100 font-medium">MotoGP Tab</h4>
                <p className="text-sm text-gray-400">Enable or disable the MotoGP events tab</p>
              </div>
              <button
                onClick={() => setAppSettings({ ...appSettings, motogp_enabled: !appSettings.motogp_enabled })}
                className={`p-1 rounded-full transition-colors ${
                  appSettings.motogp_enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                {appSettings.motogp_enabled ? (
                  <ToggleRight className="h-6 w-6 text-white" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-white" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveAppSettings}
                className="btn-gold px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
              <button
                onClick={() => setShowAppSettings(false)}
                className="btn-dark px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>App Name:</span>
              <span className="gold-text font-medium">{settings.app_name}</span>
            </div>
            <div className="flex justify-between">
              <span>MotoGP Tab:</span>
              <span className={settings.motogp_enabled ? 'text-green-400' : 'text-red-400'}>
                {settings.motogp_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-100">User Management</h3>
        </div>

        {usersLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="glass-effect rounded-lg p-4">
                {editingUser?.id === user.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full px-3 py-2 input-dark rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`admin-${user.id}`}
                        checked={editingUser.is_admin}
                        onChange={(e) => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor={`admin-${user.id}`} className="text-sm text-gray-300">Admin privileges</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUser(user)}
                        className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="btn-dark px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-100">@{user.username}</span>
                        {user.is_admin && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Links Management */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-100">Network Links</h3>
          </div>
          <button
            onClick={() => setShowNewLink(true)}
            className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </button>
        </div>

        {showNewLink && (
          <div className="glass-effect rounded-lg p-4 mb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-full px-3 py-2 input-dark rounded-lg"
                    placeholder="Service name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full px-3 py-2 input-dark rounded-lg"
                    placeholder="http://192.168.1.100:8080"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full px-3 py-2 input-dark rounded-lg"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLink}
                  className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewLink(false);
                    setNewLink({ name: '', url: '', description: '' });
                  }}
                  className="btn-dark px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {linksLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading network links...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="glass-effect rounded-lg p-4">
                {editingLink?.id === link.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          value={editingLink.name}
                          onChange={(e) => setEditingLink({ ...editingLink, name: e.target.value })}
                          className="w-full px-3 py-2 input-dark rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                        <input
                          type="url"
                          value={editingLink.url}
                          onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                          className="w-full px-3 py-2 input-dark rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <input
                        type="text"
                        value={editingLink.description || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                        className="w-full px-3 py-2 input-dark rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateLink(link)}
                        className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingLink(null)}
                        className="btn-dark px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-100">{link.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">{link.url}</p>
                      {link.description && (
                        <p className="text-xs text-gray-500">{link.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingLink(link)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id, link.name)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}