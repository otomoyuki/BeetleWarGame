// client/src/utils/spinnerConstants.js

/**
 * 独楽戦場固有の定数
 */

/**
 * 強化コスト
 */
export const UPGRADE_COSTS = {
  attack: 50,
  speed: 50,
  stability: 50,
};

/**
 * バトル報酬
 */
export const BATTLE_REWARDS = {
  win: {
    exp: 50,
    sg: {
      programming: 50,
      general: 10,
    }
  },
  lose: {
    exp: 10,
    sg: {
      programming: 5,
      general: 1,
    }
  },
  correctAnswer: 5,
};

/**
 * レベルアップに必要なEXP
 */
export const getRequiredExp = (level) => {
  return level * 100;
};

/**
 * 強化上限の計算
 */
export const getMaxUpgrades = (level) => {
  return level * 5;
};