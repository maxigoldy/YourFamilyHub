import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';
import type { Movie, CreateMovieData, UpdateMovieData, UserMovieRatingWithUsername } from '../types/movie';
import { useLocalAuth } from './useLocalAuth';

export function useLocalMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useLocalAuth();

  const fetchMovies = async () => {
    if (!appUser) {
      setMovies([]);
      setLoading(false);
      return;
    }

    try {
      const data = await localApi.getMovies();
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMovie = async (movieData: CreateMovieData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.createMovie(movieData);
      setMovies((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating movie:', error);
      return { data: null, error };
    }
  };

  const updateMovie = async (id: string, updates: UpdateMovieData) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      const data = await localApi.updateMovie(id, updates);
      setMovies((prev) => prev.map((movie) => (movie.id === id ? data : movie)));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating movie:', error);
      return { data: null, error };
    }
  };

  const deleteMovie = async (id: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      await localApi.deleteMovie(id);
      setMovies((prev) => prev.filter((movie) => movie.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting movie:', error);
      return { error };
    }
  };

  const rateMovie = async (movieId: string, rating: number, commentary?: string) => {
    if (!appUser) return { error: new Error('User not authenticated') };

    try {
      await localApi.rateMovie(movieId, rating, commentary);
      
      // Update local state
      setMovies((prev) => prev.map((movie) => {
        if (movie.id === movieId) {
          return {
            ...movie,
            userRating: rating
          };
        }
        return movie;
      }));
      
      return { error: null };
    } catch (error) {
      console.error('Error rating movie:', error);
      return { error };
    }
  };

  const getAllRatingsForMovie = async (movieId: string) => {
    try {
      const data = await localApi.getMovieRatings(movieId);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching movie ratings:', error);
      return { data: [], error };
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [appUser]);

  return {
    movies,
    loading,
    createMovie,
    updateMovie,
    deleteMovie,
    rateMovie,
    getAllRatingsForMovie,
    refetchMovies: fetchMovies,
  };
}