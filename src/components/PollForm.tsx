import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart3, Clock, Zap } from 'lucide-react';
import type { CreatePollData, Poll } from '../types/poll';

interface PollFormProps {
  onSubmit: (pollData: CreatePollData) => void;
  onClose: () => void;
  loading?: boolean;
  editingPoll?: Poll | null;
  error?: string | null;
  onClearError?: () => void;
}

export function PollForm({ onSubmit, onClose, loading = false, editingPoll, error, onClearError }: PollFormProps) {
  const [formData, setFormData] = useState<CreatePollData>({
    title: editingPoll?.title || '',
    description: editingPoll?.description || '',
    options: editingPoll?.options.map(opt => opt.text) || ['', ''],
    votes_per_user: editingPoll?.votes_per_user || 1,
    duration_minutes: editingPoll?.duration_minutes || 5,
    has_lucky_wheel: editingPoll?.has_lucky_wheel || false,
  });

  React.useEffect(() => {
    if (editingPoll) {
      setFormData({
        title: editingPoll.title,
        description: editingPoll.description || '',
        options: editingPoll.options.map(opt => opt.text),
        votes_per_user: editingPoll.votes_per_user,
        duration_minutes: editingPoll.duration_minutes,
        has_lucky_wheel: editingPoll.has_lucky_wheel,
      });
    }
  }, [editingPoll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    if (onClearError) {
      onClearError();
    }
    
    // Validate form
    if (!formData.title.trim()) {
      alert('Please enter a poll title');
      return;
    }
    
    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (validOptions.length > 20) {
      alert('Maximum 20 options allowed');
      return;
    }

    onSubmit({
      ...formData,
      options: validOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 20) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const durationPresets = [
    { label: '1 minute', value: 1 },
    { label: '2 minutes', value: 2 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <BarChart3 className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">
              {editingPoll ? 'Edit Poll' : 'Create New Poll'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Poll Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 input-dark rounded-lg"
              placeholder="What's your question?"
              required
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 input-dark rounded-lg resize-none"
              placeholder="Add more context to your poll..."
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Options (2-20)
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-3 input-dark rounded-lg"
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {formData.options.length < 20 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-yellow-500/50 rounded-lg text-gray-400 hover:text-yellow-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Votes per user */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Votes per User
              </label>
              <select
                value={formData.votes_per_user}
                onChange={(e) => setFormData({ ...formData, votes_per_user: Number(e.target.value) })}
                className="w-full px-4 py-3 input-dark rounded-lg"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} vote{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  className="flex-1 px-4 py-3 input-dark rounded-lg"
                >
                  {durationPresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                  <option value={0}>Custom</option>
                </select>
                
                {formData.duration_minutes === 0 && (
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    placeholder="Minutes"
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) || 5 })}
                    className="w-24 px-3 py-3 input-dark rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Lucky Wheel */}
          <div className="flex items-center gap-3 p-4 glass-effect rounded-lg">
            <input
              type="checkbox"
              id="luckyWheel"
              checked={formData.has_lucky_wheel}
              onChange={(e) => setFormData({ ...formData, has_lucky_wheel: e.target.checked })}
              className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label htmlFor="luckyWheel" className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Enable Lucky Wheel</span>
            </label>
            <span className="text-xs text-gray-500 ml-auto">
              Allows random selection of options
            </span>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 btn-dark rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-gold px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  {editingPoll ? 'Update Poll' : 'Create Poll'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}