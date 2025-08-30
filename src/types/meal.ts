export interface Meal {
  id: string;
  date: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  added_by: string;
  added_by_username?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMealData {
  date: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
}

export interface UpdateMealData {
  meal_name?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
}