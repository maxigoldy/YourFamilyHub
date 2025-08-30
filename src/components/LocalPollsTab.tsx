import React, { useState } from 'react';
import { Plus, Search, BarChart3, Users, Clock, Zap } from 'lucide-react';
import { LocalPollCard } from './LocalPollCard';
import { PollForm } from './PollForm';
import { LuckyWheelModal } from './LuckyWheelModal';
import { useLocalPolls } from '../hooks/useLocalPolls';
import type { Poll, CreatePollData } from '../types/poll';

export function LocalPollsTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [luckyWheelPoll, setLuckyWheelPoll] = useState<Poll | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { polls, loading, createPoll, updatePoll, deletePoll } = useLocalPolls();

  const handleCreatePoll = async (pollData: CreatePollData) => {
    setFormLoading(true);
    setFormError(null);
    const { error } = editingPoll 
      ? await updatePoll(editingPoll.id, pollData)
      : await createPoll(pollData);
    setFormLoading(false);
    
    if (error) {
      setFormError(error.message || 'An error occurred while saving the poll');
    } else {
      setShowForm(false);
      setEditingPoll(null);
      setFormError(null);
    }
  };

  const handleEditPoll = (poll: Poll) => {
    setEditingPoll(poll);
    setShowForm(true);
  };

  const handleDeletePoll = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      await deletePoll(id);
    }
  };

  const handleLuckyWheel = (poll: Poll) => {
    if (!poll.has_lucky_wheel) {
      alert('This poll does not have lucky wheel enabled');
      return;
    }
    setLuckyWheelPoll(poll);
  };

  const filteredPolls = polls.filter((poll) => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const expires = new Date(poll.expires_at);
    const isExpired = expires <= now;
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && !isExpired) ||
                         (filterStatus === 'expired' && isExpired);
    
    return matchesSearch && matchesFilter;
  });

  const activePolls = polls.filter(poll => new Date(poll.expires_at) > new Date()).length;
  const expiredPolls = polls.filter(poll => new Date(poll.expires_at) <= new Date()).length;
  const luckyWheelPolls = polls.filter(poll => poll.has_lucky_wheel).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 sm:p-3 gold-gradient rounded-2xl">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-text">Polls</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base mb-2">Create and vote on family polls</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {polls.length} total
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {activePolls} active
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {expiredPolls} expired
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Zap className="h-4 w-4" />
            {luckyWheelPolls} lucky wheels
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Search polls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
          />
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
          >
            <option value="all">All Polls</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-gold px-4 sm:px-6 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex items-center gap-2 hover-lift text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Poll</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Polls List */}
      {filteredPolls.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">
            {polls.length === 0 ? 'No polls yet' : 'No polls match your search'}
          </h3>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            {polls.length === 0
              ? 'Create your first poll to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {polls.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-6 sm:px-8 py-2 sm:py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 hover-lift text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              Create your first poll
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredPolls.map((poll) => (
            <LocalPollCard
              key={poll.id}
              poll={poll}
              onEdit={handleEditPoll}
              onDelete={handleDeletePoll}
              onLuckyWheel={handleLuckyWheel}
            />
          ))}
        </div>
      )}

      {/* Poll Form Modal */}
      {showForm && (
        <PollForm
          onSubmit={handleCreatePoll}
          onClose={() => {
            setShowForm(false);
            setEditingPoll(null);
            setFormError(null);
          }}
          loading={formLoading}
          editingPoll={editingPoll}
          error={formError}
          onClearError={() => setFormError(null)}
        />
      )}

      {/* Lucky Wheel Modal */}
      {luckyWheelPoll && (
        <LuckyWheelModal
          poll={luckyWheelPoll}
          onClose={() => setLuckyWheelPoll(null)}
        />
      )}
    </div>
  );
}