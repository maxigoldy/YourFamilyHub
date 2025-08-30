import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// JSON file storage
const DATA_FILE = 'data.json';

// Default data structure
const defaultData = {
  users: [],
  tasks: [],
  movies: [],
  polls: [],
  meals: [],
  events: [],
  links: [],
  admin_password: '',
  family_code: '',
  settings: {
    app_name: 'YourFamily',
    motogp_enabled: true,
    setup_completed: false
  }
};

// Load data from JSON file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return defaultData;
}

// Save data to JSON file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data
let appData = loadData();

// Helper function to get current user from token
function getCurrentUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const userData = JSON.parse(Buffer.from(token, 'base64').toString());
    return userData;
  } catch (error) {
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(appData.settings);
});

app.post('/api/settings', (req, res) => {
  appData.settings = { ...appData.settings, ...req.body };
  
  // Update admin password and family code if provided
  if (req.body.admin_password) {
    appData.admin_password = req.body.admin_password;
  }
  if (req.body.family_code) {
    appData.family_code = req.body.family_code;
  }
  
  saveData(appData);
  res.json({ success: true });
});

app.post('/api/setup', (req, res) => {
  const { admin_username, admin_password, family_code, app_name } = req.body;
  
  const user = {
    id: '1',
    username: admin_username,
    is_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.users.push(user);
  appData.settings.setup_completed = true;
  appData.settings.app_name = app_name || 'YourFamily';
  appData.admin_password = admin_password;
  appData.family_code = family_code;
  
  saveData(appData);
  
  const token = Buffer.from(JSON.stringify({
    user_id: user.id,
    username: user.username,
    is_admin: user.is_admin
  })).toString('base64');
  
  res.json({ 
    success: true, 
    token,
    user: {
      user_id: user.id,
      username: user.username,
      is_admin: user.is_admin
    }
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = appData.users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  const token = Buffer.from(JSON.stringify({
    user_id: user.id,
    username: user.username,
    is_admin: user.is_admin
  })).toString('base64');

  res.json({ 
    success: true, 
    token,
    user: {
      user_id: user.id,
      username: user.username,
      is_admin: user.is_admin
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, family_code } = req.body;
  
  // Check family code
  if (family_code !== appData.family_code) {
    return res.status(401).json({ error: 'Invalid family code' });
  }
  
  // Check if username already exists
  if (appData.users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  
  const user = {
    id: Date.now().toString(),
    username,
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.users.push(user);
  saveData(appData);
  
  const token = Buffer.from(JSON.stringify({
    user_id: user.id,
    username: user.username,
    is_admin: user.is_admin
  })).toString('base64');

  res.json({ 
    success: true, 
    token,
    user: {
      user_id: user.id,
      username: user.username,
      is_admin: user.is_admin
    }
  });
});

// User endpoints
app.get('/api/users', (req, res) => {
  res.json(appData.users);
});

app.get('/api/users/usernames', (req, res) => {
  res.json(appData.users.map(u => u.username));
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = appData.users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    appData.users[userIndex] = { ...appData.users[userIndex], ...req.body, updated_at: new Date().toISOString() };
    saveData(appData);
    res.json(appData.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  // Also delete all tasks for this user
  appData.tasks = appData.tasks.filter(t => t.user_id !== id);
  appData.users = appData.users.filter(u => u.id !== id);
  saveData(appData);
  res.json({ success: true });
});

// Task endpoints - now user-specific
app.get('/api/tasks', (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.json([]);
  }
  
  // Return tasks for current user and tasks assigned to them
  const userTasks = appData.tasks.filter(task => 
    task.user_id === currentUser.user_id || 
    task.assigned_to_username === currentUser.username
  );
  
  res.json(userTasks);
});

app.post('/api/tasks', (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const task = {
    id: Date.now().toString(),
    ...req.body,
    completed: false,
    user_id: currentUser.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.tasks.push(task);
  saveData(appData);
  res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const taskIndex = appData.tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    const task = appData.tasks[taskIndex];
    
    // Check if user can edit this task (owner or assigned user)
    if (task.user_id === currentUser.user_id || task.assigned_to_username === currentUser.username) {
      appData.tasks[taskIndex] = { ...task, ...req.body, updated_at: new Date().toISOString() };
      saveData(appData);
      res.json(appData.tasks[taskIndex]);
    } else {
      res.status(403).json({ error: 'Not authorized to edit this task' });
    }
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const task = appData.tasks.find(t => t.id === id);
  if (task && task.user_id === currentUser.user_id) {
    appData.tasks = appData.tasks.filter(t => t.id !== id);
    saveData(appData);
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Not authorized to delete this task' });
  }
});

// Movie endpoints - shared watchlist with individual ratings
app.get('/api/movies', (req, res) => {
  const currentUser = getCurrentUser(req);
  
  // Add user-specific rating to each movie
  const moviesWithRatings = appData.movies.map(movie => {
    const userRating = currentUser ? appData.movie_ratings?.find(r => 
      r.movie_id === movie.id && r.user_id === currentUser.user_id
    ) : null;
    
    return {
      ...movie,
      addedByUsername: appData.users.find(u => u.id === movie.added_by)?.username || 'unknown',
      userRating: userRating?.rating || null
    };
  });
  
  res.json(moviesWithRatings);
});

app.post('/api/movies', (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const movie = {
    id: Date.now().toString(),
    ...req.body,
    watched: false,
    added_by: currentUser.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.movies.push(movie);
  saveData(appData);
  
  // Add username for response
  movie.addedByUsername = currentUser.username;
  res.json(movie);
});

app.put('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = appData.movies.findIndex(m => m.id === id);
  if (movieIndex !== -1) {
    appData.movies[movieIndex] = { ...appData.movies[movieIndex], ...req.body, updated_at: new Date().toISOString() };
    saveData(appData);
    res.json(appData.movies[movieIndex]);
  } else {
    res.status(404).json({ error: 'Movie not found' });
  }
});

app.delete('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  appData.movies = appData.movies.filter(m => m.id !== id);
  // Also remove all ratings for this movie
  if (appData.movie_ratings) {
    appData.movie_ratings = appData.movie_ratings.filter(r => r.movie_id !== id);
  }
  saveData(appData);
  res.json({ success: true });
});

app.post('/api/movies/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating, commentary } = req.body;
  const currentUser = getCurrentUser(req);
  
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Initialize movie_ratings if it doesn't exist
  if (!appData.movie_ratings) {
    appData.movie_ratings = [];
  }
  
  // Find existing rating or create new one
  const existingRatingIndex = appData.movie_ratings.findIndex(r => 
    r.movie_id === id && r.user_id === currentUser.user_id
  );
  
  const ratingData = {
    id: existingRatingIndex !== -1 ? appData.movie_ratings[existingRatingIndex].id : Date.now().toString(),
    movie_id: id,
    user_id: currentUser.user_id,
    rating,
    commentary: commentary || null,
    created_at: existingRatingIndex !== -1 ? appData.movie_ratings[existingRatingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (existingRatingIndex !== -1) {
    appData.movie_ratings[existingRatingIndex] = ratingData;
  } else {
    appData.movie_ratings.push(ratingData);
  }
  
  saveData(appData);
  res.json({ success: true });
});

app.get('/api/movies/:id/ratings', (req, res) => {
  const { id } = req.params;
  
  if (!appData.movie_ratings) {
    return res.json([]);
  }
  
  const ratings = appData.movie_ratings
    .filter(r => r.movie_id === id)
    .map(rating => ({
      ...rating,
      username: appData.users.find(u => u.id === rating.user_id)?.username || 'unknown'
    }));
  
  res.json(ratings);
});

// Poll endpoints
app.get('/api/polls', (req, res) => {
  const pollsWithUsernames = appData.polls.map(poll => ({
    ...poll,
    created_by_username: appData.users.find(u => u.id === poll.created_by)?.username || 'unknown'
  }));
  res.json(pollsWithUsernames);
});

app.get('/api/polls/:id', (req, res) => {
  const { id } = req.params;
  const poll = appData.polls.find(p => p.id === id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  
  const pollWithUsername = {
    ...poll,
    created_by_username: appData.users.find(u => u.id === poll.created_by)?.username || 'unknown'
  };
  
  res.json(pollWithUsername);
});

app.post('/api/polls', (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const poll = {
    id: Date.now().toString(),
    ...req.body,
    created_by: currentUser.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.polls.push(poll);
  saveData(appData);
  
  // Add username for response
  poll.created_by_username = currentUser.username;
  res.json(poll);
});

app.put('/api/polls/:id', (req, res) => {
  const { id } = req.params;
  const pollIndex = appData.polls.findIndex(p => p.id === id);
  if (pollIndex !== -1) {
    appData.polls[pollIndex] = { ...appData.polls[pollIndex], ...req.body, updated_at: new Date().toISOString() };
    saveData(appData);
    res.json(appData.polls[pollIndex]);
  } else {
    res.status(404).json({ error: 'Poll not found' });
  }
});

app.delete('/api/polls/:id', (req, res) => {
  const { id } = req.params;
  appData.polls = appData.polls.filter(p => p.id !== id);
  // Also remove all votes for this poll
  if (appData.poll_votes) {
    appData.poll_votes = appData.poll_votes.filter(v => v.poll_id !== id);
  }
  saveData(appData);
  res.json({ success: true });
});

app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { option_index } = req.body;
  const currentUser = getCurrentUser(req);
  
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const pollIndex = appData.polls.findIndex(p => p.id === id);
  if (pollIndex !== -1) {
    // Initialize poll_votes if it doesn't exist
    if (!appData.poll_votes) {
      appData.poll_votes = [];
    }
    
    // Check if user has already voted maximum times
    const userVotes = appData.poll_votes.filter(v => v.poll_id === id && v.user_id === currentUser.user_id);
    const poll = appData.polls[pollIndex];
    
    if (userVotes.length >= poll.votes_per_user) {
      return res.status(400).json({ error: 'Maximum votes reached for this poll' });
    }
    
    // Add vote record
    appData.poll_votes.push({
      id: Date.now().toString(),
      poll_id: id,
      user_id: currentUser.user_id,
      username: currentUser.username,
      option_index,
      created_at: new Date().toISOString()
    });
    
    // Update poll option vote count
    appData.polls[pollIndex].options[option_index].votes += 1;
    saveData(appData);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Poll not found' });
  }
});

app.get('/api/polls/:id/votes', (req, res) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);
  
  if (!appData.poll_votes) {
    return res.json([]);
  }
  
  // Return only current user's votes
  const userVotes = appData.poll_votes.filter(v => 
    v.poll_id === id && v.user_id === currentUser?.user_id
  );
  
  res.json(userVotes);
});

// Meal endpoints
app.get('/api/meals', (req, res) => {
  const mealsWithUsernames = appData.meals.map(meal => ({
    ...meal,
    added_by_username: appData.users.find(u => u.id === meal.added_by)?.username || 'unknown'
  }));
  res.json(mealsWithUsernames);
});

app.post('/api/meals', (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const meal = {
    id: Date.now().toString(),
    ...req.body,
    added_by: currentUser.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  appData.meals.push(meal);
  saveData(appData);
  
  // Add username for response
  meal.added_by_username = currentUser.username;
  res.json(meal);
});

app.put('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  const mealIndex = appData.meals.findIndex(m => m.id === id);
  if (mealIndex !== -1) {
    appData.meals[mealIndex] = { ...appData.meals[mealIndex], ...req.body, updated_at: new Date().toISOString() };
    saveData(appData);
    res.json(appData.meals[mealIndex]);
  } else {
    res.status(404).json({ error: 'Meal not found' });
  }
});

app.delete('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  appData.meals = appData.meals.filter(m => m.id !== id);
  saveData(appData);
  res.json({ success: true });
});

// MotoGP endpoints
app.get('/api/motogp/events', (req, res) => {
  const sortedEvents = appData.events.sort((a, b) => a.start_date.localeCompare(b.start_date));
  res.json(sortedEvents);
});

app.post('/api/motogp/events', (req, res) => {
  const event = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  appData.events.push(event);
  saveData(appData);
  res.json(event);
});

app.delete('/api/motogp/events', (req, res) => {
  appData.events = [];
  saveData(appData);
  res.json({ success: true });
});

app.post('/api/motogp/import', (req, res) => {
  const { icsContent } = req.body;
  
  appData.events = [];
  
  const parsedEvents = parseICSContent(icsContent);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureEvents = parsedEvents.filter(event => new Date(event.start_date) >= today);

  futureEvents.forEach(event => {
    appData.events.push({
      id: Date.now().toString() + Math.random(),
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  saveData(appData);
  res.json({ success: true, imported: futureEvents.length });
});

// Network links endpoints
app.get('/api/network-links', (req, res) => {
  res.json(appData.links);
});

app.post('/api/network-links', (req, res) => {
  const link = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  appData.links.push(link);
  saveData(appData);
  res.json(link);
});

app.put('/api/network-links/:id', (req, res) => {
  const { id } = req.params;
  const linkIndex = appData.links.findIndex(l => l.id === id);
  if (linkIndex !== -1) {
    appData.links[linkIndex] = { ...appData.links[linkIndex], ...req.body, updated_at: new Date().toISOString() };
    saveData(appData);
    res.json(appData.links[linkIndex]);
  } else {
    res.status(404).json({ error: 'Link not found' });
  }
});

app.delete('/api/network-links/:id', (req, res) => {
  const { id } = req.params;
  appData.links = appData.links.filter(l => l.id !== id);
  saveData(appData);
  res.json({ success: true });
});

// Admin verification endpoint
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  
  if (password === appData.admin_password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
});

// Utility function for ICS parsing
function parseICSContent(icsContent) {
  const events = [];
  const lines = icsContent.split('\n').map(line => line.trim());
  
  let currentEvent = {};
  let inEvent = false;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.title && currentEvent.start_date) {
        events.push(currentEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      } else if (line.startsWith('DTSTART')) {
        const dateValue = line.split(':')[1];
        currentEvent.start_date = parseICSDate(dateValue);
      } else if (line.startsWith('DTEND')) {
        const dateValue = line.split(':')[1];
        currentEvent.end_date = parseICSDate(dateValue);
      }
    }
  }

  return events;
}

function parseICSDate(dateStr) {
  if (dateStr.includes('T')) {
    const cleanDate = dateStr.replace(/[TZ]/g, '');
    const year = cleanDate.substring(0, 4);
    const month = cleanDate.substring(4, 6);
    const day = cleanDate.substring(6, 8);
    const hour = cleanDate.substring(8, 10) || '00';
    const minute = cleanDate.substring(10, 12) || '00';
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
  } else {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    return new Date(`${year}-${month}-${day}T00:00:00`).toISOString();
  }
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`YourFamily server running on port ${PORT}`);
  console.log(`Access your family hub at: http://localhost:${PORT}`);
});