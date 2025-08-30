import React, { useState, useEffect } from 'react';
import { Clock, Users, Edit2, Trash2, Zap, BarChart3, CheckCircle, Crown, Share2, Copy, Check } from 'lucide-react';
import { useLocalPolls } from '../hooks/useLocalPolls';
import { useLocalAuth } from '../hooks/useLocalAuth';
import type { Poll, PollVote } from '../types/poll';

interface PollCardProps {
  poll: Poll;
  onEdit: (poll: Poll) => void;
  onDelete: (id: string) => void;
  onLuckyWheel: (poll: Poll) => void;
}

export function LocalPollCard({ poll, onEdit, onDelete, onLuckyWheel }: PollCardProps) {
  const [userVotes, setUserVotes] = useState<PollVote[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [showCopied, setShowCopied] = useState(false);
  const { vote, getUserVotes } = useLocalPolls();
  const { appUser } = useLocalAuth();

  useEffect(() => {
    if (appUser) {
      loadUserVotes();
    }
  }, [poll.id, appUser]);

  useEffect(() => {
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
  }, [poll.expires_at]);

  const loadUserVotes = async () => {
    const { data } = await getUserVotes(poll.id);
    setUserVotes(data);
  };

  const handleVote = async (optionIndex: number) => {
    if (isExpired || !appUser) return;
    
    const { error } = await vote(poll.id, optionIndex);
    if (!error) {
      loadUserVotes();
    } else {
      alert(error.message);
    }
  };

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const canVote = !isExpired && appUser && userVotes.length < poll.votes_per_user;
  const hasVoted = userVotes.length > 0;

  const getOptionPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };
  
  const getWinningOptions = () => {
    const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
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
  const showWinnerOnly = isExpired && hasWinner;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared-poll/${poll.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setShareLink(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className={`glass-effect rounded-xl p-6 transition-all duration-300 hover-lift animate-slide-up ${
      isExpired ? 'border-gray-600/50 opacity-75' : 'border-gray-700/50 hover:border-yellow-500/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-100 mb-1">{poll.title}</h3>
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
            {poll.has_lucky_wheel && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Zap className="h-3 w-3" />
                Lucky Wheel
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
            title={showCopied ? "Link copied!" : "Share poll"}
          >
            {showCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </button>
          {poll.has_lucky_wheel && (
            <button
              onClick={() => onLuckyWheel(poll)}
              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
              title="Spin lucky wheel"
            >
              <Zap className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(poll)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
            title="Edit poll"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(poll.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Delete poll"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Options */}
      {showWinnerOnly ? (
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
            const userVotedForThis = userVotes.some(v => v.option_index === index);
            const canVoteForThis = canVote && !poll.has_lucky_wheel;
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
                <Zap className="h-4 w-4" />
                <span>Lucky Wheel enabled - Use the wheel to pick a winner!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
        <span>Created by @{poll.created_by_username || 'unknown'}</span>
        {hasVoted && !showWinnerOnly && (
          <span className="text-green-400">
            You voted {userVotes.length}/{poll.votes_per_user} times
          </span>
        )}
        {showWinnerOnly && (
          <span className="text-yellow-400 flex items-center gap-1">
            <Crown className="h-3 w-3" />
            {poll.has_lucky_wheel ? 'Lucky Wheel Winner' : 'Winner Selected'}
          </span>
        )}
      </div>
    </div>
  );
}