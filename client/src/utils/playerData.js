// client/src/utils/playerData.js

import { createInitialUpgradeData, generateBeetleId, beetleTypes } from './beetleData';
import { 
  UPGRADE_COSTS, 
  calculateLevelUpCost, 
  calculateStatCap, 
  LUCK_CONFIG,
  BREAKTHROUGH_CONFIG,
  getNextBreakthroughRequired
} from './constants';

const STORAGE_KEY = 'beetleWarGame_playerData';

/**
 * プレイヤーデータの初期状態
 */
const createDefaultPlayerData = () => {
  const initialUpgrades = createInitialUpgradeData();
  
  const initialDeck = [];
  Object.keys(initialUpgrades).forEach(id => {
    initialDeck.push(id);
  });
  
  return {
    sg: 0,
    lup: 0,
    beetleUpgrades: initialUpgrades,
    deck: initialDeck,
    costExpansions: 0,
    gachaStats: {
      totalPulls: 0,
      pullsSincePity: 0,
      lastPullTime: null,
    },
    gameStats: {
      totalGames: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      totalNectarDelivered: 0,
      totalEnemiesDefeated: 0,
    },
    luck: {
      level: 1,
      gachaPoints: 50,
      expPoints: 50,
    },
  };
};

/**
 * プレイヤーデータをlocalStorageから読み込む
 */
export const loadPlayerData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      
      if (data.lup === undefined) {
        data.lup = 0;
      }
      
      if (data.costExpansions === undefined) {
        data.costExpansions = 0;
      }
      
      if (!data.gachaStats) {
        data.gachaStats = {
          totalPulls: 0,
          pullsSincePity: 0,
          lastPullTime: null,
        };
      }
      
      if (!data.luck) {
        data.luck = {
          level: 1,
          gachaPoints: 50,
          expPoints: 50,
        };
      }
      
      if (data.deck && !Array.isArray(data.deck)) {
        const newDeck = [];
        Object.keys(data.beetleUpgrades).forEach(id => {
          newDeck.push(id);
        });
        data.deck = newDeck;
      }
      
      if (data.beetleUpgrades) {
        Object.keys(data.beetleUpgrades).forEach(id => {
          if (!data.beetleUpgrades[id].upgrades) {
            data.beetleUpgrades[id].upgrades = {
              hp: 0,
              atk: 0,
              def: 0,
              carry: 0,
              speed: 0,
            };
          }
          
          // 🆕 後方互換性：限界突破データがない場合は追加
          if (data.beetleUpgrades[id].breakthroughLevel === undefined) {
            data.beetleUpgrades[id].breakthroughLevel = 0;
          }
          if (data.beetleUpgrades[id].breakthroughStock === undefined) {
            data.beetleUpgrades[id].breakthroughStock = 1; // 初期所持は1体
          }
        });
      }
      
      return data;
    }
  } catch (error) {
    console.error('Failed to load player data:', error);
  }
  return createDefaultPlayerData();
};

/**
 * プレイヤーデータをlocalStorageに保存
 */
export const savePlayerData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save player data:', error);
    return false;
  }
};

/**
 * SGを追加
 */
export const addSG = (playerData, amount) => {
  playerData.sg += amount;
  savePlayerData(playerData);
  return playerData.sg;
};

/**
 * SGを消費（足りない場合はfalseを返す）
 */
export const spendSG = (playerData, amount) => {
  if (playerData.sg >= amount) {
    playerData.sg -= amount;
    savePlayerData(playerData);
    return true;
  }
  return false;
};

/**
 * LUPを追加（全体のLUPとして管理）
 */
export const addLUP = (playerData, amount) => {
  playerData.lup = (playerData.lup || 0) + amount;
  savePlayerData(playerData);
};

/**
 * 甲虫を強化
 */
export const upgradeBeetle = (playerData, beetleId, stat) => {
  const beetle = playerData.beetleUpgrades[beetleId];
  if (!beetle) return false;
  
  const cost = UPGRADE_COSTS[stat.toUpperCase()];
  if (playerData.sg < cost) return false;
  
  const baseData = beetleTypes[beetle.type];
  if (!baseData) return false;
  
  const upgrades = beetle.upgrades || { hp: 0, atk: 0, def: 0, carry: 0, speed: 0 };
  const baseValue = baseData[stat];
  const currentUpgrade = upgrades[stat];
  const currentValue = baseValue * (1 + currentUpgrade * 0.1);
  const maxValue = calculateStatCap(baseValue, beetle.level);
  
  if (currentValue >= maxValue) return false;
  
  playerData.sg -= cost;
  beetle.upgrades[stat] = currentUpgrade + 1;
  
  savePlayerData(playerData);
  return true;
};

/**
 * 甲虫をレベルアップ
 */
export const levelUpBeetle = (playerData, beetleId) => {
  const beetle = playerData.beetleUpgrades[beetleId];
  if (!beetle) return false;
  
  const cost = calculateLevelUpCost(beetle.level);
  if ((playerData.lup || 0) < cost) return false;
  
  playerData.lup -= cost;
  beetle.level += 1;
  
  savePlayerData(playerData);
  return true;
};

/**
 * 🆕 限界突破を実行
 */
export const breakthroughBeetle = (playerData, beetleId) => {
  const beetle = playerData.beetleUpgrades[beetleId];
  if (!beetle) return false;
  
  const currentLevel = beetle.breakthroughLevel || 0;
  const currentStock = beetle.breakthroughStock || 0;
  
  // 最大レベルチェック
  if (currentLevel >= BREAKTHROUGH_CONFIG.MAX_LEVEL) {
    return false;
  }
  
  // 必要素材数チェック
  const required = getNextBreakthroughRequired(currentLevel);
  if (!required || currentStock < required) {
    return false;
  }
  
  // 限界突破実行
  beetle.breakthroughLevel = currentLevel + 1;
  
  savePlayerData(playerData);
  console.log(`🌟 限界突破成功: ${beetle.type} → ${currentLevel + 1}凸`);
  return true;
};

/**
 * 🆕 限界突破素材をストック（ガチャで被った時）
 */
export const addBreakthroughStock = (playerData, type) => {
  // 同じタイプの甲虫を探す
  let targetBeetle = null;
  let targetId = null;
  
  Object.entries(playerData.beetleUpgrades).forEach(([id, beetle]) => {
    if (beetle.type === type) {
      // 最初に見つかった同タイプの甲虫にストック
      if (!targetBeetle) {
        targetBeetle = beetle;
        targetId = id;
      }
    }
  });
  
  if (targetBeetle) {
    targetBeetle.breakthroughStock = (targetBeetle.breakthroughStock || 1) + 1;
    savePlayerData(playerData);
    console.log(`💎 限界突破素材+1: ${type} (現在: ${targetBeetle.breakthroughStock}体)`);
    return { id: targetId, stock: targetBeetle.breakthroughStock };
  }
  
  return null;
};

/**
 * ゲーム統計を更新
 */
export const updateGameStats = (playerData, result, nectarDelivered, enemiesDefeated) => {
  playerData.gameStats.totalGames++;
  
  if (result === 'win') playerData.gameStats.wins++;
  else if (result === 'draw') playerData.gameStats.draws++;
  else if (result === 'lose') playerData.gameStats.losses++;
  
  if (nectarDelivered !== undefined) {
    playerData.gameStats.totalNectarDelivered += nectarDelivered;
  }
  if (enemiesDefeated !== undefined) {
    playerData.gameStats.totalEnemiesDefeated += enemiesDefeated;
  }
  
  savePlayerData(playerData);
};

/**
 * データをリセット
 */
export const resetPlayerData = () => {
  const defaultData = createDefaultPlayerData();
  savePlayerData(defaultData);
  return defaultData;
};

/**
 * デッキを更新（ID配列）
 */
export const updateDeck = (playerData, newDeck) => {
  playerData.deck = newDeck;
  savePlayerData(playerData);
};

/**
 * コスト拡張を購入
 */
export const expandCost = (playerData) => {
  const cost = 50000 * Math.pow(2, playerData.costExpansions);
  
  if (playerData.sg >= cost) {
    playerData.sg -= cost;
    playerData.costExpansions++;
    savePlayerData(playerData);
    return playerData;
  }
  return null;
};

/**
 * ガチャで新しい甲虫を追加
 */
export const addBeetleFromGacha = (playerData, type) => {
  const beetleData = beetleTypes[type];
  if (!beetleData) return null;
  
  // 🔥 変更：既に同タイプを所持している場合は、素材ストック+1
  const existingBeetles = Object.entries(playerData.beetleUpgrades).filter(
    ([id, beetle]) => beetle.type === type
  );
  
  if (existingBeetles.length > 0) {
    // 被り → 素材ストック
    const result = addBreakthroughStock(playerData, type);
    return result ? result.id : null;
  }
  
  // 新規取得
  const newId = generateBeetleId(type, playerData.beetleUpgrades);
  
  playerData.beetleUpgrades[newId] = {
    type,
    level: 1,
    lup: 0,
    upgrades: {
      hp: 0,
      atk: 0,
      def: 0,
      carry: 0,
      speed: 0,
    },
    breakthroughLevel: 0,    // 🆕
    breakthroughStock: 1,    // 🆕 初期所持は1体
  };
  
  savePlayerData(playerData);
  return newId;
};

/**
 * ガチャ統計を更新
 */
export const updateGachaStats = (playerData, pullCount, types) => {
  playerData.gachaStats.totalPulls += pullCount;
  playerData.gachaStats.pullsSincePity += pullCount;
  playerData.gachaStats.lastPullTime = Date.now();
  
  savePlayerData(playerData);
};

/**
 * 天井リセット
 */
export const resetPityCounter = (playerData) => {
  playerData.gachaStats.pullsSincePity = 0;
  savePlayerData(playerData);
};

/**
 * 甲虫を直接購入
 */
export const purchaseBeetle = (playerData, type, price) => {
  if (playerData.sg < price) return null;
  
  playerData.sg -= price;
  const newId = addBeetleFromGacha(playerData, type);
  
  return { data: playerData, id: newId };
};

/**
 * デッキの総コストを計算
 */
export const calculateDeckCost = (deck, beetleUpgrades) => {
  return deck.reduce((sum, id) => {
    const upgrade = beetleUpgrades[id];
    if (!upgrade) return sum;
    const beetleData = beetleTypes[upgrade.type];
    return sum + (beetleData?.cost || 0);
  }, 0);
};

/**
 * 複数のキャラを売却
 */
export const sellBeetles = (playerData, beetleIds) => {
  let soldCount = 0;
  let totalSG = 0;
  
  beetleIds.forEach(beetleId => {
    if (playerData.deck.includes(beetleId)) return;
    
    const upgrade = playerData.beetleUpgrades[beetleId];
    if (upgrade) {
      const beetleData = beetleTypes[upgrade.type];
      if (beetleData && beetleData.rarity === 6) return;
      
      delete playerData.beetleUpgrades[beetleId];
      soldCount++;
      totalSG += 100;
    }
  });
  
  if (soldCount > 0) {
    playerData.sg += totalSG;
    savePlayerData(playerData);
    return playerData;
  }
  
  return null;
};

/**
 * 運の倍率を計算
 */
export const calculateLuckMultiplier = (luckData) => {
  if (!luckData) {
    return { gachaMultiplier: 1.0, expMultiplier: 1.0 };
  }
  
  const { level, gachaPoints, expPoints } = luckData;
  const baseMultiplier = LUCK_CONFIG.BASE_MULTIPLIERS[level - 1] || 1.0;
  
  const gachaMultiplier = 1.0 + (baseMultiplier - 1.0) * (gachaPoints / 100);
  const expMultiplier = 1.0 + (baseMultiplier - 1.0) * (expPoints / 100);
  
  return { gachaMultiplier, expMultiplier };
};

/**
 * 運レベルをアップグレード
 */
export const upgradeLuckLevel = (playerData) => {
  const currentLevel = playerData.luck?.level || 1;
  
  if (currentLevel >= LUCK_CONFIG.MAX_LEVEL) return null;
  
  const cost = LUCK_CONFIG.LEVEL_COSTS[currentLevel];
  if (!cost || playerData.sg < cost) return null;
  
  playerData.sg -= cost;
  playerData.luck.level = currentLevel + 1;
  
  savePlayerData(playerData);
  return playerData;
};

/**
 * 運ポイントを配分
 */
export const distributeLuckPoints = (playerData, gachaPoints, expPoints) => {
  if (gachaPoints + expPoints !== 100) return null;
  
  playerData.luck.gachaPoints = gachaPoints;
  playerData.luck.expPoints = expPoints;
  
  savePlayerData(playerData);
  return playerData;
};
/**
 * 🆕 被り設定を保存
 */
export const setDuplicateMode = (playerData, type, mode) => {
  if (!playerData.gachaDuplicateSettings) {
    playerData.gachaDuplicateSettings = {};
  }
  
  playerData.gachaDuplicateSettings[type] = mode;
  savePlayerData(playerData);
  return playerData;
};

/**
 * 🆕 被り設定を取得
 */
export const getDuplicateMode = (playerData, type) => {
  return playerData.gachaDuplicateSettings?.[type] || 'breakthrough';
};