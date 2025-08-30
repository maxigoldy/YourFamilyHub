import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="p-4 bg-red-500/20 rounded-2xl inline-block mb-6">
          <AlertTriangle className="h-16 w-16 text-red-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-100 mb-4">404</h1>
        <h2 className="text-xl font-semibold gold-text mb-4">Page Not Found</h2>
        
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Redirecting to home in
          </p>
          <div className="text-3xl font-bold gold-text">
            {countdown}
          </div>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="btn-gold px-6 py-3 rounded-xl transition-all duration-200 hover-lift flex items-center justify-center gap-2 mx-auto"
        >
          <Home className="h-5 w-5" />
          Go to YourFamily
        </button>
      </div>
    </div>
  );
}