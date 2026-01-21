// client/src/components/Game/PlayerStats.jsx

import React from 'react';
import { DIFFICULTY_MODES, calculateTotalCost, GAME_SPEED_OPTIONS } from '../../utils/constants';

const PlayerStats = ({ 
  sg, 
  costExpansions, 
  difficulty, 
  luck,
  gameSpeed,
  onDifficultyChange, 
  onGameSpeedChange,
  onOpenShop, 
  onOpenDeck, 
  onOpenGacha,
  onOpenSell,
  onOpenLuck,
  gameStarted 
}) => {
  const totalCost = calculateTotalCost(costExpansions || 0);
  const currentMode = DIFFICULTY_MODES.find(m => m.id === difficulty) || DIFFICULTY_MODES[0];
  const currentSpeedOption = GAME_SPEED_OPTIONS.find(s => s.speed === gameSpeed) || GAME_SPEED_OPTIONS[0];

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-gray-700">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 左側: SG表示と難易度 */}
        <div>
          <div className="text-amber-400 text-2xl font-bold mb-2">
            💰 SG: {sg.toLocaleString()}
          </div>
          <div className="text-blue-400 text-sm mb-2">
            📦 デッキコスト上限: {totalCost}
          </div>
          <div className="text-purple-400 text-sm mb-2">
            🍀 運レベル: Lv.{luck?.level || 1}
          </div>
          
          {/* 難易度選択 */}
          <div className="mt-3">
            <label className="text-white text-sm font-bold block mb-1">
              ⚔️ 難易度:
            </label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(Number(e.target.value))}
              disabled={gameStarted}
              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 disabled:opacity-50 text-sm"
            >
              {DIFFICULTY_MODES.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.name} (勝利: {mode.reward.win} SG)
                </option>
              ))}
            </select>
          </div>

          {/* ゲームスピード選択 */}
          <div className="mt-3">
            <label className="text-white text-sm font-bold block mb-1">
              ⚡ ゲームスピード:
            </label>
            <select
              value={gameSpeed}
              onChange={(e) => onGameSpeedChange(Number(e.target.value))}
              disabled={gameStarted}
              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 disabled:opacity-50 text-sm"
            >
              {GAME_SPEED_OPTIONS.map(option => (
                <option key={option.speed} value={option.speed}>
                  {option.label} {option.cost > 0 ? `(${option.cost} SG)` : '(無料)'}
                </option>
              ))}
            </select>
            {!gameStarted && currentSpeedOption.cost > 0 && (
              <div className="text-yellow-300 text-xs mt-1">
                ※ ゲーム開始時に {currentSpeedOption.cost} SG 消費
              </div>
            )}
          </div>
        </div>

        {/* 右側: ボタン群 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenShop}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-sm"
          >
            🔧 強化
          </button>
          <button
            onClick={onOpenDeck}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-sm"
          >
            📋 デッキ
          </button>
          <button
            onClick={onOpenGacha}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-sm"
          >
            🎰 ガチャ
          </button>
          <button
            onClick={onOpenSell}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-sm"
          >
            💸 売却
          </button>
          <button
            onClick={onOpenLuck}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded text-sm col-span-2"
          >
            🍀 運システム
          </button>
        </div>
      </div>

      {/* 難易度説明 */}
      <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
        <span className="font-bold text-white">{currentMode.name}:</span> {currentMode.description} 
        {' | '}
        経験値 {currentMode.lupMultiplier}倍
        {gameSpeed > 1.0 && (
          <span className="text-yellow-300">
            {' | '}
            ⚡ {gameSpeed}倍速モード
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;