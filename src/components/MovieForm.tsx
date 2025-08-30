import React, { useState } from 'react';
import { X, Plus, Film, Youtube } from 'lucide-react';
import type { CreateMovieData, Movie } from '../types/movie';

interface MovieFormProps {
  onSubmit: (movieData: CreateMovieData) => void;
  onClose: () => void;
  loading?: boolean;
  editingMovie?: Movie | null;
}

export function MovieForm({ onSubmit, onClose, loading = false, editingMovie }: MovieFormProps) {
  const [formData, setFormData] = useState<CreateMovieData>({
    title: editingMovie?.title || '',
    description: editingMovie?.description || '',
    platform: editingMovie?.platform || 'netflix',
    genre: editingMovie?.genre || 'action',
    rating: editingMovie?.rating || 'unrated',
    trailer_url: editingMovie?.trailer_url || '',
  });

  React.useEffect(() => {
    if (editingMovie) {
      setFormData({
        title: editingMovie.title,
        description: editingMovie.description || '',
        platform: editingMovie.platform,
        genre: editingMovie.genre,
        rating: editingMovie.rating,
        trailer_url: editingMovie.trailer_url || '',
      });
    }
  }, [editingMovie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    onSubmit(formData);
  };

  const platforms = [
    'netflix', 'disney+', 'amazon-prime', 'apple-tv', 'paramount+', 'jellyfin', 'other'
  ];

  const genres = [
    'action', 'comedy', 'drama', 'horror', 'sci-fi', 'series', 'romance', 'thriller', 'documentary', 'animation', 'family'
  ];

  const ratings = [
    '-', '0', '6', '12', '16', '18'
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
              {editingMovie ? 'Edit Movie' : 'Add Movie'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {editingMovie && (
            <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">
                Added by @{editingMovie.addedByUsername || editingMovie.added_by}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Movie Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              placeholder="Enter movie title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg resize-none text-sm sm:text-base"
              placeholder="Movie description or notes"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
            >
              {ratings.map((rating) => (
                <option key={rating} value={rating}>
                  {rating.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-400" />
                Trailer URL (YouTube)
              </div>
            </label>
            <input
              type="url"
              value={formData.trailer_url}
              onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-lg text-sm sm:text-base"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a YouTube video URL to embed the trailer
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 btn-dark rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 btn-gold px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editingMovie ? 'Update Movie' : 'Add Movie'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}