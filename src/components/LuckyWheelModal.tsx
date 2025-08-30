import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, RotateCcw, Crown } from 'lucide-react';
import { localApi } from '../lib/localApi';
import type { Poll, LuckyWheelResult } from '../types/poll';

interface LuckyWheelModalProps {
  poll: Poll;
  onClose: () => void;
}

export function LuckyWheelModal({ poll, onClose }: LuckyWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<LuckyWheelResult | null>(null);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [pollEnded, setPollEnded] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    setHasSpun(true);
    
    // Random spin between 5-10 full rotations plus random angle
    const spins = 5 + Math.random() * 5;
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    
    setRotation(totalRotation);
    
    // Calculate winning option
    const segmentAngle = 360 / poll.options.length;
    const normalizedAngle = (360 - (totalRotation % 360)) % 360;
    const winningIndex = Math.floor(normalizedAngle / segmentAngle);
    
    // Immediately end the poll when wheel is spun
    const endPollImmediately = async () => {
      try {
        await localApi.updatePoll(poll.id, {
          expires_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error ending poll:', error);
      }
    };
    
    // End poll immediately (after 100ms to allow wheel animation to start)
    setTimeout(() => {
      endPollImmediately();
      setPollEnded(true);
    }, 100);
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult({
        winningOption: poll.options[winningIndex].text,
        winningIndex
      });
      
      // Also update the poll options to mark the winner
      const updatedOptions = [...poll.options];
      updatedOptions[winningIndex].votes = Math.max(1, updatedOptions[winningIndex].votes);
      
      // Update the poll in the database to mark the winner
      localApi.updatePoll(poll.id, {
        options: updatedOptions
      }).then(() => {
        console.log('Lucky wheel winner marked in database');
      }).catch((error) => {
        console.error('Error marking lucky wheel winner:', error);
      });
    }, 3000);
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setHasSpun(false);
    setPollEnded(false);
  };

  const segmentAngle = 360 / poll.options.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 gold-gradient rounded-lg">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Lucky Wheel</h2>
              <p className="text-sm text-gray-400">{poll.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* Wheel Container */}
          <div className="relative mx-auto mb-8" style={{ width: '300px', height: '300px' }}>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
            </div>
            
            {/* Wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full border-4 border-yellow-400 relative overflow-hidden shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 300 300" className="absolute inset-0">
                {poll.options.map((option, index) => {
                  const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                  const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                  const midAngle = (startAngle + endAngle) / 2;
                  const color = colors[index % colors.length];
                  
                  const x1 = 150 + 140 * Math.cos(startAngle);
                  const y1 = 150 + 140 * Math.sin(startAngle);
                  const x2 = 150 + 140 * Math.cos(endAngle);
                  const y2 = 150 + 140 * Math.sin(endAngle);
                  
                  const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                  
                  const textX = 150 + 80 * Math.cos(midAngle);
                  const textY = 150 + 80 * Math.sin(midAngle);
                  const textRotation = (midAngle * 180 / Math.PI) + (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? 180 : 0);
                  
                  return (
                    <g key={index}>
                      <path
                        d={`M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRotation} ${textX} ${textY})`}
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {option.text.length > 12 ? option.text.substring(0, 10) + '...' : option.text}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mb-6 p-6 glass-effect rounded-xl border border-yellow-500/50 bg-yellow-500/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-8 w-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-yellow-400">Winner!</h3>
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-xl text-gray-100 font-semibold">{result.winningOption}</p>
            </div>
          )}
          
          {/* Color Legend */}
          <div className="mb-6 p-4 glass-effect rounded-xl">
            <h4 className="text-sm font-medium text-gray-300 mb-3 text-center">Color Legend</h4>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {poll.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-600" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-gray-300 truncate" title={option.text}>
                    {option.text.length > 20 ? option.text.substring(0, 17) + '...' : option.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          {!result ? (
            <div className="flex gap-4 justify-center">
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="btn-gold px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover-lift transition-all duration-200"
              >
                <Zap className="h-5 w-5" />
                {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
              </button>
              
              {hasSpun && (
                <button
                  onClick={resetWheel}
                  disabled={isSpinning}
                  className="btn-dark px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover-lift transition-all duration-200"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetWheel}
                className="btn-gold px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover-lift transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5" />
                Spin Again
              </button>
              <button
                onClick={onClose}
                className="btn-dark px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover-lift transition-all duration-200"
              >
                <X className="h-5 w-5" />
                Close
              </button>
            </div>
          )}

          <p className="text-sm text-gray-400 mt-4 text-center">
            Click "Spin the Wheel" to randomly select one of the {poll.options.length} options!
          </p>
        </div>
      </div>
    </div>
  );
}