export interface Movie {
  id: string;
  title: string;
  description?: string;
  platform: string;
  genre: string;
  rating: string;
  watched: boolean;
  added_by: string;
  created_at: string;
  updated_at: string;
  trailer_url?: string;
  addedByUsername?: string;
  userRating?: number | null;
}

export interface UserMovieRatingWithUsername {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  commentary?: string;
  created_at: string;
  updated_at: string;
  username: string;
}

export interface CreateMovieData {
  title: string;
  description?: string;
  platform: string;
  genre: string;
  rating: string;
  trailer_url?: string;
}

export interface UpdateMovieData {
  title?: string;
  description?: string;
  platform?: string;
  genre?: string;
  rating?: string;
  watched?: boolean;
  trailer_url?: string;
}