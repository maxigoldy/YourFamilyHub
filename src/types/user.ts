export interface AppUser {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  is_admin?: boolean;
}

export interface UpdateUserData {
  username?: string;
  is_admin?: boolean;
}

export interface NetworkLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}