import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalAuthForm } from './components/LocalAuthForm';
import { LocalTaskList } from './components/LocalTaskList';
import { SharedTaskView } from './components/SharedTaskView';
import { SharedPollView } from './components/SharedPollView';
import { SetupPage } from './components/SetupPage';
import { NotFound } from './components/NotFound';
import { useLocalAuth } from './hooks/useLocalAuth';
import { useLocalSettings } from './hooks/useLocalSettings';

function App() {
  const { user, loading } = useLocalAuth();
  const { settings, loading: settingsLoading } = useLocalSettings();

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup page if not completed
  if (!settings.setup_completed) {
    return <SetupPage onSetupComplete={(user) => window.location.reload()} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/shared/:token" element={<SharedTaskView />} />
        <Route path="/shared-poll/:pollId" element={<SharedPollView />} />
        <Route path="/" element={user ? <LocalTaskList /> : <LocalAuthForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;