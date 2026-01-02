// client/src/utils/spinnerPlayerData.js

import { createInitialSpinners, generateSpinnerId, spinnerTypes } from './spinnerData.js';

const STORAGE_KEY = 'spinnerBattle_playerData';

/**
 * プレイヤーデータの初期状態
 */
const createDefaultPlayerData = () => {
  const initialSpinners = createInitialSpinners();
  
  return {
    sg: 0,
    spinners: initialSpinners,
    selectedSpinner: 'spinner_javascript_0',
    battleStats: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      maxCombo: 0,
      totalDamage: 0,
    },
  };
};

/**
 * プレイヤーデータをlocalStorageから読み込む
 */
export const loadSpinnerPlayerData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      
      if (!data.spinners) {
        data.spinners = createInitialSpinners();
      }
      if (!data.selectedSpinner) {
        data.selectedSpinner = Object.keys(data.spinners)[0];
      }
      if (!data.battleStats) {
        data.battleStats = {
          totalGames: 0,
          wins: 0,
          losses: 0,
          maxCombo: 0,
          totalDamage: 0,
        };
      }
      
      return data;
    }
  } catch (error) {
    console.error('Failed to load spinner player data:', error);
  }
  return createDefaultPlayerData();
};

/**
 * プレイヤーデータをlocalStorageに保存
 */
export const saveSpinnerPlayerData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save spinner player data:', error);
    return false;
  }
};

/**
 * SGを追加
 */
export const addSG = (playerData, amount) => {
  playerData.sg += amount;
  saveSpinnerPlayerData(playerData);
};

/**
 * SGを消費
 */
export const spendSG = (playerData, amount) => {
  if (playerData.sg >= amount) {
    playerData.sg -= amount;
    saveSpinnerPlayerData(playerData);
    return true;
  }
  return false;
};

/**
 * 独楽を追加（ガチャなどで）
 */
export const addSpinner = (playerData, type) => {
  const newId = generateSpinnerId(type, playerData.spinners);
  const baseData = spinnerTypes[type];
  
  if (!baseData) return null;
  
  playerData.spinners[newId] = {
    type,
    level: 1,
    exp: 0,
    upgrades: {
      attack: 0,
      speed: 0,
      stability: 0,
    },
  };
  
  saveSpinnerPlayerData(playerData);
  return newId;
};

/**
 * 独楽を選択
 */
export const selectSpinner = (playerData, spinnerId) => {
  if (playerData.spinners[spinnerId]) {
    playerData.selectedSpinner = spinnerId;
    saveSpinnerPlayerData(playerData);
    return true;
  }
  return false;
};

/**
 * 独楽に経験値を追加
 */
export const addSpinnerExp = (playerData, spinnerId, exp) => {
  const spinner = playerData.spinners[spinnerId];
  if (!spinner) return false;
  
  spinner.exp += exp;
  
  const requiredExp = spinner.level * 100;
  let leveledUp = false;
  
  while (spinner.exp >= requiredExp) {
    spinner.level++;
    spinner.exp -= requiredExp;
    leveledUp = true;
  }
  
  saveSpinnerPlayerData(playerData);
  return leveledUp;
};

/**
 * 独楽を強化
 */
export const upgradeSpinner = (playerData, spinnerId, stat, cost) => {
  if (playerData.sg < cost) return false;
  
  const spinner = playerData.spinners[spinnerId];
  if (!spinner) return false;
  
  const maxUpgrades = spinner.level * 5;
  if (spinner.upgrades[stat] >= maxUpgrades) return false;
  
  playerData.sg -= cost;
  spinner.upgrades[stat]++;
  
  saveSpinnerPlayerData(playerData);
  return true;
};

/**
 * バトル結果を記録
 */
export const recordBattleResult = (playerData, result, combo, damage) => {
  playerData.battleStats.totalGames++;
  
  if (result === 'win') {
    playerData.battleStats.wins++;
  } else {
    playerData.battleStats.losses++;
  }
  
  if (combo > playerData.battleStats.maxCombo) {
    playerData.battleStats.maxCombo = combo;
  }
  
  playerData.battleStats.totalDamage += damage;
  
  saveSpinnerPlayerData(playerData);
};

/**
 * データをリセット
 */
export const resetSpinnerPlayerData = () => {
  const defaultData = createDefaultPlayerData();
  saveSpinnerPlayerData(defaultData);
  return defaultData;
};