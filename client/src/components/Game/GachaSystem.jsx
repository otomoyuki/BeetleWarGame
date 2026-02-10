// client/src/components/Game/GachaSystem.jsx

import React, { useState } from 'react';
import { X, Sparkles, ShoppingCart, Settings } from 'lucide-react';
import { 
  beetleTypes,
  BEETLES_BY_TIER, 
  RARITY_COLORS,
  RARITY_NAMES,
  GACHA_RATES,
  PURCHASE_PRICES,
  performGacha,
  getBeetleName,
  getBeetleRarity,
  getBeetleTier
} from '../../utils/beetleData';
import { GACHA_CONFIG, DUPLICATE_MODES, DUPLICATE_MODE_LABELS } from '../../utils/constants';
import { calculateLuckMultiplier, getDuplicateMode } from '../../utils/playerData';

const GachaSystem = ({ playerData, onClose, onPull, onPurchase, onSetDuplicateMode }) => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState('gacha'); // 'gacha' | 'shop' | 'settings'

  const { gachaMultiplier } = calculateLuckMultiplier(playerData.luck);

  const checkPity = (pullCount) => {
    const newTotal = (playerData.gachaStats?.pullsSincePity || 0) + pullCount;
    if (newTotal >= GACHA_CONFIG.PITY_THRESHOLD) {
      const tier5Beetles = BEETLES_BY_TIER[5];
      const selected = tier5Beetles[Math.floor(Math.random() * tier5Beetles.length)];
      return {
        type: selected,
        tier: 5,
        isPity: true,
        isDuplicate: false // 🆕
      };
    }
    return null;
  };

  // 🆕 被り判定を追加
  const checkDuplicate = (type) => {
    return Object.values(playerData.beetleUpgrades || {}).some(
      beetle => beetle.type === type
    );
  };

  const handleSinglePull = () => {
    if (playerData.sg < GACHA_CONFIG.SINGLE_COST) {
      alert('SGが足りません！');
      return;
    }
    
    const pity = checkPity(1);
    let pulled;
    
    if (pity) {
      pity.isDuplicate = checkDuplicate(pity.type);
      pulled = [pity];
    } else {
      const gachaResults = performGacha(1, gachaMultiplier);
      pulled = gachaResults.map(type => ({ 
        type, 
        tier: getBeetleTier(type),
        isPity: false,
        isDuplicate: checkDuplicate(type) // 🆕
      }));
    }
    
    setResults(pulled);
    setShowResults(true);
    onPull(pulled, 1);
  };

  const handleMultiPull = () => {
    if (playerData.sg < GACHA_CONFIG.MULTI_COST) {
      alert('SGが足りません！');
      return;
    }
    
    const pity = checkPity(GACHA_CONFIG.MULTI_COUNT);
    let gachaResults = performGacha(GACHA_CONFIG.MULTI_COUNT, gachaMultiplier);
    let pulled = gachaResults.map(type => ({ 
      type, 
      tier: getBeetleTier(type),
      isPity: false,
      isDuplicate: checkDuplicate(type) // 🆕
    }));
    
    if (pity) {
      pity.isDuplicate = checkDuplicate(pity.type);
      pulled[pulled.length - 1] = pity;
    }
    
    setResults(pulled);
    setShowResults(true);
    onPull(pulled, GACHA_CONFIG.MULTI_COUNT);
  };

  const closeResults = () => {
    setShowResults(false);
    setResults([]);
  };

  const handlePurchase = (type, price) => {
    if (playerData.sg < price) {
      alert('SGが足りません！');
      return;
    }
    
    const beetleName = getBeetleName(type);
    if (window.confirm(`${beetleName}を${price.toLocaleString()} SGで購入しますか？`)) {
      onPurchase(type, price);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400">🎰 ガチャ＆ショップ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-700 rounded text-center">
          <div className="text-gray-400 text-sm mb-1">所持SG</div>
          <div className="text-3xl font-bold text-yellow-400">
            {playerData.sg.toLocaleString()} SG
          </div>
          <div className="text-gray-400 text-xs mt-2">
            天井まで: あと {GACHA_CONFIG.PITY_THRESHOLD - (playerData.gachaStats?.pullsSincePity || 0)} 回
          </div>
          {gachaMultiplier > 1.0 && (
            <div className="mt-2 text-green-400 font-bold flex items-center justify-center gap-1">
              <Sparkles size={16} />
              運補正: {gachaMultiplier.toFixed(2)}x
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('gacha')}
            className={`flex-1 py-3 rounded font-bold transition ${
              selectedTab === 'gacha'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <Sparkles className="inline mr-2" size={20} />
            ガチャ
          </button>
          <button
            onClick={() => setSelectedTab('shop')}
            className={`flex-1 py-3 rounded font-bold transition ${
              selectedTab === 'shop'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <ShoppingCart className="inline mr-2" size={20} />
            直接購入
          </button>
          <button
            onClick={() => setSelectedTab('settings')}
            className={`flex-1 py-3 rounded font-bold transition ${
              selectedTab === 'settings'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <Settings className="inline mr-2" size={20} />
            被り設定
          </button>
        </div>

        {selectedTab === 'gacha' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleSinglePull}
                disabled={playerData.sg < GACHA_CONFIG.SINGLE_COST}
                className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition"
              >
                <div className="text-2xl mb-2">✨ 単発</div>
                <div className="text-sm">{GACHA_CONFIG.SINGLE_COST} SG</div>
              </button>
              
              <button
                onClick={handleMultiPull}
                disabled={playerData.sg < GACHA_CONFIG.MULTI_COST}
                className="p-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition"
              >
                <div className="text-2xl mb-2">💫 11連</div>
                <div className="text-sm">{GACHA_CONFIG.MULTI_COST} SG</div>
              </button>
            </div>

            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-lg font-bold text-amber-400 mb-3">📊 排出率</h3>
              <div className="space-y-2 text-sm">
                {[6, 5, 4, 3, 2, 1].map(tier => {
                  const beetles = BEETLES_BY_TIER[tier] || [];
                  const baseRate = GACHA_RATES[tier] || 0;
                  const adjustedRate = baseRate * gachaMultiplier;
                  const rarityColor = RARITY_COLORS[tier];
                  
                  return (
                    <div key={tier} className="flex justify-between items-center">
                      <span style={{ color: rarityColor }}>
                        {RARITY_NAMES[tier]} ({beetles.length}体)
                      </span>
                      <div className="text-right">
                        <span className="text-gray-300">
                          {adjustedRate.toFixed(2)}%
                        </span>
                        {gachaMultiplier > 1.0 && (
                          <span className="text-green-400 text-xs ml-2">
                            (通常: {baseRate.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-xs text-gray-400 border-t border-gray-600 pt-3">
                ※ 天井: {GACHA_CONFIG.PITY_THRESHOLD}回で5段確定
                {gachaMultiplier > 1.0 && (
                  <div className="text-green-400 mt-1">
                    🍀 運補正が適用されています！
                  </div>
                )}
                {/* 🆕 限界突破の説明 */}
                <div className="text-amber-400 mt-2">
                  💎 被りキャラは限界突破素材になります！
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'shop' && (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-blue-900 text-blue-200 rounded text-sm">
              💡 ガチャよりも確実に欲しいキャラを入手できます<br/>
              ⚠️ 6段（幻）は別途入手方法でのみ入手可能です
            </div>
            
            {[5, 4, 3, 2].map(tier => {
              const beetles = BEETLES_BY_TIER[tier] || [];
              const price = PURCHASE_PRICES[tier];
              
              if (beetles.length === 0 || !price) return null;
              
              const rarityColor = RARITY_COLORS[tier];
              
              return (
                <div key={tier} className="bg-gray-700 rounded p-4">
                  <h3 className="text-lg font-bold mb-3" style={{ color: rarityColor }}>
                    {RARITY_NAMES[tier]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {beetles.map(type => {
                      const data = beetleTypes[type];
                      return (
                        <div key={type} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{data.name}</div>
                            <div className="text-xs text-gray-400">
                              HP:{data.hp} ATK:{data.atk} DEF:{data.def}
                            </div>
                          </div>
                          <button
                            onClick={() => handlePurchase(type, price)}
                            disabled={playerData.sg < price}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-bold transition"
                          >
                            {price.toLocaleString()} SG
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🆕 被り設定タブ */}
        {selectedTab === 'settings' && (
          <DuplicateSettings 
            playerData={playerData}
            onSetMode={onSetDuplicateMode}
          />
        )}
      </div>

      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-amber-400">
              🎉 ガチャ結果 🎉
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {results.map((result, index) => {
                const data = beetleTypes[result.type];
                const rarity = getBeetleRarity(result.type);
                const rarityColor = RARITY_COLORS[result.tier];
                
                return (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 text-center relative overflow-hidden"
                    style={{
                      borderColor: rarityColor,
                      borderWidth: '3px',
                      borderStyle: 'solid'
                    }}
                  >
                    {result.isPity && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold py-1">
                        天井達成！
                      </div>
                    )}
                    {/* 🆕 被り表示 */}
                    {result.isDuplicate && (
                      <div className="absolute top-6 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold py-1">
                        💎 限界突破素材+1
                      </div>
                    )}
                    <div className="text-4xl mb-2 mt-6">🪲</div>
                    <div className="font-bold text-white mb-1">{data.name}</div>
                    <div
                      className="text-xs font-bold mb-2"
                      style={{ color: rarityColor }}
                    >
                      {rarity}
                    </div>
                    <div className="text-xs text-gray-400">
                      HP:{data.hp} ATK:{data.atk}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={closeResults}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 🆕 被り設定コンポーネント
const DuplicateSettings = ({ playerData, onSetMode }) => {
  // 所持しているキャラのタイプ一覧を取得
  const ownedTypes = [...new Set(
    Object.values(playerData.beetleUpgrades || {}).map(beetle => beetle.type)
  )];

  const handleModeChange = (type, mode) => {
    onSetMode(type, mode);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-900 text-blue-200 rounded">
        <h3 className="font-bold mb-2">💡 被り設定について</h3>
        <div className="text-sm space-y-1">
          <div>• 🆕 新規追加: 新しいキャラとして追加（複数育成可能）</div>
          <div>• 💎 限界突破素材: 既存キャラの素材+1（強化用）</div>
          <div>• 💰 自動売却: 即座に100 SG獲得（完凸後におすすめ）</div>
        </div>
      </div>

      {ownedTypes.length === 0 && (
        <div className="p-8 bg-gray-700 rounded text-center text-gray-400">
          <div className="text-4xl mb-3">🎰</div>
          <div>キャラクターを所持していません</div>
          <div className="text-sm mt-2">ガチャを引いてキャラを獲得しましょう！</div>
        </div>
      )}

      {ownedTypes.map(type => {
        const data = beetleTypes[type];
        if (!data) return null;

        const currentMode = getDuplicateMode(playerData, type);
        const rarityColor = RARITY_COLORS[data.rarity];

        // このタイプの所持数と限界突破状況を取得
        const beetles = Object.values(playerData.beetleUpgrades || {}).filter(
          b => b.type === type
        );
        const totalOwned = beetles.length;
        const maxBreakthroughLevel = Math.max(...beetles.map(b => b.breakthroughLevel || 0));
        const totalStock = beetles.reduce((sum, b) => sum + (b.breakthroughStock || 0), 0);

        return (
          <div key={type} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: data.color }}
              >
                🪲
              </div>
              <div className="flex-1">
                <div className="font-bold text-white" style={{ color: rarityColor }}>
                  {data.name}
                </div>
                <div className="text-xs text-gray-400">
                  所持: {totalOwned}体 | 限界突破素材: {totalStock}体
                </div>
                {maxBreakthroughLevel > 0 && (
                  <div className="text-xs text-pink-400">
                    最高凸: {maxBreakthroughLevel}凸 (+{maxBreakthroughLevel * 10}%)
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DUPLICATE_MODES).map(([key, mode]) => {
                const isSelected = currentMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(type, mode)}
                    className={`p-3 rounded-lg font-bold text-sm transition ${
                      isSelected
                        ? mode === 'add'
                          ? 'bg-blue-600 text-white'
                          : mode === 'breakthrough'
                          ? 'bg-purple-600 text-white'
                          : 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {DUPLICATE_MODE_LABELS[mode]}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="p-3 bg-yellow-900 text-yellow-200 rounded text-sm">
        ⚠️ 設定は自動保存され、次回ガチャでも適用されます
      </div>
    </div>
  );
};

export default GachaSystem;