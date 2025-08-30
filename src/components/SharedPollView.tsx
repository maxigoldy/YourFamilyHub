import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Clock, CheckCircle, Crown, AlertTriangle, ArrowLeft } from 'lucide-react';
import { localApi } from '../lib/localApi';
import type { Poll, PollVote } from '../types/poll';

export function SharedPollView() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestId] = useState(() => {
    const stored = localStorage.getItem('guest_poll_id');
    if (stored) return stored;
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_poll_id', newId);
    return newId;
  });

  useEffect(() => {
    if (pollId) {
      loadPoll();
      loadUserVotes();
    }
  }, [pollId]);

  useEffect(() => {
    if (poll) {
      const updateTimer = () => {
        const now = new Date();
        const expires = new Date(poll.expires_at);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft('Expired');
          setIsExpired(true);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          setIsExpired(false);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [poll]);

  const loadPoll = async () => {
    if (!pollId) return;
    
    try {
      const data = await localApi.getPoll(pollId);
      setPoll(data);
    } catch (error) {
      console.error('Error loading poll:', error);
      setError('Poll not found or has been deleted');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = () => {
    if (!pollId) return;
    const votes = localStorage.getItem(`poll_votes_${pollId}_${guestId}`);
    setUserVotes(votes ? JSON.parse(votes) : []);
  };

  const handleVote = async (optionIndex: number) => {
    if (!poll || isExpired || poll.has_lucky_wheel) return;
    
    if (userVotes.length >= poll.votes_per_user) {
      alert(`You can only vote ${poll.votes_per_user} time(s) on this poll`);
      return;
    }

    try {
      // Update poll options vote count
      const updatedOptions = [...poll.options];
      updatedOptions[optionIndex].votes += 1;

      await localApi.updatePoll(poll.id, { 
        options: updatedOptions
      });

      // Update local state
      const newUserVotes = [...userVotes, optionIndex];
      setUserVotes(newUserVotes);
      localStorage.setItem(`poll_votes_${poll.id}_${guestId}`, JSON.stringify(newUserVotes));
      
      setPoll({ ...poll, options: updatedOptions });
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const getOptionPercentage = (votes: number) => {
    if (!poll) return 0;
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getWinningOptions = () => {
    if (!poll) return [];
    const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
    // For lucky wheel polls that have ended, there should always be a winner even with 0 votes
    const winners = poll.options.filter(opt => opt.votes === maxVotes && (maxVotes > 0 || (isExpired && poll.has_lucky_wheel)));
    
    // If there are multiple winners with same votes, pick one randomly
    if (winners.length > 1 && isExpired) {
      const randomIndex = Math.floor(Math.random() * winners.length);
      return [winners[randomIndex]];
    }
    
    return winners;
  };

  const winningOptions = getWinningOptions();
  const hasWinner = winningOptions.length > 0;
  const totalVotes = poll ? poll.options.reduce((sum, option) => sum + option.votes, 0) : 0;
  const canVote = !isExpired && poll && userVotes.length < poll.votes_per_user && !poll.has_lucky_wheel;
  const showWinnerOnly = isExpired && hasWinner;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">Poll Not Found</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-gold px-6 py-3 rounded-xl transition-all duration-200 hover-lift text-sm sm:text-base flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to GoldFamily
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 sm:p-3 gold-gradient rounded-2xl">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gold-text">Shared Poll</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">Vote and see results in real-time</p>
        </div>

        {/* Poll Card */}
        <div className={`glass-effect rounded-2xl p-6 transition-all duration-300 animate-slide-up ${
          isExpired ? 'border-gray-600/50 opacity-75' : 'border-gray-700/50'
        }`}>
          {/* Poll Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-1">{poll.title}</h3>
              {poll.description && (
                <p className="text-sm text-gray-400 mb-2">{poll.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {totalVotes} votes
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {poll.votes_per_user} per user
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Options */}
          {(showWinnerOnly || (isExpired && winningOptions.length > 0)) && winningOptions.length > 0 ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-yellow-400">Winner!</h3>
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
              {winningOptions.map((option, index) => (
                <div key={index} className="glass-effect rounded-lg p-4 border border-yellow-500/50 bg-yellow-500/10 mb-2">
                  <p className="text-xl font-semibold text-gray-100">{option.text}</p>
                  {!poll.has_lucky_wheel && (
                    <p className="text-sm text-gray-400 mt-2">
                      {option.votes} votes ({getOptionPercentage(option.votes)}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {poll.options.map((option, index) => {
                const percentage = getOptionPercentage(option.votes);
                const userVotedForThis = userVotes.includes(index);
                const canVoteForThis = canVote;
                const isWinner = !isExpired && hasWinner && winningOptions.some(w => w.text === option.text);
                
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => handleVote(index)}
                      disabled={!canVoteForThis}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        userVotedForThis
                          ? 'border-green-500/50 bg-green-900/20 text-green-100'
                          : isWinner
                            ? 'border-yellow-500/50 bg-yellow-900/20 text-yellow-100'
                            : canVoteForThis
                              ? 'border-gray-600 bg-gray-800/50 hover:border-yellow-500/50 hover:bg-gray-700/50 text-gray-200'
                              : 'border-gray-700 bg-gray-800/30 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {userVotedForThis && <CheckCircle className="h-4 w-4 text-green-400" />}
                          {isWinner && <Crown className="h-4 w-4 text-yellow-400" />}
                          <span className="font-medium">{option.text}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{option.votes}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            userVotedForThis ? 'bg-green-500' : isWinner ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
              
              {poll.has_lucky_wheel && !isExpired && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                    <Crown className="h-4 w-4" />
                    <span>This poll uses a Lucky Wheel - winner will be selected randomly!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
            <span>Created by @{poll.created_by_username || 'unknown'}</span>
            {userVotes.length > 0 && !showWinnerOnly && (
              <span className="text-green-400">
                You voted {userVotes.length}/{poll.votes_per_user} times
              </span>
            )}
            {showWinnerOnly && (
              <span className="text-yellow-400 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Poll Ended
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">
            Powered by <span className="gold-text font-semibold">YourFamily</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-gold px-6 py-3 rounded-xl transition-all duration-200 hover-lift text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to YourFamily
          </button>
        </div>
      </div>
    </div>
  );
}