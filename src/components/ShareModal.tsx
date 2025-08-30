import React from 'react';
import { X, Share2, AlertTriangle } from 'lucide-react';
import type { Task } from '../types/task';

interface ShareModalProps {
  task: Task;
  onClose: () => void;
}

export function ShareModal({ task, onClose }: ShareModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Share2 className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Share Task</h2>
              <p className="text-sm text-gray-400 truncate max-w-md">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Feature Not Available</h3>
          <p className="text-gray-400 mb-6 text-sm">
            Task sharing is not available in the self-hosted version to maintain complete local privacy.
          </p>
          <button
            onClick={onClose}
            className="btn-gold px-6 py-3 rounded-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}