import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import type { Movie } from '../types/movie';

interface RatingModalProps {
  movie: Movie;
  onRate: (movieId: string, rating: number) => void;
  onClose: () => void;
}

export function RatingModal({ movie, onRate, onClose }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(movie.userRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [commentary, setCommentary] = useState<string>('');

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onRate(movie.id, selectedRating, commentary.trim() || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Star className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                {movie.userRating ? 'Edit Rating' : 'Rate Movie'}
              </h2>
              <p className="text-sm text-gray-400 truncate max-w-md">{movie.title}</p>
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
          <p className="text-gray-300 mb-6">
            {movie.userRating ? 'Update your rating:' : 'How would you rate this movie?'}
          </p>
          
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-2 transition-all duration-200 hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    rating <= (hoveredRating || selectedRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentary (Optional)
            </label>
            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value.slice(0, 500))}
              className="w-full px-4 py-3 input-dark rounded-lg resize-none text-sm"
              placeholder="Share your thoughts about this movie..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {commentary.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 btn-dark rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedRating === 0}
              className="flex-1 btn-gold px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {movie.userRating ? 'Update Rating' : 'Rate Movie'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}