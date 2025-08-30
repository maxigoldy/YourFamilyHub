// Local API client for self-hosted version
const API_BASE = '/api';

class LocalApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('goldytask_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async setupApp(setupData: any) {
    return this.request('/setup', {
      method: 'POST',
      body: JSON.stringify(setupData),
    });
  }

  // Auth
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string, family_code: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, family_code }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUsernames() {
    return this.request('/users/usernames');
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, updates: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Movies
  async getMovies() {
    return this.request('/movies');
  }

  async createMovie(movieData: any) {
    return this.request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(id: string, updates: any) {
    return this.request(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMovie(id: string) {
    return this.request(`/movies/${id}`, {
      method: 'DELETE',
    });
  }

  async rateMovie(id: string, rating: number, commentary?: string) {
    return this.request(`/movies/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, commentary }),
    });
  }

  async getMovieRatings(id: string) {
    return this.request(`/movies/${id}/ratings`);
  }

  // Polls
  async getPolls() {
    return this.request('/polls');
  }

  async getPoll(id: string) {
    return this.request(`/polls/${id}`);
  }

  async createPoll(pollData: any) {
    return this.request('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async updatePoll(id: string, updates: any) {
    return this.request(`/polls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePoll(id: string) {
    return this.request(`/polls/${id}`, {
      method: 'DELETE',
    });
  }

  async votePoll(id: string, option_index: number) {
    return this.request(`/polls/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_index }),
    });
  }

  async getPollVotes(id: string) {
    return this.request(`/polls/${id}/votes`);
  }

  // Meals
  async getMeals() {
    return this.request('/meals');
  }

  async createMeal(mealData: any) {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  async updateMeal(id: string, updates: any) {
    return this.request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMeal(id: string) {
    return this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // MotoGP
  async getMotoGPEvents() {
    return this.request('/motogp/events');
  }

  async createMotoGPEvent(eventData: any) {
    return this.request('/motogp/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async clearMotoGPEvents() {
    return this.request('/motogp/events', {
      method: 'DELETE',
    });
  }

  async importMotoGPCalendar(icsContent: string) {
    return this.request('/motogp/import', {
      method: 'POST',
      body: JSON.stringify({ icsContent }),
    });
  }

  // Network Links
  async getNetworkLinks() {
    return this.request('/network-links');
  }

  async createNetworkLink(linkData: any) {
    return this.request('/network-links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  }

  async updateNetworkLink(id: string, updates: any) {
    return this.request(`/network-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteNetworkLink(id: string) {
    return this.request(`/network-links/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin
  async verifyAdminPassword(password: string) {
    return this.request('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}

export const localApi = new LocalApiClient();