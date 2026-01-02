// client/src/components/Game/DeckEditor.jsx

import React, { useState } from 'react';
import { X, TrendingUp, Check } from 'lucide-react';
import { beetleTypes, RARITY_COLORS, RARITY_NAMES } from '../../utils/beetleData';
import { GAME_CONFIG } from '../../utils/constants';

const DeckEditor = ({ playerData, onClose, onSave, onExpandCost }) => {
  // デッキはID配列
  const [selectedIds, setSelectedIds] = useState([...playerData.deck]);
  const [error, setError] = useState('');

  // コスト拡張価格計算
  const calculateCostExpansionPrice = (expansions) => {
    return 50000 * Math.pow(2, expansions);
  };

  // 総コスト計算
  const calculateTotalCost = (expansions) => {
    return GAME_CONFIG.INITIAL_DECK_COST + (expansions * 10);
  };

  // デッキの総コスト計算
  const calculateDeckCost = (deck, beetleUpgrades) => {
    if (!deck || deck.length === 0) return 0;
    
    let totalCost = 0;
    deck.forEach(beetleId => {
      const beetle = beetleUpgrades[beetleId];
      if (beetle) {
        const baseData = beetleTypes[beetle.type];
        if (baseData) {
          totalCost += baseData.cost;
        }
      }
    });
    
    return totalCost;
  };

  const totalCost = calculateTotalCost(playerData.costExpansions || 0);
  
  // 現在のデッキコストを計算
  const currentDeckCost = calculateDeckCost(selectedIds, playerData.beetleUpgrades);

  const isOverCost = currentDeckCost > totalCost;
  const canExpand = (playerData.costExpansions || 0) < GAME_CONFIG.MAX_COST_EXPANSIONS;
  const expansionPrice = canExpand ? calculateCostExpansionPrice(playerData.costExpansions || 0) : 0;

  // 所有キャラのリスト
  const ownedBeetles = Object.entries(playerData.beetleUpgrades || {}).map(([id, beetle]) => {
    const baseData = beetleTypes[beetle.type];
    return {
      id,
      beetle,
      baseData,
      isInDeck: selectedIds.includes(id)
    };
  }).sort((a, b) => {
    // レアリティでソート（高い順）
    if (b.baseData.rarity !== a.baseData.rarity) {
      return b.baseData.rarity - a.baseData.rarity;
    }
    // レベルでソート（高い順）
    return b.beetle.level - a.beetle.level;
  });

  // キャラの選択/解除
  const toggleBeetle = (id) => {
    const beetle = ownedBeetles.find(b => b.id === id);
    if (!beetle) return;
    
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(beetleId => beetleId !== id));
      setError('');
    } else {
      const newDeck = [...selectedIds, id];
      const newCost = calculateDeckCost(newDeck, playerData.beetleUpgrades);
      
      if (newCost > totalCost) {
        setError(`コストオーバー！ ${newCost}/${totalCost}`);
      } else {
        setSelectedIds(newDeck);
        setError('');
      }
    }
  };

  const handleSave = () => {
    if (isOverCost) {
      setError('コストが超過しています！');
      return;
    }
    
    if (selectedIds.length === 0) {
      setError('最低1体は配置してください！');
      return;
    }
    
    // ID配列で保存
    onSave(selectedIds);
    onClose();
  };

  const handleExpand = () => {
    if (!canExpand) return;
    if (playerData.sg < expansionPrice) {
      setError(`SGが足りません！ ${expansionPrice} SG必要`);
      return;
    }
    
    onExpandCost(expansionPrice);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400">⚔️ デッキ編成</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded transition">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* コスト表示 */}
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">総コスト</span>
            <span className={`text-2xl font-bold ${isOverCost ? 'text-red-500' : 'text-green-500'}`}>
              {currentDeckCost} / {totalCost}
            </span>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-4 mb-3">
            <div
              className={`h-4 rounded-full transition-all ${isOverCost ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (currentDeckCost / totalCost) * 100)}%` }}
            />
          </div>

          <div className="text-center text-gray-400 text-sm mb-3">
            選択中: {selectedIds.length}体
          </div>

          {canExpand && (
            <button
              onClick={handleExpand}
              disabled={playerData.sg < expansionPrice}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-bold transition ${
                playerData.sg >= expansionPrice
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <TrendingUp size={20} />
              コスト拡張 +10 ({expansionPrice.toLocaleString()} SG)
            </button>
          )}
          
          {!canExpand && (
            <div className="text-center text-gray-400 text-sm">
              最大拡張回数に達しました
            </div>
          )}

          <div className="text-center text-gray-400 text-xs mt-2">
            拡張回数: {playerData.costExpansions || 0} / {GAME_CONFIG.MAX_COST_EXPANSIONS}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded text-center">
            {error}
          </div>
        )}

        {ownedBeetles.length === 0 && (
          <div className="mb-6 p-8 bg-gray-700 rounded text-center text-gray-400">
            <div className="text-4xl mb-3">🎰</div>
            <div className="text-lg mb-2">キャラクターを所有していません</div>
            <div className="text-sm">ガチャを引いてキャラクターを獲得しましょう！</div>
          </div>
        )}

        {/* 所有キャラ一覧 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-amber-400 mb-3">
            所有キャラクター（クリックでデッキに追加/削除）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
            {ownedBeetles.map(({ id, beetle, baseData, isInDeck }) => {
              const rarityColor = RARITY_COLORS[baseData.rarity] || '#9CA3AF';
              const rarityName = RARITY_NAMES[baseData.rarity] || 'ノーマル';
              
              return (
                <button
                  key={id}
                  onClick={() => toggleBeetle(id)}
                  className={`p-3 rounded-lg transition text-left ${
                    isInDeck
                      ? 'bg-green-700 hover:bg-green-600 border-2 border-green-400'
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative flex-shrink-0"
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
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white truncate">{baseData.name}</h4>
                        {isInDeck && <Check size={16} className="text-green-400 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-gray-300">
                        Lv.{beetle.level} | コスト: {baseData.cost}
                      </div>
                      <div className="text-xs text-gray-400">
                        {rarityName}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold transition"
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSave}
            disabled={isOverCost || selectedIds.length === 0}
            className={`flex-1 px-6 py-3 rounded font-bold transition ${
              isOverCost || selectedIds.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            デッキを保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor;