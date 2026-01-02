// client/src/components/Game/ScoreBoard.jsx

import React from 'react';
import { Trophy, Clock } from 'lucide-react';

const ScoreBoard = ({ redNectar, blueNectar, timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4 bg-gray-700 rounded-lg p-4">
      {/* タイマー */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-400" />
        <div className="text-2xl font-bold text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* スコア */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* 赤チーム（あなた） */}
        <div className="text-center">
          <div className="text-red-400 font-bold mb-1">あなた</div>
          <div className="text-4xl font-bold text-white">
            {Math.floor(redNectar)}
          </div>
          <div className="text-sm text-gray-400">/ 100</div>
        </div>

        {/* VS */}
        <div className="text-center">
          <Trophy className="w-8 h-8 mx-auto text-amber-400" />
          <div className="text-sm text-gray-400 mt-1">VS</div>
        </div>

        {/* 青チーム（敵） */}
        <div className="text-center">
          <div className="text-blue-400 font-bold mb-1">敵チーム</div>
          <div className="text-4xl font-bold text-white">
            {Math.floor(blueNectar)}
          </div>
          <div className="text-sm text-gray-400">/ 100</div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className="bg-red-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (redNectar / 100) * 100)}%` }}
          />
        </div>
        <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (blueNectar / 100) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;