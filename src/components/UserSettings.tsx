import React, { useState } from 'react';
import { UserCog, Save, X, Upload, User, Lock, Key } from 'lucide-react';
import { useLocalAuth } from '../hooks/useLocalAuth';

export function UserSettings() {
  const { user: appUser } = useLocalAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: appUser?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    familyCode: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (appUser) {
      setFormData(prev => ({
        ...prev,
        username: appUser.username
      }));
      // Load profile picture if exists
      const savedPicture = localStorage.getItem(`profile_picture_${appUser.id}`);
      if (savedPicture) {
        setProfilePictureUrl(savedPicture);
      }
    }
  }, [appUser]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Profile picture must be less than 2MB');
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePictureUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (formData.newPassword && formData.familyCode !== 'YOURFAMILY') {
        throw new Error('Invalid family code for password change');
      }

      // Save profile picture
      if (profilePicture && appUser) {
        localStorage.setItem(`profile_picture_${appUser.id}`, profilePictureUrl);
      }

      // Here you would typically make API calls to update user data
      // For now, we'll simulate success
      setSuccess('Settings updated successfully!');
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        familyCode: ''
      }));
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserAvatar = (username: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = username.length % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 gold-gradient rounded-2xl">
            <UserCog className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-3xl font-bold gold-text">User Settings</h2>
        </div>
        <p className="text-gray-400">Manage your profile and account settings</p>
      </div>

      {error && (
        <div className="glass-effect rounded-xl p-4 border border-red-500/50 bg-red-900/20">
          <p className="text-red-300 text-center">{error}</p>
        </div>
      )}

      {success && (
        <div className="glass-effect rounded-xl p-4 border border-green-500/50 bg-green-900/20">
          <p className="text-green-300 text-center">{success}</p>
        </div>
      )}

      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-100">Profile Information</h3>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500/50"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full ${getUserAvatar(appUser?.username || 'user')} flex items-center justify-center text-white text-2xl font-bold`}>
                  {(appUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-yellow-500 hover:bg-yellow-600 rounded-full p-2 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 text-black" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-100">@{appUser?.username}</h4>
              <p className="text-sm text-gray-400">
                Member since {appUser ? new Date(appUser.created_at).toLocaleDateString() : 'Unknown'}
              </p>
              {appUser?.is_admin && (
                <span className="inline-block mt-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                  Administrator
                </span>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="w-full px-4 py-3 input-dark rounded-lg"
                placeholder="Enter new username"
                minLength={3}
                maxLength={20}
              />
            ) : (
              <div className="px-4 py-3 bg-gray-800/50 rounded-lg text-gray-300">
                @{appUser?.username}
              </div>
            )}
          </div>

          {/* Password Change */}
          {isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 input-dark rounded-lg"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 input-dark rounded-lg"
                  placeholder="Enter new password (optional)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 input-dark rounded-lg"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              {formData.newPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-yellow-500" />
                      Family Code (Required for password change)
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.familyCode}
                    onChange={(e) => setFormData({ ...formData, familyCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 input-dark rounded-lg"
                    placeholder="Enter family code"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter "YOURFAMILY" to authorize password change
                  </p>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="btn-gold px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setSuccess(null);
                    setFormData({
                      username: appUser?.username || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                      familyCode: ''
                    });
                  }}
                  className="btn-dark px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-gold px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}