// client/src/components/Game/ScoreBoard.jsx

import React from 'react';

const ScoreBoard = ({ redNectar, blueNectar, timeLeft, isPaused, onTogglePause }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-gray-700">
      <div className="flex items-center justify-between">
        {/* 左側: あなた */}
        <div className="flex-1 text-center">
          <div className="text-red-400 font-bold text-sm mb-1">あなた</div>
          <div className="text-4xl font-bold text-red-500">
            {redNectar}
            <span className="text-sm text-gray-400"> / 100</span>
          </div>
        </div>

        {/* 中央: タイマー + ポーズボタン */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl font-mono text-white bg-gray-900 px-4 py-2 rounded">
              ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            
            {/* ポーズボタン */}
            <button
              onClick={onTogglePause}
              className={`px-4 py-2 rounded font-bold text-2xl transition-colors ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
              title={isPaused ? '再開 (ESC/スペース)' : '一時停止 (ESC/スペース)'}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">🏆 VS 🏆</div>
          </div>
        </div>

        {/* 右側: 敵チーム */}
        <div className="flex-1 text-center">
          <div className="text-blue-400 font-bold text-sm mb-1">敵チーム</div>
          <div className="text-4xl font-bold text-blue-500">
            {blueNectar}
            <span className="text-sm text-gray-400"> / 100</span>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mt-4 flex gap-2">
        {/* 赤チーム */}
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
              style={{ width: `${Math.min(100, redNectar)}%` }}
            />
          </div>
        </div>
        
        {/* 青チーム */}
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(100, blueNectar)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;