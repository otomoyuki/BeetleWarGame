// client/src/components/Game/GameCanvas.jsx

import React, { useEffect } from 'react';

const GameCanvas = ({ canvasRef, onClick, selectedBeetle, winner }) => {
  // Canvas が DOM に追加されたら即座に描画準備
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Canvas の背景を初期化（黒）
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      console.log('✅ Canvas 初期化完了:', canvas.width, 'x', canvas.height);
    }
  }, [canvasRef]);

  return (
    <div className="relative w-full h-full">
      {/* 勝者表示 */}
      {winner && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-yellow-500 text-black text-center text-2xl font-bold">
          {winner === 'draw' ? '🤝 引き分け！ 🤝' : `🎉 ${winner === 'red' ? 'あなたの勝利！' : '敵チームの勝利...'} 🎉`}
        </div>
      )}

      {/* 操作説明 */}
      {!winner && (
        <div className="absolute top-2 left-2 right-2 z-10 p-2 bg-blue-900 bg-opacity-90 text-blue-200 rounded text-sm text-center">
          {selectedBeetle 
            ? '📍 クリックで移動：左右の樹液エリアで採取・ゴールで得点・その他の場所で待機' 
            : '🪲 あなたの甲虫をクリックして選択→次にクリックした場所に移動'}
        </div>
      )}

      {/* ゲームキャンバス */}
      <canvas
        ref={canvasRef}
        width={900}
        height={700}
        className="w-full h-full border-4 border-amber-600 rounded bg-gray-900 cursor-pointer block"
        onClick={onClick}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default GameCanvas;