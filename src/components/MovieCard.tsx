import React from 'react';
import { Film, Edit2, Trash2, CheckCircle, Circle, Play, User, Youtube, Eye, EyeOff, Star, Info, ExternalLink } from 'lucide-react';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onToggleWatched: (id: string, watched: boolean) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  showThumbnails?: boolean;
  onRate?: (movie: Movie) => void;
  onViewDetails?: (movie: Movie) => void;
}

export function MovieCard({ movie, onToggleWatched, onEdit, onDelete, showThumbnails = true, onRate, onViewDetails }: MovieCardProps) {
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

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = movie.trailer_url ? getYouTubeVideoId(movie.trailer_url) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  const getStreamingUrl = (title: string) => {
    const encodedTitle = encodeURIComponent(title);
    return `https://www.werstreamt.es/filme-serien/?q=${encodedTitle}&action_results=suchen`;
  };
  return (
    <div className={`glass-effect rounded-xl overflow-hidden transition-all duration-300 hover-lift animate-slide-up ${
      movie.watched 
        ? 'border-green-500/50 bg-green-900/20' 
        : 'border-gray-700/50 hover:border-yellow-500/50'
    }`}>
      {/* Thumbnail */}
      {showThumbnails && thumbnailUrl && (
        <div className="relative">
          <img 
            src={thumbnailUrl} 
            alt={`${movie.title} trailer`}
            className="w-full h-32 sm:h-40 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-red-600 rounded-full p-2">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
          {movie.trailer_url && (
            <a
              href={movie.trailer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-colors"
              title="Watch trailer"
            >
              <Youtube className="h-3 w-3 text-white" />
            </a>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleWatched(movie.id, !movie.watched)}
          className="flex-shrink-0 mt-1 transition-all duration-200 hover:scale-110"
        >
          {movie.watched ? (
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
          ) : (
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-yellow-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg sm:text-xl">{getGenreIcon(movie.genre)}</span>
              <h3 className={`font-medium text-sm sm:text-base truncate ${
                movie.watched 
                  ? 'text-gray-500 line-through'
                  : 'text-gray-100'
              }`}>
                {movie.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border ${getPlatformColor(movie.platform)}`}>
                {movie.platform.charAt(0).toUpperCase() + movie.platform.slice(1).replace('-', '+')}
              </span>
              {movie.rating !== 'unrated' && (
                <>
                  <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full">
                    {movie.rating.toUpperCase()}
                  </span>
                </>
              )}
            </div>
          </div>

          {movie.description && (
            <p className={`text-xs sm:text-sm mb-3 ${
              movie.watched ? 'text-gray-400' : 'text-gray-300'
            }`}>
              {movie.description}
            </p>
          )}

          {movie.userRating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= movie.userRating!
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-1">
                ({movie.userRating}/5)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <span className="px-2 sm:px-3 py-1 bg-gray-700/50 rounded-full font-medium">
                {movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}
              </span>
              {onRate && (
                <button
                  onClick={() => onRate(movie)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    movie.userRating 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  }`}
                >
                  <Star className="h-3 w-3" />
                  {movie.userRating ? 'Edit Rating' : 'Rate'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href={getStreamingUrl(movie.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                title="Find streaming platforms"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(movie)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                  title="View details"
                >
                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              {movie.trailer_url && !showThumbnails && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  title="Watch trailer"
                >
                  <Youtube className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              )}
              <button
                onClick={() => onEdit(movie)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                title="Edit movie"
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => onDelete(movie.id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Delete movie"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Added by info */}
      <div className="px-4 sm:px-6 pb-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User className="h-3 w-3" />
          <span>Added by {movie.addedByUsername || '@unknown'}</span>
        </div>
      </div>
    </div>
  );
}