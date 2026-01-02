// client/src/components/Game/UpgradeShop.jsx

import React, { useState } from 'react';
import { X, ArrowUp, Trophy } from 'lucide-react';
import { beetleTypes, RARITY_COLORS } from '../../utils/beetleData';
import { UPGRADE_COSTS, calculateLevelUpCost, calculateStatCap } from '../../utils/constants';

const UpgradeShop = ({ playerData, onClose, onUpgrade, onLevelUp }) => {
  const [selectedBeetle, setSelectedBeetle] = useState(null);

  const handleUpgradeStat = (beetleId, stat) => {
    onUpgrade(beetleId, stat);
  };

  const handleLevelUp = (beetleId) => {
    onLevelUp(beetleId);
  };

  // beetleUpgradesが存在しない場合の安全処理
  const beetles = playerData.beetleUpgrades || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400">🛒 強化ショップ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* 所持SG・LUP表示 */}
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm">所持金</div>
              <div className="text-3xl font-bold text-yellow-400">
                💰 {playerData.sg.toLocaleString()} SG
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm">レベルアップポイント</div>
              <div className="text-3xl font-bold text-purple-400">
                ⭐ {(playerData.lup || 0).toLocaleString()} LUP
              </div>
            </div>
          </div>
        </div>

        {/* キャラがいない場合 */}
        {Object.keys(beetles).length === 0 && (
          <div className="p-8 bg-gray-700 rounded text-center text-gray-400">
            <div className="text-4xl mb-3">🎰</div>
            <div className="text-lg mb-2">キャラクターを所有していません</div>
            <div className="text-sm">ガチャを引いてキャラクターを獲得しましょう！</div>
          </div>
        )}

        {/* 甲虫一覧 */}
        <div className="space-y-4">
          {Object.entries(beetles).map(([id, beetle]) => {
            const [team, type, index] = id.split('_');
            if (team !== 'red') return null;
            
            const baseData = beetleTypes[type];
            if (!baseData) return null;
            
            const levelUpCost = calculateLevelUpCost(beetle.level);
            const canLevelUp = (playerData.lup || 0) >= levelUpCost;

            // 各ステータスの基礎値を取得
            const hpBase = baseData.hp;
            const atkBase = baseData.atk;
            const defBase = baseData.def;
            const carryBase = baseData.carry;
            const speedBase = baseData.speed;

            // 現在値を計算（強化を反映）
            const upgrades = beetle.upgrades || { hp: 0, atk: 0, def: 0, carry: 0, speed: 0 };
            const hpCurrent = hpBase * (1 + upgrades.hp * 0.1);
            const atkCurrent = atkBase * (1 + upgrades.atk * 0.1);
            const defCurrent = defBase * (1 + upgrades.def * 0.1);
            const carryCurrent = carryBase * (1 + upgrades.carry * 0.1);
            const speedCurrent = speedBase * (1 + upgrades.speed * 0.1);

            const rarityColor = RARITY_COLORS[baseData.rarity] || '#9CA3AF';

            return (
              <div key={id} className="bg-gray-700 rounded-lg p-4">
                {/* 甲虫情報ヘッダー */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    {/* アイコン */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative"
                      style={{ backgroundColor: baseData.color }}
                    >
                      🪲
                      <div
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: rarityColor }}
                      >
                        {baseData.rarity}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-amber-400">
                        {baseData.name} #{parseInt(index) + 1}
                      </h3>
                      <div className="text-sm text-gray-400">
                        レベル {beetle.level} | コスト: {baseData.cost}
                      </div>
                    </div>
                  </div>
                  
                  {/* レベルアップボタン */}
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">
                      ⭐ {playerData.lup || 0} / {levelUpCost} LUP
                    </div>
                    <button
                      onClick={() => handleLevelUp(id)}
                      disabled={!canLevelUp}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition ${
                        canLevelUp
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Trophy size={16} />
                      レベルアップ
                    </button>
                  </div>
                </div>

                {/* ステータス一覧 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* HP */}
                  <StatUpgrade
                    label="HP"
                    base={hpBase}
                    current={hpCurrent}
                    max={calculateStatCap(hpBase, beetle.level)}
                    cost={UPGRADE_COSTS.HP}
                    sg={playerData.sg}
                    onUpgrade={() => handleUpgradeStat(id, 'hp')}
                  />
                  
                  {/* 攻撃 */}
                  <StatUpgrade
                    label="攻撃"
                    base={atkBase}
                    current={atkCurrent}
                    max={calculateStatCap(atkBase, beetle.level)}
                    cost={UPGRADE_COSTS.ATK}
                    sg={playerData.sg}
                    onUpgrade={() => handleUpgradeStat(id, 'atk')}
                  />
                  
                  {/* 防御 */}
                  <StatUpgrade
                    label="防御"
                    base={defBase}
                    current={defCurrent}
                    max={calculateStatCap(defBase, beetle.level)}
                    cost={UPGRADE_COSTS.DEF}
                    sg={playerData.sg}
                    onUpgrade={() => handleUpgradeStat(id, 'def')}
                  />
                  
                  {/* 運搬 */}
                  <StatUpgrade
                    label="運搬"
                    base={carryBase}
                    current={carryCurrent}
                    max={calculateStatCap(carryBase, beetle.level)}
                    cost={UPGRADE_COSTS.CARRY}
                    sg={playerData.sg}
                    onUpgrade={() => handleUpgradeStat(id, 'carry')}
                    isInteger
                  />
                  
                  {/* 速度 */}
                  <StatUpgrade
                    label="速度"
                    base={speedBase}
                    current={speedCurrent}
                    max={calculateStatCap(speedBase, beetle.level)}
                    cost={UPGRADE_COSTS.SPEED}
                    sg={playerData.sg}
                    onUpgrade={() => handleUpgradeStat(id, 'speed')}
                    increment={0.01}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ステータス強化UI
const StatUpgrade = ({ label, base, current, max, cost, sg, onUpgrade, isInteger, increment = 1 }) => {
  const canUpgrade = sg >= cost && current < max;
  const displayCurrent = isInteger ? Math.floor(current) : current.toFixed(2);
  const displayMax = isInteger ? Math.floor(max) : max.toFixed(2);

  return (
    <div className="bg-gray-600 p-3 rounded">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white">{label}</span>
        <span className="text-sm text-gray-300">
          {displayCurrent} / {displayMax}
        </span>
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
        />
      </div>
      
      <button
        onClick={onUpgrade}
        disabled={!canUpgrade}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-bold text-sm transition ${
          canUpgrade
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <ArrowUp size={14} />
        +{increment} ({cost} SG)
      </button>
    </div>
  );
};

export default UpgradeShop;