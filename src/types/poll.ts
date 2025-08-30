export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  votes_per_user: number;
  duration_minutes: number;
  expires_at: string;
  created_by: string;
  created_by_username?: string;
  has_lucky_wheel: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  username: string;
  option_index: number;
  created_at: string;
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  votes_per_user: number;
  duration_minutes: number;
  has_lucky_wheel: boolean;
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  options?: string[];
  votes_per_user?: number;
  duration_minutes?: number;
  has_lucky_wheel?: boolean;
}

export interface LuckyWheelResult {
  winningOption: string;
  winningIndex: number;
}