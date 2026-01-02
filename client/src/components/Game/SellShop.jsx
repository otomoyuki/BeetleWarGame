// client/src/components/Game/SellShop.jsx

import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { beetleTypes, RARITY_COLORS, RARITY_NAMES } from '../../utils/beetleData';
import { GACHA_CONFIG } from '../../utils/constants';

const SellShop = ({ playerData, onClose, onSell }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  // beetleUpgradesが存在しない場合の安全処理
  const beetles = playerData.beetleUpgrades || {};
  const deck = playerData.deck || [];

  // 売却可能なキャラのみ表示
  const sellableBeetles = Object.entries(beetles)
    .map(([id, beetle]) => {
      const baseData = beetleTypes[beetle.type];
      if (!baseData) return null;
      
      const isInDeck = deck.includes(id);
      const canSell = !isInDeck && baseData.rarity < 6; // 6段（幻）は売却不可
      
      return {
        id,
        beetle,
        baseData,
        isInDeck,
        canSell
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => {
      // 売却可能なものを上に
      if (a.canSell !== b.canSell) return b.canSell ? 1 : -1;
      // レアリティ昇順（低い方が上）
      if (a.baseData.rarity !== b.baseData.rarity) {
        return a.baseData.rarity - b.baseData.rarity;
      }
      return 0;
    });

  // 選択/解除
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(beetleId => beetleId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // まとめて売却
  const handleSellAll = () => {
    if (selectedIds.length === 0) {
      alert('売却するキャラを選択してください');
      return;
    }

    const totalSG = selectedIds.length * GACHA_CONFIG.SELL_PRICE;
    
    if (window.confirm(`選択した${selectedIds.length}体を ${totalSG.toLocaleString()} SG で売却しますか？\n\n※ この操作は取り消せません`)) {
      onSell(selectedIds);
      setSelectedIds([]);
    }
  };

  // 売却可能なキャラ数
  const sellableCount = sellableBeetles.filter(b => b.canSell).length;
  const totalSelectedSG = selectedIds.length * GACHA_CONFIG.SELL_PRICE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-red-400">🗑️ キャラ売却</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded transition">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* SG表示 */}
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-gray-400 text-sm">現在のSG</div>
              <div className="text-2xl font-bold text-yellow-400">
                {playerData.sg.toLocaleString()} SG
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">売却可能</div>
              <div className="text-xl font-bold text-white">
                {sellableCount}体
              </div>
            </div>
          </div>
        </div>

        {/* 選択情報 */}
        {selectedIds.length > 0 && (
          <div className="mb-4 p-4 bg-green-900 rounded">
            <div className="flex justify-between items-center">
              <div className="text-white font-bold">
                選択中: {selectedIds.length}体
              </div>
              <div className="text-green-400 font-bold text-xl">
                +{totalSelectedSG.toLocaleString()} SG
              </div>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="mb-4 p-3 bg-blue-900 text-blue-200 rounded text-sm">
          💡 クリックで選択/解除できます<br/>
          💰 1体あたり {GACHA_CONFIG.SELL_PRICE} SG で買い取ります<br/>
          🚫 デッキ中のキャラと幻（6段）は売却できません
        </div>

        {/* キャラ一覧 */}
        <div className="mb-6 space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {sellableBeetles.length === 0 ? (
            <div className="p-8 bg-gray-700 rounded text-center text-gray-400">
              <div className="text-4xl mb-3">📦</div>
              <div className="text-lg">売却可能なキャラがいません</div>
            </div>
          ) : (
            sellableBeetles.map(({ id, beetle, baseData, isInDeck, canSell }) => {
              const isSelected = selectedIds.includes(id);
              const rarityColor = RARITY_COLORS[baseData.rarity] || '#9CA3AF';
              const rarityName = RARITY_NAMES[baseData.rarity] || 'ノーマル';
              
              // ステータスを計算
              const upgrades = beetle.upgrades || { hp: 0, atk: 0, def: 0, carry: 0, speed: 0 };
              const hpCurrent = baseData.hp * (1 + upgrades.hp * 0.1);
              const atkCurrent = baseData.atk * (1 + upgrades.atk * 0.1);
              const defCurrent = baseData.def * (1 + upgrades.def * 0.1);
              
              return (
                <button
                  key={id}
                  onClick={() => canSell && toggleSelect(id)}
                  disabled={!canSell}
                  className={`w-full p-3 rounded-lg transition text-left ${
                    !canSell
                      ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-green-700 hover:bg-green-600 border-2 border-green-400'
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* チェックボックス風 */}
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      !canSell
                        ? 'border-gray-600 bg-gray-600'
                        : isSelected
                        ? 'border-green-400 bg-green-500'
                        : 'border-gray-400'
                    }`}>
                      {isSelected && <span className="text-white">✓</span>}
                      {!canSell && <span className="text-white">✗</span>}
                    </div>

                    {/* キャラアイコン */}
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

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">
                        {baseData.name} <span className="text-gray-400 text-sm">Lv.{beetle.level}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        HP:{hpCurrent.toFixed(0)} 
                        ATK:{atkCurrent.toFixed(0)} 
                        DEF:{defCurrent.toFixed(0)}
                      </div>
                      <div className="text-xs" style={{ color: rarityColor }}>
                        {rarityName}
                      </div>
                    </div>

                    {/* 価格/状態 */}
                    <div className="text-right flex-shrink-0">
                      {canSell ? (
                        <div className="text-yellow-400 font-bold">
                          {GACHA_CONFIG.SELL_PRICE} SG
                        </div>
                      ) : isInDeck ? (
                        <div className="text-xs text-gray-400">
                          デッキ中
                        </div>
                      ) : (
                        <div className="text-xs text-pink-400">
                          売却不可
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* 操作ボタン */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold transition"
          >
            閉じる
          </button>
          
          <button
            onClick={handleSellAll}
            disabled={selectedIds.length === 0}
            className={`flex-1 px-6 py-3 rounded font-bold transition flex items-center justify-center gap-2 ${
              selectedIds.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Trash2 size={20} />
            まとめて売却 ({totalSelectedSG.toLocaleString()} SG)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellShop;