// client/src/components/Game/LuckSystem.jsx
// Pattern C: ハイブリッド方式（初回無料 + 24時間猶予 + 累積コスト + 時間割引）

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { LUCK_CONFIG, calculateLuckLevelCost, calculateTotalLuckCost } from '../../utils/constants';
import { calculateLuckMultiplier } from '../../utils/playerData';

const LuckSystem = ({ playerData, onClose, onLevelUp, onDistribute }) => {
  const { level, gachaPoints, expPoints } = playerData.luck;
  const [tempGachaPoints, setTempGachaPoints] = useState(gachaPoints);
  const [tempExpPoints, setTempExpPoints] = useState(expPoints);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const levelUpCost = calculateLuckLevelCost(level);
  const canLevelUp = levelUpCost && playerData.sg >= levelUpCost;
  const isMaxLevel = level >= LUCK_CONFIG.MAX_LEVEL;

  // 運配分の履歴データ（playerDataから取得、なければ初期化）
  const reallocationCount = playerData.luck.reallocationCount || 0;
  const firstAllocationTime = playerData.luck.firstAllocationTime || null;
  const lastChangeTime = playerData.luck.lastChangeTime || null;

  // 現在の倍率計算
  const currentMultiplier = calculateLuckMultiplier({ level, gachaPoints, expPoints });
  const tempMultiplier = calculateLuckMultiplier({ level, gachaPoints: tempGachaPoints, expPoints: tempExpPoints });

  // コスト計算関数
  const calculateReallocationCost = () => {
    // 初回無料
    if (reallocationCount === 0) {
      return {
        cost: 0,
        reason: '初回無料',
        isGracePeriod: false
      };
    }

    // 24時間猶予期間内は無料
    if (firstAllocationTime) {
      const elapsed = Date.now() - firstAllocationTime;
      const gracePeriod = 24 * 60 * 60 * 1000; // 24時間
      
      if (elapsed < gracePeriod) {
        const remainingHours = Math.floor((gracePeriod - elapsed) / (60 * 60 * 1000));
        return {
          cost: 0,
          reason: `猶予期間中（あと${remainingHours}時間）`,
          isGracePeriod: true,
          remainingHours
        };
      }
    }

    // 基本コスト（回数による）
    const baseCosts = [0, 200, 500, 1000, 2000, 5000];
    const baseCost = baseCosts[Math.min(reallocationCount, baseCosts.length - 1)];

    // 時間による割引
    if (!lastChangeTime) {
      return {
        cost: baseCost,
        reason: '通常料金',
        baseCost,
        discount: 0
      };
    }

    const hoursSinceLastChange = (Date.now() - lastChangeTime) / (60 * 60 * 1000);
    let discount = 1.0;
    let discountLabel = '';

    if (hoursSinceLastChange >= 168) {      // 1週間
      discount = 0.3; // 70% OFF
      discountLabel = '70% OFF';
    } else if (hoursSinceLastChange >= 72) {  // 3日
      discount = 0.5; // 50% OFF
      discountLabel = '50% OFF';
    } else if (hoursSinceLastChange >= 24) {  // 1日
      discount = 0.7; // 30% OFF
      discountLabel = '30% OFF';
    }

    const finalCost = Math.floor(baseCost * discount);

    return {
      cost: finalCost,
      baseCost,
      discount: (1 - discount) * 100,
      discountLabel,
      reason: discountLabel ? `${discountLabel}適用` : '通常料金'
    };
  };

  // 次の割引までの時間を計算
  const getNextDiscount = () => {
    if (!lastChangeTime) return null;

    const hoursSinceLastChange = (Date.now() - lastChangeTime) / (60 * 60 * 1000);

    if (hoursSinceLastChange < 24) {
      return {
        hours: Math.ceil(24 - hoursSinceLastChange),
        discount: '30% OFF'
      };
    } else if (hoursSinceLastChange < 72) {
      return {
        hours: Math.ceil(72 - hoursSinceLastChange),
        discount: '50% OFF'
      };
    } else if (hoursSinceLastChange < 168) {
      return {
        hours: Math.ceil(168 - hoursSinceLastChange),
        discount: '70% OFF'
      };
    }

    return null;
  };

  const costInfo = calculateReallocationCost();
  const nextDiscount = getNextDiscount();
  const canAffordReallocation = playerData.sg >= costInfo.cost;

  // スライダー変更
  const handleGachaChange = (value) => {
    const newGacha = parseInt(value);
    setTempGachaPoints(newGacha);
    setTempExpPoints(100 - newGacha);
  };

  // 配分が変更されているか
  const hasChanges = tempGachaPoints !== gachaPoints || tempExpPoints !== expPoints;

  // 保存ボタンクリック
  const handleSaveClick = () => {
    if (!hasChanges) return;

    // コストが0円の場合は確認なしで実行
    if (costInfo.cost === 0) {
      executeReallocation();
      return;
    }

    // コストがかかる場合は確認ダイアログ表示
    setShowConfirmDialog(true);
  };

  // 実際の配分変更実行
  const executeReallocation = () => {
    const now = Date.now();

    // 配分変更データを準備
    const reallocationData = {
      gachaPoints: tempGachaPoints,
      expPoints: tempExpPoints,
      reallocationCount: reallocationCount + 1,
      firstAllocationTime: firstAllocationTime || now,
      lastChangeTime: now,
      costPaid: costInfo.cost
    };

    // 親コンポーネントに通知
    onDistribute(reallocationData);

    // ダイアログを閉じる
    setShowConfirmDialog(false);

    // 成功メッセージ
    if (costInfo.cost === 0) {
      if (costInfo.isGracePeriod) {
        alert(`✅ 配分を変更しました！（猶予期間中・無料）\nあと${costInfo.remainingHours}時間以内なら無料で変更できます`);
      } else {
        alert('✅ 初回配分完了！\n24時間以内なら無料で変更できます');
      }
    } else {
      alert(`✅ 配分を変更しました！\n-${costInfo.cost.toLocaleString()} SG`);
    }
  };

  // レベルアップ
  const handleLevelUp = () => {
    if (canLevelUp) {
      onLevelUp(levelUpCost);
    }
  };

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

          {/* 配分変更コスト表示 */}
          {reallocationCount > 0 && (
            <div className="mb-4 p-3 bg-blue-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={20} className="text-blue-300" />
                <span className="text-blue-300 font-bold">配分変更コスト</span>
              </div>
              
              {costInfo.cost === 0 ? (
                <div className="text-green-300 font-bold">
                  ✨ {costInfo.reason}
                  {costInfo.isGracePeriod && (
                    <div className="text-sm text-green-200 mt-1">
                      あと{costInfo.remainingHours}時間以内なら無料で変更可能
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-yellow-300 font-bold text-lg">
                    {costInfo.cost.toLocaleString()} SG
                  </div>
                  {costInfo.discount > 0 && (
                    <div className="text-sm text-green-300 mt-1">
                      {costInfo.discountLabel}（通常: {costInfo.baseCost.toLocaleString()} SG）
                    </div>
                  )}
                  {nextDiscount && (
                    <div className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                      <Clock size={14} />
                      {nextDiscount.hours}時間待つと{nextDiscount.discount}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-2">
                配分変更回数: {reallocationCount}回
              </div>
            </div>
          )}

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
            onClick={handleSaveClick}
            disabled={!hasChanges || (costInfo.cost > 0 && !canAffordReallocation)}
            className={`w-full px-6 py-3 rounded-lg font-bold transition ${
              !hasChanges
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : costInfo.cost > 0 && !canAffordReallocation
                ? 'bg-red-900 text-red-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {!hasChanges 
              ? '配分済み' 
              : costInfo.cost === 0
              ? '配分を保存（無料）'
              : canAffordReallocation
              ? `配分を保存（${costInfo.cost.toLocaleString()} SG）`
              : `SGが足りません（${costInfo.cost.toLocaleString()} SG 必要）`
            }
          </button>
        </div>

        {/* 確率変化の例 */}
        <div className="p-4 bg-blue-900 rounded-lg">
          <h4 className="text-sm font-bold text-blue-300 mb-2">💡 効果の例</h4>
          <div className="text-xs text-blue-200 space-y-1">
            <div>• ガチャ確率100%配分: 高レアが出やすくなる</div>
            <div>• 経験値100%配分: キャラが早く成長する</div>
            <div>• 50%ずつ配分: バランス型（推奨）</div>
            {reallocationCount === 0 ? (
              <div className="text-green-300 font-bold mt-2">
                • 初回は無料！24時間以内なら何度でも変更OK
              </div>
            ) : (
              <div className="text-yellow-300 font-bold mt-2">
                • 地獄の沙汰も金次第 - SGで配分変更可能
              </div>
            )}
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

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 m-4">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
              配分変更の確認
            </h3>
            
            <div className="mb-4 p-4 bg-gray-700 rounded">
              <div className="text-center mb-2">
                <div className="text-gray-400 text-sm">変更内容</div>
                <div className="flex justify-between mt-2">
                  <span className="text-purple-300">
                    ガチャ: {gachaPoints}% → {tempGachaPoints}%
                  </span>
                  <span className="text-blue-300">
                    経験値: {expPoints}% → {tempExpPoints}%
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-red-400 text-2xl font-bold">
                  {costInfo.cost.toLocaleString()} SG
                </div>
                {costInfo.discount > 0 && (
                  <div className="text-sm text-green-300 mt-1">
                    {costInfo.discountLabel}適用済み
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4 p-3 bg-yellow-900 rounded">
              <div className="text-yellow-300 text-sm text-center">
                ⚠️ この変更を実行しますか？<br/>
                SGは返金されません
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
              >
                キャンセル
              </button>
              <button
                onClick={executeReallocation}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
              >
                実行する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckSystem;