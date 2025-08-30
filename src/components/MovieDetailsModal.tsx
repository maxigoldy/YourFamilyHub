import React from 'react';
import { X, Star, Calendar, Clock, ExternalLink, Play, Youtube } from 'lucide-react';
import { Movie } from '../types/movie';
import { UserMovieRatingWithUsername } from '../types/movie';

interface MovieDetailsModalProps {
  movie: Movie;
  ratings: UserMovieRatingWithUsername[];
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetailsModal({ movie, ratings, isOpen, onClose }: MovieDetailsModalProps) {
  if (!isOpen) return null;

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  const handleStreamingSearch = () => {
    const searchUrl = `https://www.werstreamt.es/filme-serien/?q=${encodeURIComponent(movie.title)}&action_results=suchen`;
    window.open(searchUrl, '_blank');
  };

  const handleTrailerClick = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, '_blank');
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'netflix':
        return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'disney+':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'amazon-prime':
        return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50';
      case 'hbo-max':
        return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
      case 'hulu':
        return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'apple-tv':
        return 'text-gray-400 bg-gray-800/30 border-gray-600/50';
      default:
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
    }
  };

  const getGenreIcon = (genre: string) => {
    switch (genre.toLowerCase()) {
      case 'action':
        return '🎬';
      case 'comedy':
        return '😂';
      case 'drama':
        return '🎭';
      case 'horror':
        return '👻';
      case 'sci-fi':
        return '🚀';
      case 'romance':
        return '💕';
      case 'thriller':
        return '🔥';
      case 'documentary':
        return '📺';
      case 'animation':
        return '🎨';
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'series':
        return '👀';
      default:
        return '🎬';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const getUserAvatar = (username: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = username.length % colors.length;
    return colors[colorIndex];
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = movie.trailer_url ? getYouTubeVideoId(movie.trailer_url) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getGenreIcon(movie.genre)}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">{movie.title}</h2>
              <p className="text-sm text-gray-400">Movie Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Movie Poster/Thumbnail */}
            <div className="lg:col-span-1">
              {thumbnailUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img 
                    src={thumbnailUrl} 
                    alt={`${movie.title} trailer`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-3">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  {movie.trailer_url && (
                    <button
                      onClick={handleTrailerClick}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors"
                      title="Watch trailer"
                    >
                      <Youtube className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="aspect-video glass-effect rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No Trailer Available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPlatformColor(movie.platform || 'unknown')}`}>
                      {(movie.platform || 'Unknown').charAt(0).toUpperCase() + (movie.platform || 'unknown').slice(1).replace('-', '+')}
                    </span>
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm">
                      {(movie.genre || 'General').charAt(0).toUpperCase() + (movie.genre || 'general').slice(1)}
                    </span>
                    {movie.rating !== 'unrated' && (
                      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm">
                        {(movie.rating || 'Unrated').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Added {new Date(movie.created_at).toLocaleDateString()}</span>
                    {movie.addedByUsername && (
                      <span>by @{movie.addedByUsername}</span>
                    )}
                  </div>

                  {movie.watched && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Watched</span>
                    </div>
                  )}
                </div>
              </div>

              {movie.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleStreamingSearch}
                  className="flex items-center gap-2 px-4 py-2 btn-gold rounded-lg transition-all duration-200 hover-lift"
                >
                  <ExternalLink className="w-4 h-4" />
                  Find Streaming
                </button>
                
                {movie.trailer_url && (
                  <button
                    onClick={handleTrailerClick}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover-lift"
                  >
                    <Play className="w-4 h-4" />
                    Trailer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Family Ratings */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">Family Ratings</h3>
              {ratings.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {averageRating.toFixed(1)} avg ({ratings.length} rating{ratings.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            {ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="glass-effect rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const profilePicture = localStorage.getItem(`profile_picture_${rating.user_id}`);
                          return profilePicture ? (
                            <img
                              src={profilePicture}
                              alt={`${rating.username}'s profile`}
                              className="w-8 h-8 rounded-full object-cover border border-gray-600"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${getUserAvatar(rating.username || 'unknown')} flex items-center justify-center text-white text-sm font-medium`}>
                              {(rating.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-medium text-gray-100">@{rating.username || 'unknown'}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {renderStars(rating.rating)}
                      </div>
                    </div>
                    {rating.commentary && (
                      <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 mt-2">
                        "{rating.commentary}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-lg font-medium text-gray-300 mb-2">No ratings yet</p>
                <p className="text-sm">Be the first to rate this movie!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}