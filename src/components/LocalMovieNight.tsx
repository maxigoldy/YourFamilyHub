import React, { useState } from 'react';
import { Plus, Search, Film, Users, Popcorn, Eye, EyeOff, History } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { MovieForm } from './MovieForm';
import { RatingModal } from './RatingModal';
import { MovieDetailsModal } from './MovieDetailsModal';
import { useLocalMovies } from '../hooks/useLocalMovies';
import type { Movie, CreateMovieData, UserMovieRatingWithUsername } from '../types/movie';

export function LocalMovieNight() {
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [ratingMovie, setRatingMovie] = useState<Movie | null>(null);
  const [detailsMovie, setDetailsMovie] = useState<Movie | null>(null);
  const [movieRatings, setMovieRatings] = useState<UserMovieRatingWithUsername[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'watched'>('active');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [formLoading, setFormLoading] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  
  const { movies, loading, createMovie, updateMovie, deleteMovie, rateMovie, getAllRatingsForMovie } = useLocalMovies();

  const handleCreateMovie = async (movieData: CreateMovieData) => {
    setFormLoading(true);
    const { error } = editingMovie 
      ? await updateMovie(editingMovie.id, movieData)
      : await createMovie(movieData);
    setFormLoading(false);
    
    if (!error) {
      setShowForm(false);
      setEditingMovie(null);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleToggleWatched = async (id: string, watched: boolean) => {
    await updateMovie(id, { watched });
  };

  const handleDeleteMovie = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this movie?')) {
      await deleteMovie(id);
    }
  };

  const handleRateMovie = async (movieId: string, rating: number, commentary?: string) => {
    await rateMovie(movieId, rating, commentary);
  };

  const handleViewDetails = async (movie: Movie) => {
    setDetailsMovie(movie);
    const { data } = await getAllRatingsForMovie(movie.id);
    setMovieRatings(data || []);
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter based on active tab and 10-second rule for watched movies
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - (10 * 1000));
    const updatedDate = new Date(movie.updated_at);
    
    const matchesTabFilter = activeTab === 'active' 
      ? (!movie.watched || (movie.watched && updatedDate > tenSecondsAgo))
      : (movie.watched && updatedDate <= tenSecondsAgo);
    
    const matchesPlatformFilter = filterPlatform === 'all' || movie.platform === filterPlatform;
    const matchesGenreFilter = filterGenre === 'all' || movie.genre === filterGenre;
    
    return matchesSearch && matchesTabFilter && matchesPlatformFilter && matchesGenreFilter;
  });

  const activeMovies = movies.filter(movie => {
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - (10 * 1000));
    const updatedDate = new Date(movie.updated_at);
    return !movie.watched || (movie.watched && updatedDate > tenSecondsAgo);
  }).length;
  
  const watchedMovies = movies.filter(movie => {
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - (10 * 1000));
    const updatedDate = new Date(movie.updated_at);
    return movie.watched && updatedDate <= tenSecondsAgo;
  }).length;
  
  const platforms = [...new Set(movies.map(movie => movie.platform))];
  const genres = [...new Set(movies.map(movie => movie.genre))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading movie night...</p>
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
            <Popcorn className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-text">Movie Night</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base mb-2">Family watchlist for everyone</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {movies.length} movies
          </span>
          <span className="flex items-center gap-1">
            <Film className="h-4 w-4" />
            {activeMovies} active
          </span>
          <span className="flex items-center gap-1">
            <History className="h-4 w-4" />
            {watchedMovies} archived
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border border-gray-700/50 rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'active'
              ? 'text-yellow-400 bg-yellow-500/20 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
          }`}
        >
          <Film className="h-4 w-4" />
          Active Movies ({activeMovies})
        </button>
        <button
          onClick={() => setActiveTab('watched')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'watched'
              ? 'text-yellow-400 bg-yellow-500/20 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
          }`}
        >
          <History className="h-4 w-4" />
          Already Watched ({watchedMovies})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
            />
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-gold px-4 sm:px-6 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center gap-2 hover-lift text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            Add Movie
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
          >
            <option value="all">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
          
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 input-dark rounded-xl text-sm sm:text-base"
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                showThumbnails
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              {showThumbnails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails'}
            </button>
          </div>
        </div>
      </div>

      {/* Movie List */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Film className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">
            {movies.length === 0 ? 'No movies yet' : 'No movies match your search'}
          </h3>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            {movies.length === 0
              ? 'Start building your family watchlist'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {movies.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-6 sm:px-8 py-2 sm:py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 hover-lift text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              Add your first movie
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleWatched={handleToggleWatched}
              onEdit={handleEditMovie}
              onDelete={handleDeleteMovie}
              showThumbnails={showThumbnails}
              onRate={setRatingMovie}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Movie Form Modal */}
      {showForm && (
        <MovieForm
          onSubmit={handleCreateMovie}
          onClose={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
          loading={formLoading}
          editingMovie={editingMovie}
        />
      )}

      {/* Rating Modal */}
      {ratingMovie && (
        <RatingModal
          movie={ratingMovie}
          onRate={handleRateMovie}
          onClose={() => setRatingMovie(null)}
        />
      )}

      {/* Movie Details Modal */}
      {detailsMovie && (
        <MovieDetailsModal
          movie={detailsMovie}
          ratings={movieRatings}
          isOpen={true}
          onClose={() => setDetailsMovie(null)}
        />
      )}
    </div>
  );
}