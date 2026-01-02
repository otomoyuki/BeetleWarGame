// client/src/components/Game/GameCanvas.jsx

import React from 'react';
import { GAME_CONFIG } from '../../utils/constants';

const GameCanvas = ({ canvasRef, onClick, selectedBeetle, winner }) => {
  return (
    <div>
      {/* 勝者表示 */}
      {winner && (
        <div className="mb-4 p-4 bg-yellow-500 text-black rounded text-center text-2xl font-bold">
          {winner === 'draw' ? '🤝 引き分け！ 🤝' : `🎉 ${winner === 'red' ? 'あなたの勝利！' : '敵チームの勝利...'} 🎉`}
        </div>
      )}

      {/* 操作説明 */}
      {!winner && (
        <div className="mb-4 p-3 bg-blue-900 text-blue-200 rounded text-sm text-center">
          {selectedBeetle 
            ? '📍 クリックで移動：左右の樹液エリアで採取・ゴールで得点・その他の場所で待機' 
            : '🪲 あなたの甲虫をクリックして選択→次にクリックした場所に移動'}
        </div>
      )}

      {/* ゲームキャンバス */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="w-full border-4 border-amber-600 rounded bg-gray-900 cursor-pointer"
        onClick={onClick}
      />
    </div>
  );
};

export default GameCanvas;