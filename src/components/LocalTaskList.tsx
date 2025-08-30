import React, { useState } from 'react';
import { Plus, Search, User, LogOut, Sparkles, Film, Shield, Network, UserCog, X, BarChart3, Flag } from 'lucide-react';
import { ChefHat } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { ShareModal } from './ShareModal';
import { LocalMovieNight } from './LocalMovieNight';
import { LocalPollsTab } from './LocalPollsTab';
import { LocalDinerTab } from './LocalDinerTab';
import { LocalMotoGPTab } from './LocalMotoGPTab';
import { LocalAdminSettings } from './LocalAdminSettings';
import { LocalNetworkTab } from './LocalNetworkTab';
import { UserSettings } from './UserSettings';
import { useLocalTasks } from '../hooks/useLocalTasks';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useLocalSettings } from '../hooks/useLocalSettings';
import type { Task, CreateTaskData } from '../types/task';

export function LocalTaskList() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'movies' | 'polls' | 'diner' | 'motogp' | 'admin' | 'network'>('tasks');
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'active' | 'completed'>('all');
  const [formLoading, setFormLoading] = useState(false);
  
  const { tasks, loading, createTask, updateTask, deleteTask } = useLocalTasks();
  const { user, appUser, signOut } = useLocalAuth();
  const { settings } = useLocalSettings();

  const handleCreateTask = async (taskData: CreateTaskData) => {
    setFormLoading(true);
    const { error } = editingTask 
      ? await updateTask(editingTask.id, taskData)
      : await createTask(taskData);
    setFormLoading(false);
    
    if (!error) {
      setShowForm(false);
      setEditingTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await updateTask(id, { completed });
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCompleted === 'all' || 
                         (filterCompleted === 'active' && !task.completed) ||
                         (filterCompleted === 'completed' && task.completed);
    
    return matchesSearch && matchesFilter;
  });

  const activeTasks = tasks.filter(task => !task.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header */}
      <header className="glass-effect border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 gold-gradient rounded-xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold gold-text">{settings.app_name}</h1>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                {activeTasks} active
              </span>
              <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full">
                Self-Hosted
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowUserSettings(true)}
               className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors px-2 py-1 rounded-lg hover:bg-yellow-500/10 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span className="truncate max-w-32">@{appUser?.username || user?.username || 'loading...'}</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Admin Settings"
              >
                <Shield className="h-4 w-4" />
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-t border-gray-700/50">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'movies'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Movie Night</span>
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'polls'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Polls</span>
            </button>
            <button
              onClick={() => setActiveTab('diner')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'diner'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Diner</span>
            </button>
            {settings.motogp_enabled && (
              <button
                onClick={() => setActiveTab('motogp')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'motogp'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">MotoGP</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('network')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'network'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full">
        {activeTab === 'movies' ? (
          <LocalMovieNight />
        ) : activeTab === 'polls' ? (
          <LocalPollsTab />
        ) : activeTab === 'diner' ? (
          <LocalDinerTab />
        ) : activeTab === 'motogp' ? (
          <LocalMotoGPTab />
        ) : activeTab === 'network' ? (
          <LocalNetworkTab />
        ) : activeTab === 'admin' ? (
          <LocalAdminSettings />
        ) : (
          <>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value as any)}
              className="px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-4 sm:px-6 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex items-center gap-2 hover-lift text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}
            </h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              {tasks.length === 0 
                ? 'Get started by creating your first task'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-gold px-6 sm:px-8 py-2 sm:py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 hover-lift text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Task List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onShare={setSharingTask}
                />
              ))}
            </div>
          </>
        )}
          </>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            loading={formLoading}
            editingTask={editingTask}
          />
        )}

        {/* Share Modal */}
        {sharingTask && (
          <ShareModal
            task={sharingTask}
            onClose={() => setSharingTask(null)}
          />
        )}
      </main>

      {/* GitHub Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-700/50 py-3 sm:py-4 px-3 sm:px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            Made with ❤️ by{' '}
            <span className="gold-text font-semibold">Maxi Goldmann</span>
            {' '} • {' '}
            <a 
              href="https://github.com/maxigoldy/YourFamilyHub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors underline"
            >
              GitHub Repository
            </a>
            {' '} • Free to use and edit • Feel free to contribute!
          </p>
        </div>
      </footer>

      {/* User Settings Modal */}
      {showUserSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 gold-gradient rounded-lg">
                  <UserCog className="h-5 w-5 text-black" />
                </div>
                <h2 className="text-xl font-semibold text-gray-100">User Settings</h2>
              </div>
              <button
                onClick={() => setShowUserSettings(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <UserSettings />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}