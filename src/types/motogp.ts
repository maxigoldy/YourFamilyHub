export interface MotoGPEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMotoGPEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
}

export interface UpdateMotoGPEventData {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}