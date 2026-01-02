// client/src/components/Game/PlayerStats.jsx

import React from 'react';
import { Coins, Zap, Package, Sparkles, Trash2, Clover } from 'lucide-react';
import { calculateTotalCost, DIFFICULTY_MODES } from '../../utils/constants';

const PlayerStats = ({ 
  sg, 
  costExpansions, 
  difficulty,
  luck,
  onDifficultyChange,
  onOpenShop, 
  onOpenDeck,
  onOpenGacha,
  onOpenSell,
  onOpenLuck,
  gameStarted
}) => {
  const totalCost = calculateTotalCost(costExpansions);
  
  return (
    <div className="mb-4 bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        {/* SG表示 */}
        <div className="flex items-center gap-2 text-yellow-400">
          <Coins className="w-5 h-5" />
          <span className="text-lg font-bold">{sg.toLocaleString()} SG</span>
        </div>
        
        {/* 運表示 */}
        <div className="flex items-center gap-2 text-green-400">
          <Clover className="w-5 h-5" />
          <span className="text-sm">運 Lv.{luck?.level || 1}</span>
        </div>
        
        {/* デッキコスト */}
        <div className="flex items-center gap-2 text-blue-400">
          <Zap className="w-5 h-5" />
          <span className="text-sm">総コスト: {totalCost}</span>
        </div>
      </div>
      
      {/* 難易度選択と操作ボタン */}
      <div className="flex items-center gap-3">
        {/* 難易度選択 */}
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">難易度</label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(Number(e.target.value))}
            disabled={gameStarted}
            className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {DIFFICULTY_MODES.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name} - 報酬: {mode.reward.win}/{mode.reward.draw}/{mode.reward.lose} SG
              </option>
            ))}
          </select>
        </div>
        
        {/* 操作ボタン */}
        <div className="flex gap-2">
          <button
            onClick={onOpenGacha}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            ガチャ
          </button>
          <button
            onClick={onOpenLuck}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
          >
            <Clover className="w-4 h-4" />
            運
          </button>
          <button
            onClick={onOpenShop}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
          >
            <Package className="w-4 h-4" />
            強化
          </button>
          <button
            onClick={onOpenDeck}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-sm"
          >
            デッキ
          </button>
          <button
            onClick={onOpenSell}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            売却
          </button>
        </div>
      </div>
      
      {/* 難易度説明 */}
      {!gameStarted && (
        <div className="mt-2 text-xs text-gray-400">
          {DIFFICULTY_MODES.find(m => m.id === difficulty)?.description || ''}
          {difficulty > 1 && ` (CPU +${((difficulty - 1) * 15).toFixed(0)}%)`}
        </div>
      )}
    </div>
  );
};

export default PlayerStats;