// client/src/utils/spinnerData.js

/**
 * 独楽の種類定義
 */
export const spinnerTypes = {
  javascript: {
    name: 'JavaScript独楽',
    language: 'javascript',
    rarity: 1,
    attack: 30,
    speed: 100,
    stability: 70,
    weight: 50,
    cost: 10,
    color: '#f7df1e',
    icon: '💛',
  },
  python: {
    name: 'Python独楽',
    language: 'python',
    rarity: 2,
    attack: 35,
    speed: 90,
    stability: 80,
    weight: 60,
    cost: 15,
    color: '#3776ab',
    icon: '🐍',
  },
  rust: {
    name: 'Rust独楽',
    language: 'rust',
    rarity: 3,
    attack: 40,
    speed: 110,
    stability: 90,
    weight: 70,
    cost: 20,
    color: '#ce422b',
    icon: '🦀',
  },
  basic: {
    name: '基本独楽',
    language: 'general',
    rarity: 1,
    attack: 20,
    speed: 80,
    stability: 60,
    weight: 40,
    cost: 5,
    color: '#10b981',
    icon: '🟢',
  },
  advanced: {
    name: '上級独楽',
    language: 'general',
    rarity: 2,
    attack: 25,
    speed: 90,
    stability: 70,
    weight: 50,
    cost: 10,
    color: '#6366f1',
    icon: '🔵',
  },
};

/**
 * レアリティ別の色
 */
export const RARITY_COLORS = {
  1: '#9CA3AF',
  2: '#60A5FA',
  3: '#A78BFA',
  4: '#FBBF24',
};

/**
 * レアリティ名
 */
export const RARITY_NAMES = {
  1: 'ノーマル',
  2: 'レア',
  3: '高レア',
  4: '最高レア',
};

/**
 * 初期独楽コレクションを作成
 */
export const createInitialSpinners = () => {
  const spinners = {};
  
  const jsSpinnerId = 'spinner_javascript_0';
  spinners[jsSpinnerId] = {
    type: 'javascript',
    level: 1,
    exp: 0,
    upgrades: {
      attack: 0,
      speed: 0,
      stability: 0,
    },
  };
  
  const basicSpinnerId = 'spinner_basic_0';
  spinners[basicSpinnerId] = {
    type: 'basic',
    level: 1,
    exp: 0,
    upgrades: {
      attack: 0,
      speed: 0,
      stability: 0,
    },
  };
  
  return spinners;
};

/**
 * 独楽の現在のステータスを取得（強化を反映）
 */
export const getSpinnerStats = (spinnerId, spinnerData) => {
  if (!spinnerData || !spinnerData[spinnerId]) {
    return spinnerTypes.javascript;
  }
  
  const spinner = spinnerData[spinnerId];
  const baseData = spinnerTypes[spinner.type];
  const upgrades = spinner.upgrades || { attack: 0, speed: 0, stability: 0 };
  const level = spinner.level || 1;
  
  const levelBonus = 1.0 + (level - 1) * 0.1;
  
  return {
    name: baseData.name,
    language: baseData.language,
    rarity: baseData.rarity,
    color: baseData.color,
    icon: baseData.icon,
    attack: Math.floor(baseData.attack * levelBonus * (1 + upgrades.attack * 0.1)),
    speed: Math.floor(baseData.speed * levelBonus * (1 + upgrades.speed * 0.1)),
    stability: Math.floor(baseData.stability * levelBonus * (1 + upgrades.stability * 0.1)),
    weight: baseData.weight,
  };
};

/**
 * 新しい独楽IDを生成
 */
export const generateSpinnerId = (type, ownedSpinners) => {
  const existing = Object.keys(ownedSpinners).filter(id => id.includes(`spinner_${type}_`));
  const nextIndex = existing.length;
  return `spinner_${type}_${nextIndex}`;
};

/**
 * 経験値を追加してレベルアップ判定
 */
export const addSpinnerExp = (spinnerId, exp, spinnerData) => {
  const spinner = spinnerData[spinnerId];
  if (!spinner) return false;
  
  spinner.exp += exp;
  
  const requiredExp = spinner.level * 100;
  if (spinner.exp >= requiredExp) {
    spinner.level++;
    spinner.exp -= requiredExp;
    return true;
  }
  
  return false;
};

/**
 * 独楽を強化
 */
export const upgradeSpinner = (spinnerId, stat, cost, spinnerData, playerSG) => {
  if (playerSG < cost) return false;
  
  const spinner = spinnerData[spinnerId];
  if (!spinner) return false;
  
  const currentUpgrade = spinner.upgrades[stat];
  const maxUpgrades = spinner.level * 5;
  
  if (currentUpgrade >= maxUpgrades) return false;
  
  spinner.upgrades[stat]++;
  return true;
};

/**
 * レベルアップに必要なEXP
 */
export const getRequiredExp = (level) => {
  return level * 100;
};