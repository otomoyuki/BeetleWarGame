// client/src/components/Game/LuckSystem.jsx

import React, { useState } from 'react';
import { X, TrendingUp, Sparkles } from 'lucide-react';
import { LUCK_CONFIG, calculateLuckLevelCost, calculateTotalLuckCost } from '../../utils/constants';
import { calculateLuckMultiplier } from '../../utils/playerData';

const LuckSystem = ({ playerData, onClose, onLevelUp, onDistribute }) => {
  const { level, gachaPoints, expPoints } = playerData.luck;
  const [tempGachaPoints, setTempGachaPoints] = useState(gachaPoints);
  const [tempExpPoints, setTempExpPoints] = useState(expPoints);

  const levelUpCost = calculateLuckLevelCost(level);
  const canLevelUp = levelUpCost && playerData.sg >= levelUpCost;
  const isMaxLevel = level >= LUCK_CONFIG.MAX_LEVEL;

  // 現在の倍率計算
  const currentMultiplier = calculateLuckMultiplier({ level, gachaPoints, expPoints });
  const tempMultiplier = calculateLuckMultiplier({ level, gachaPoints: tempGachaPoints, expPoints: tempExpPoints });

  // スライダー変更
  const handleGachaChange = (value) => {
    const newGacha = parseInt(value);
    setTempGachaPoints(newGacha);
    setTempExpPoints(100 - newGacha);
  };

  // ポイント配分保存
  const handleSaveDistribution = () => {
    onDistribute(tempGachaPoints, tempExpPoints);
    alert('ポイント配分を保存しました！');
  };

  // レベルアップ
  const handleLevelUp = () => {
    if (canLevelUp) {
      onLevelUp(levelUpCost);
    }
  };

  // 配分が変更されているか
  const hasChanges = tempGachaPoints !== gachaPoints || tempExpPoints !== expPoints;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            運システム
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded transition">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* SG表示 */}
        <div className="mb-6 p-4 bg-gray-700 rounded text-center">
          <div className="text-gray-400 text-sm mb-1">所持SG</div>
          <div className="text-3xl font-bold text-yellow-400">
            {playerData.sg.toLocaleString()} SG
          </div>
        </div>

        {/* 現在の運レベル */}
        <div className="mb-6 p-6 bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-yellow-400 text-sm mb-1">現在の運レベル</div>
            <div className="text-5xl font-bold text-white mb-2">Lv.{level}</div>
            <div className="text-2xl font-bold text-yellow-300">
              基礎倍率 {LUCK_CONFIG.BASE_MULTIPLIERS[level - 1].toFixed(1)}x
            </div>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all"
              style={{ width: `${(level / LUCK_CONFIG.MAX_LEVEL) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-300">
            {level} / {LUCK_CONFIG.MAX_LEVEL}
          </div>

          {/* レベルアップボタン */}
          {!isMaxLevel && (
            <button
              onClick={handleLevelUp}
              disabled={!canLevelUp}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
                canLevelUp
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <TrendingUp size={20} />
              レベルアップ ({levelUpCost?.toLocaleString()} SG)
            </button>
          )}
          
          {isMaxLevel && (
            <div className="mt-4 text-center text-yellow-300 font-bold">
              🎉 最大レベル到達！ 🎉
            </div>
          )}

          {/* 累計コスト表示 */}
          <div className="mt-3 text-center text-xs text-gray-400">
            累計コスト: {calculateTotalLuckCost(level).toLocaleString()} SG
          </div>
        </div>

        {/* ポイント配分 */}
        <div className="mb-6 p-6 bg-gray-700 rounded-lg">
          <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">
            🎯 運ポイント配分
          </h3>

          <div className="mb-4 text-sm text-gray-300 text-center">
            基礎倍率をガチャ確率と経験値獲得に自由に配分できます
          </div>

          {/* スライダー */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-purple-400 font-bold">ガチャ確率</span>
              <span className="text-blue-400 font-bold">経験値獲得</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={tempGachaPoints}
              onChange={(e) => handleGachaChange(e.target.value)}
              className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${tempGachaPoints}%, #3b82f6 ${tempGachaPoints}%, #3b82f6 100%)`
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-purple-300">{tempGachaPoints}%</span>
              <span className="text-blue-300">{tempExpPoints}%</span>
            </div>
          </div>

          {/* 現在の効果 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-purple-900 rounded text-center">
              <div className="text-purple-300 text-sm mb-1">ガチャ確率</div>
              <div className="text-2xl font-bold text-white">
                {tempMultiplier.gachaMultiplier.toFixed(2)}x
              </div>
              {tempGachaPoints !== gachaPoints && (
                <div className="text-xs text-yellow-300 mt-1">
                  (現在: {currentMultiplier.gachaMultiplier.toFixed(2)}x)
                </div>
              )}
            </div>
            <div className="p-3 bg-blue-900 rounded text-center">
              <div className="text-blue-300 text-sm mb-1">経験値獲得</div>
              <div className="text-2xl font-bold text-white">
                {tempMultiplier.expMultiplier.toFixed(2)}x
              </div>
              {tempExpPoints !== expPoints && (
                <div className="text-xs text-yellow-300 mt-1">
                  (現在: {currentMultiplier.expMultiplier.toFixed(2)}x)
                </div>
              )}
            </div>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSaveDistribution}
            disabled={!hasChanges}
            className={`w-full px-6 py-3 rounded-lg font-bold transition ${
              hasChanges
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasChanges ? '配分を保存' : '配分済み'}
          </button>
        </div>

        {/* 確率変化の例 */}
        <div className="p-4 bg-blue-900 rounded-lg">
          <h4 className="text-sm font-bold text-blue-300 mb-2">💡 効果の例</h4>
          <div className="text-xs text-blue-200 space-y-1">
            <div>• ガチャ確率100%配分: 高レアが出やすくなる</div>
            <div>• 経験値100%配分: キャラが早く成長する</div>
            <div>• 50%ずつ配分: バランス型（推奨）</div>
            <div>• いつでも無料で配分変更可能</div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default LuckSystem;