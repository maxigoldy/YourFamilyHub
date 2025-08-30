import React, { useState, useRef } from 'react';
import { Calendar, Upload, Trash2, MapPin, Clock, Flag, FileText, AlertCircle } from 'lucide-react';
import { MotoGPEventCard } from './MotoGPEventCard';
import { useLocalMotoGP } from '../hooks/useLocalMotoGP';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

export function LocalMotoGPTab() {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { events, loading, importFromICS, clearAllEvents } = useLocalMotoGP();
  const { appUser } = useLocalAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ics')) {
      setImportError('Please select a valid .ics calendar file');
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const content = await file.text();
      const { data, error } = await importFromICS(content);
      
      if (error) {
        alert('Error importing calendar: ' + (error as Error).message);
      } else {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
    } catch (error) {
      setImportError('Failed to read calendar file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all MotoGP events? This action cannot be undone.')) {
      await clearAllEvents();
    }
  };

  const getEventTimeLabel = (startDate: string) => {
    const date = new Date(startDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d, yyyy');
  };

  const nextEvent = events[0]; // Events are sorted by date, so first is next
  const upcomingEvents = events.slice(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading MotoGP calendar...</p>
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
            <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-text">MotoGP</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base mb-2">Track upcoming MotoGP races and events</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {events.length} upcoming events
          </span>
          {nextEvent && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Next: {getEventTimeLabel(nextEvent.start_date)}
            </span>
          )}
        </div>
      </div>

      {/* Import Controls */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-100">Import Calendar</h3>
        </div>
        
        {importError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-red-300 text-sm">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-300 text-sm">Calendar imported successfully!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics"
              onChange={handleFileUpload}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 disabled:opacity-50"
            />
          </div>
        {appUser?.is_admin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleClearAll}
              disabled={importing}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        )}
        </div>
        
        <p className="text-xs text-gray-400 mt-2">
          Upload a .ics calendar file to import MotoGP events. All existing events will be replaced.
        </p>
      </div>

      {/* Next Event Highlight */}
      {nextEvent && (
        <div className="glass-effect rounded-2xl p-6 border border-yellow-500/50 bg-yellow-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Next Race</h3>
          </div>
          <MotoGPEventCard event={nextEvent} isNext={true} />
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-yellow-500" />
            Upcoming Events ({upcomingEvents.length})
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <MotoGPEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Flag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">No upcoming events</h3>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Import a MotoGP calendar file to see upcoming races and events
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-gold px-6 sm:px-8 py-2 sm:py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 hover-lift text-sm sm:text-base"
          >
            <Upload className="h-4 w-4" />
            Import Calendar
          </button>
        </div>
      )}
    </div>
  );
}