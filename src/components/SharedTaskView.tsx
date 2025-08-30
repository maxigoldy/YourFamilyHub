import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function SharedTaskView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">Feature Not Available</h2>
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          Task sharing is not available in the self-hosted version
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-gold px-6 py-3 rounded-xl transition-all duration-200 hover-lift text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to YourFamily
        </button>
      </div>
    </div>
  );
}