import React from 'react';
import { Calendar, Clock, MapPin, Flag } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import type { MotoGPEvent } from '../types/motogp';

interface MotoGPEventCardProps {
  event: MotoGPEvent;
  isNext?: boolean;
}

export function MotoGPEventCard({ event, isNext = false }: MotoGPEventCardProps) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  const getTimeLabel = () => {
    if (isToday(startDate)) return 'Today';
    if (isTomorrow(startDate)) return 'Tomorrow';
    if (isThisWeek(startDate)) return format(startDate, 'EEEE');
    return format(startDate, 'MMM d, yyyy');
  };

  const getTimeDetails = () => {
    const startTime = format(startDate, 'HH:mm');
    if (endDate) {
      const endTime = format(endDate, 'HH:mm');
      const sameDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
      
      if (sameDay) {
        return `${startTime} - ${endTime}`;
      } else {
        return `${format(startDate, 'MMM d, HH:mm')} - ${format(endDate, 'MMM d, HH:mm')}`;
      }
    }
    return startTime;
  };

  return (
    <div className={`glass-effect rounded-xl p-4 sm:p-6 transition-all duration-300 hover-lift animate-slide-up ${
      isNext 
        ? 'border-yellow-500/50 bg-yellow-500/10' 
        : 'border-gray-700/50 hover:border-yellow-500/50'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isNext ? 'bg-yellow-500/20' : 'bg-gray-700/50'}`}>
          <Flag className={`h-6 w-6 ${isNext ? 'text-yellow-400' : 'text-gray-400'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold text-lg ${isNext ? 'text-yellow-100' : 'text-gray-100'}`}>
              {event.title}
            </h3>
            {isNext && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                Next
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <div className={`flex items-center gap-1 ${isNext ? 'text-yellow-300' : 'text-gray-300'}`}>
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{getTimeLabel()}</span>
            </div>
            
            <div className={`flex items-center gap-1 ${isNext ? 'text-yellow-300' : 'text-gray-400'}`}>
              <Clock className="h-4 w-4" />
              <span>{getTimeDetails()}</span>
            </div>
            
            {event.location && (
              <div className={`flex items-center gap-1 ${isNext ? 'text-yellow-300' : 'text-gray-400'}`}>
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {isNext && (
            <div className="mt-3 pt-3 border-t border-yellow-500/20">
              <p className="text-xs text-yellow-300/80">
                🏁 Get ready for the next MotoGP event!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}