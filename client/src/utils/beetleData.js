// client/src/utils/beetleData.js

/**
 * 甲虫の種類定義
 */
export const beetleTypes = {
  // 1段（ノーマル）- 79.3%
  kanabun: {
    name: 'カナブン',
    rarity: 1,
    hp: 20,
    atk: 5,
    def: 3,
    carry: 2,
    speed: 0.4,
    power:100,
    count: 6,
    cost: 10,
    color: '#2E8B57',
    size: 14.2,
    imageScale: 1.1,
    gachaRate: 0.793,
    purchasePrice: null,
  },
  
  // 2段（レア）- 15%
  japanese: {
    name: 'カブトムシ',
    rarity: 2,
    hp: 60,
    atk: 15,
    def: 10,
    carry: 2,
    speed: 0.35,
    power:200,
    count: 3,
    cost: 20,
    color: '#654321',
    size: 18.5,
    imageScale: 1.35,
    gachaRate: 0.05,
    purchasePrice: 10000,
  },
  gohontsuno: {
    name: 'ゴホンツノオオカブト',
    rarity: 2,
    hp: 60,
    atk: 16,
    def: 10,
    carry: 2,
    speed: 0.3,
    power:300,
    count: 0,
    cost: 22,
    color: '#6B4423',
    size: 18.7,
    imageScale: 1.4,
    gachaRate: 0.05,
    purchasePrice: 10000,
  },
  saturn: {
    name: 'サターンオオカブト',
    rarity: 2,
    hp: 60,
    atk: 17,
    def: 10,
    carry: 2,
    speed: 0.3,
    power:300,
    count: 0,
    cost: 23,
    color: '#704214',
    size: 19.7,
    imageScale: 1.45,
    gachaRate: 0.05,
    purchasePrice: 10000,
  },
  
  // 3段（高レア）- 4%
  atlas: {
    name: 'アトラス',
    rarity: 3,
    hp: 80,
    atk: 20,
    def: 15,
    carry: 2,
    speed: 0.25,
    power:300,
    count: 2,
    cost: 30,
    color: '#A0522D',
    size: 20.9,
    imageScale: 1.5,
    gachaRate: 0.01,
    purchasePrice: 20000,
  },
  ookuwa: {
    name: 'オオクワガタ',
    rarity: 3,
    hp: 78,
    atk: 22,
    def: 13,
    carry: 2,
    speed: 0.22,
    power:300,
    count: 0,
    cost: 29,
    color: '#2C1810',
    size: 18.5,
    imageScale: 1.55,
    gachaRate: 0.01,
    purchasePrice: 20000,
  },
  elephas: {
    name: 'エレファスゾウカブト',
    rarity: 3,
    hp: 110,
    atk: 20,
    def: 23,
    carry: 2,
    speed: 0.15,
    power:650,
    count: 0,
    cost: 35,
    color: '#c6b8a7ff',
    size: 22.8,
    imageScale: 2.0,
    gachaRate: 0.01,
    purchasePrice: 20000,
  },
  neptune: {
    name: 'ネプチューンオオカブト',
    rarity: 3,
    hp: 85,
    atk: 22,
    def: 16,
    carry: 2,
    speed: 0.22,
    power:350,
    count: 0,
    cost: 32,
    color: '#5C4033',
    size: 21.3,
    imageScale: 1.65,
    gachaRate: 0.01,
    purchasePrice: 20000,
  },
  
  // 4段（最高レア）- 1%
  hercules: {
    name: 'ヘラクレス',
    rarity: 4,
    hp: 100,
    atk: 25,
    def: 20,
    carry: 3,
    speed: 0.2,
    power:400,
    count: 1,
    cost: 40,
    color: '#b2c28eff',
    size: 21.5,
    imageScale: 1.9,
    gachaRate: 0.0025,
    purchasePrice: 80000,
  },
  caucasus: {
    name: 'コーカサスオオカブト',
    rarity: 4,
    hp: 95,
    atk: 26,
    def: 19,
    carry: 3,
    speed: 0.22,
    power:400,
    count: 0,
    cost: 39,
    color: '#293859ff',
    size: 20.9,
    imageScale: 1.8,
    gachaRate: 0.0025,
    purchasePrice: 80000,
  },
  palawan: {
    name: 'パラワンヒラタクワガタ',
    rarity: 4,
    hp: 94,
    atk: 27,
    def: 17,
    carry: 2,
    speed: 0.23,
    power:400,
    count: 0,
    cost: 38,
    color: '#322320ff',
    size: 19.6,
    imageScale: 1.8,
    gachaRate: 0.0025,
    purchasePrice: 80000,
  },
  tarandus: {
    name: 'タランドゥスオオツヤクワガタ',
    rarity: 4,
    hp: 94,
    atk: 28,
    def: 16,
    carry: 2,
    speed: 0.22,
    power:400,
    count: 0,
    cost: 38,
    color: '#120303ff',
    size: 19.2,
    imageScale: 1.7,
    gachaRate: 0.0025,
    purchasePrice: 80000,
  },
  
  // 5段（特別）- 0.4%
  kinghercules: {
    name: 'キングヘラクレス',
    rarity: 5,
    hp: 110,
    atk: 28,
    def: 22,
    carry: 3,
    speed: 0.2,
    power:450,
    count: 0,
    cost: 50,
    color: '#f33939b8',
    size: 20.8,
    imageScale:2.0,
    gachaRate: 0.00134,
    purchasePrice: 200000,
  },
  superiorcaucasus: {
    name: 'スペリオルコーカサス',
    rarity: 5,
    hp: 105,
    atk: 30,
    def: 20,
    carry: 3,
    speed: 0.2,
    power:450,
    count: 0,
    cost: 50,
    color: '#65b329ff',
    size: 20.8,
    imageScale: 2.0,
    gachaRate: 0.00133,
    purchasePrice: 200000,
  },
  niki: {
    name: '金文ニキ',
    rarity: 5,
    hp: 30,
    atk: 8,
    def: 3,
    carry: 2,
    speed: 0.5,
    power:150,
    count: 0,
    cost: 15,
    color: '#1bececff',
    size: 14.7,
    imageScale: 1.15,
    gachaRate: 0.00133,
    purchasePrice: 200000,
  },
  
  // 6段（幻）- 0.2%
  perfecthercules: {
    name: 'パーフェクトヘラクレス',
    rarity: 6,
    hp: 120,
    atk: 32,
    def: 26,
    carry: 2,
    speed: 0.2,
    power:500,
    count: 0,
    cost: 60,
    color: '#57d27caa',
    size: 22,
    imageScale: 2.05,
    gachaRate: 0.001,
    purchasePrice: null,
  },
  marvelous: {
    name: 'マーベラスカブト',
    rarity: 6,
    hp: 120,
    atk: 34,
    def: 28,
    carry: 2,
    speed: 0.2,
    power:500,
    count: 0,
    cost: 62,
    color: '#67dae06f',
    size: 22.1,
    imageScale: 2.1,
    gachaRate: 0.001,
    purchasePrice: null,
  },
};

// 🆕 互換性のためのエイリアス
export const BEETLE_DATA = beetleTypes;

/**
 * レアリティ別の色
 */
export const RARITY_COLORS = {
  1: '#9CA3AF',
  2: '#60A5FA',
  3: '#A78BFA',
  4: '#FBBF24',
  5: '#F472B6',
  6: '#FF1493',
};

/**
 * レアリティ名
 */
export const RARITY_NAMES = {
  1: 'ノーマル',
  2: 'レア',
  3: '高レア',
  4: '最高レア',
  5: '特別',
  6: '幻',
};

/**
 * 🆕 レアリティ別の甲虫リスト
 */
export const BEETLES_BY_TIER = {
  1: ['kanabun'],
  2: ['japanese', 'gohontsuno', 'saturn'],
  3: ['atlas', 'ookuwa', 'elephas', 'neptune'],
  4: ['hercules', 'caucasus', 'palawan', 'tarandus'],
  5: ['kinghercules', 'superiorcaucasus', 'niki'],
  6: ['perfecthercules', 'marvelous'],
};

/**
 * 🆕 ガチャ排出率（レアリティ別）
 */
export const GACHA_RATES = {
  1: 79.3,
  2: 15.0,
  3: 4.0,
  4: 1.0,
  5: 0.5,
  6: 0.2,
};

/**
 * 🆕 直接購入価格（レアリティ別）
 */
export const PURCHASE_PRICES = {
  2: 10000,
  3: 20000,
  4: 80000,
  5: 200000,
};

/**
 * 🆕 甲虫の名前を取得
 */
export const getBeetleName = (type) => {
  return beetleTypes[type]?.name || '不明';
};

/**
 * 🆕 甲虫のコストを取得
 */
export const getBeetleCost = (type) => {
  return beetleTypes[type]?.cost || 0;
};

/**
 * 🆕 甲虫のレアリティ名を取得
 */
export const getBeetleRarity = (type) => {
  const rarity = beetleTypes[type]?.rarity || 1;
  return RARITY_NAMES[rarity];
};

/**
 * 🆕 甲虫のレアリティ数値を取得（tier）
 */
export const getBeetleTier = (type) => {
  return beetleTypes[type]?.rarity || 1;
};

/**
 * 🆕 ガチャ実行関数
 */
export const performGacha = (count, multiplier = 1.0) => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // 運補正を適用した確率を計算
    const adjustedRates = {};
    let total = 0;
    
    Object.entries(GACHA_RATES).forEach(([tier, rate]) => {
      const adjusted = rate * multiplier;
      adjustedRates[tier] = adjusted;
      total += adjusted;
    });
    
    // 正規化
    Object.keys(adjustedRates).forEach(tier => {
      adjustedRates[tier] = (adjustedRates[tier] / total) * 100;
    });
    
    // ランダム抽選
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedTier = 1;
    
    for (let tier = 6; tier >= 1; tier--) {
      cumulative += adjustedRates[tier];
      if (rand < cumulative) {
        selectedTier = tier;
        break;
      }
    }
    
    // 該当レアリティからランダム選択
    const beetles = BEETLES_BY_TIER[selectedTier];
    const selected = beetles[Math.floor(Math.random() * beetles.length)];
    results.push(selected);
  }
  
  return results;
};

/**
 * 全甲虫タイプの配列を取得
 */
export const getAllBeetleTypes = () => Object.entries(beetleTypes);

/**
 * 特定タイプの甲虫データを取得
 */
export const getBeetleType = (type) => beetleTypes[type];

/**
 * レアリティでフィルター
 */
export const getBeetlesByRarity = (rarity) => {
  return Object.entries(beetleTypes).filter(([_, data]) => data.rarity === rarity);
};

/**
 * プレイヤーの甲虫強化データの初期状態を作成
 */
export const createInitialUpgradeData = () => {
  const upgradeData = {};
  
  Object.entries(beetleTypes).forEach(([type, data]) => {
    if (data.count > 0) {
      for (let i = 0; i < data.count; i++) {
        const id = `red_${type}_${i}`;
        upgradeData[id] = {
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
        };
      }
    }
  });
  
  return upgradeData;
};

/**
 * 甲虫の現在のステータスを取得（強化を反映）
 */
export const getBeetleStats = (beetleId, upgradeData) => {
  if (!upgradeData || !upgradeData[beetleId]) {
    const parts = beetleId.split('_');
    const type = parts.length >= 2 ? parts.slice(1, -1).join('_') : parts[1];
    return beetleTypes[type] || beetleTypes.kanabun;
  }
  
  const upgrade = upgradeData[beetleId];
  const baseData = beetleTypes[upgrade.type];
  const upgrades = upgrade.upgrades || { hp: 0, atk: 0, def: 0, carry: 0, speed: 0 };
  
  return {
    hp: baseData.hp * (1 + upgrades.hp * 0.1),
    atk: baseData.atk * (1 + upgrades.atk * 0.1),
    def: baseData.def * (1 + upgrades.def * 0.1),
    carry: baseData.carry * (1 + upgrades.carry * 0.1),
    speed: baseData.speed * (1 + upgrades.speed * 0.1),
  };
};

/**
 * 新しい甲虫IDを生成
 */
export const generateBeetleId = (type, ownedBeetles) => {
  const existing = Object.keys(ownedBeetles).filter(id => id.includes(`red_${type}_`));
  const nextIndex = existing.length;
  return `red_${type}_${nextIndex}`;
};

/**
 * 所有キャラ数を取得
 */
export const getOwnedBeetleCount = (type, ownedBeetles) => {
  return Object.keys(ownedBeetles).filter(id => id.includes(`red_${type}_`)).length;
};