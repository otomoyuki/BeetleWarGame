// client/src/utils/constants.js

/**
 * 色設定
 */
export const COLORS = {
  BACKGROUND: '#1a1a1a',
  RED_TEAM: '#ef4444',
  RED_TEAM_ALPHA: 'rgba(239, 68, 68, 0.1)',
  BLUE_TEAM: '#3b82f6',
  BLUE_TEAM_ALPHA: 'rgba(59, 130, 246, 0.1)',
  TERRITORY_LINE: 'rgba(255, 255, 255, 0.2)',
  NECTAR: '#f59e0b',
  SELECTED: '#facc15',
  HP_BG: '#374151',
  HP_HIGH: '#10b981',
  HP_MID: '#f59e0b',
  HP_LOW: '#ef4444',
};

/**
 * ゲーム基本設定
 */
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GAME_TIME: 180, // 3分
  TARGET_NECTAR: 100,
  INITIAL_NECTAR: 150,
  NECTAR_RADIUS: 60,
  INITIAL_DECK_COST: 240,
  MAX_COST_EXPANSIONS: 20,
};

/**
 * 甲虫の状態
 */
export const BEETLE_STATES = {
  IDLE: 'idle',
  TO_NECTAR: 'to_nectar',
  CARRYING: 'carrying',
  KNOCKOUT: 'knockout',
  MANUAL: 'manual',
  STAYING: 'staying',
};

/**
 * 位置設定
 */
export const POSITIONS = {
  NECTAR1_X_RATIO: 0.25,
  NECTAR2_X_RATIO: 0.75,
  BLUE_GOAL_Y: 50,
  RED_GOAL_Y_OFFSET: 50,
};

/**
 * 戦闘設定
 */
export const COMBAT_CONFIG = {
  COMBAT_DISTANCE_BONUS: 10,
  DAMAGE_MULTIPLIER: 0.1,
  KNOCKOUT_TIME: 300, // 5秒
  HP_RECOVERY_RATE: 0.05,
};

/**
 * 物理設定
 */
export const PHYSICS_CONFIG = {
  OVERLAP_PADDING: 5,
  PUSH_STRENGTH: 0.3,
  VELOCITY_DAMPING: 0.9,
};

/**
 * リスポーン位置
 */
export const RESPAWN_CORNERS = (width, height) => [
  { x: 50, y: 50 },
  { x: width - 50, y: 50 },
  { x: 50, y: height - 50 },
  { x: width - 50, y: height - 50 },
];

/**
 * 🆕 限界突破設定
 */
export const BREAKTHROUGH_CONFIG = {
  MAX_LEVEL: 5,
  THRESHOLDS: [
    { level: 1, required: 20,  bonus: 0.1, stars: '★☆☆☆☆' },
    { level: 2, required: 50,  bonus: 0.2, stars: '★★☆☆☆' },
    { level: 3, required: 90,  bonus: 0.3, stars: '★★★☆☆' },
    { level: 4, required: 150, bonus: 0.4, stars: '★★★★☆' },
    { level: 5, required: 230, bonus: 0.5, stars: '★★★★★' },
  ],
};

/**
 * 🆕 限界突破ボーナスを取得
 */
export const getBreakthroughBonus = (breakthroughLevel) => {
  if (breakthroughLevel <= 0 || breakthroughLevel > BREAKTHROUGH_CONFIG.MAX_LEVEL) {
    return 0;
  }
  const threshold = BREAKTHROUGH_CONFIG.THRESHOLDS.find(t => t.level === breakthroughLevel);
  return threshold ? threshold.bonus : 0;
};

/**
 * 🆕 次の限界突破に必要な素材数を取得
 */
export const getNextBreakthroughRequired = (currentLevel) => {
  if (currentLevel >= BREAKTHROUGH_CONFIG.MAX_LEVEL) return null;
  const nextThreshold = BREAKTHROUGH_CONFIG.THRESHOLDS.find(t => t.level === currentLevel + 1);
  return nextThreshold ? nextThreshold.required : null;
};

/**
 * 🆕 限界突破の星表示を取得
 */
export const getBreakthroughStars = (breakthroughLevel) => {
  if (breakthroughLevel <= 0) return '☆☆☆☆☆';
  if (breakthroughLevel > BREAKTHROUGH_CONFIG.MAX_LEVEL) return '★★★★★';
  const threshold = BREAKTHROUGH_CONFIG.THRESHOLDS.find(t => t.level === breakthroughLevel);
  return threshold ? threshold.stars : '☆☆☆☆☆';
};

/**
 * 難易度設定（12段階）
 */
export const DIFFICULTY_MODES = [
  { 
    id: 1, 
    name: '初級', 
    cpuBonus: 0,
    reward: { win: 20, draw: 10, lose: 3 },
    lupMultiplier: 1.0,
    description: '初心者向け'
  },
  { 
    id: 2, 
    name: '初級+', 
    cpuBonus: 0.25,
    reward: { win: 25, draw: 11, lose: 4 },
    lupMultiplier: 1.2,
    description: '少し強い'
  },
  { 
    id: 3, 
    name: '中級', 
    cpuBonus: 0.5,
    reward: { win: 30, draw: 12, lose: 4 },
    lupMultiplier: 1.5,
    description: '中程度'
  },
  { 
    id: 4, 
    name: '中級+', 
    cpuBonus: 0.85,
    reward: { win: 40, draw: 13, lose: 4 },
    lupMultiplier: 1.8,
    description: 'やや強い'
  },
  { 
    id: 5, 
    name: '上級', 
    cpuBonus: 1.2,
    reward: { win: 50, draw: 14, lose: 5 },
    lupMultiplier: 2.0,
    description: '上級者向け'
  },
  { 
    id: 6, 
    name: '上級+', 
    cpuBonus: 1.8,
    reward: { win: 60, draw: 15, lose: 5 },
    lupMultiplier: 2.5,
    description: 'かなり強い'
  },
  { 
    id: 7, 
    name: '鬼級', 
    cpuBonus: 2.50,
    reward: { win: 80, draw: 16, lose: 5 },
    lupMultiplier: 3.0,
    description: '鬼のような強さ'
  },
  { 
    id: 8, 
    name: '鬼級+', 
    cpuBonus: 3.20,
    reward: { win: 100, draw: 20, lose: 5 },
    lupMultiplier: 4.0,
    description: '超難関'
  },
  { 
    id: 9, 
    name: '悪魔級', 
    cpuBonus: 4.0,
    reward: { win: 150, draw: 25, lose: 5 },
    lupMultiplier: 5.0,
    description: '悪魔的難易度'
  },
  { 
    id: 10, 
    name: '地獄級', 
    cpuBonus: 5.0,
    reward: { win: 200, draw: 35, lose: 5 },
    lupMultiplier: 7.0,
    description: '地獄の難易度'
  },
  { 
    id: 11, 
    name: '白色矮星級', 
    cpuBonus: 6.50,
    reward: { win: 400, draw: 50, lose: 5 },
    lupMultiplier: 10.0,
    description: '地獄を超える難易度'
  },
  { 
    id: 12, 
    name: 'ブラックホール級', 
    cpuBonus: 10.00,
    reward: { win: 700, draw: 100, lose: 5 },
    lupMultiplier: 15.0,
    description: 'ブラックホールの難易度'
  },
    { 
    id: 13, 
    name: '銀河級', 
    cpuBonus: 18.00,
    reward: { win: 1000, draw: 200, lose: 5 },
    lupMultiplier: 25.0,
    description: '銀河の難易度'
  },
    { 
    id: 14, 
    name: '銀河団級', 
    cpuBonus: 30.00,
    reward: { win: 2000, draw: 250, lose: 5 },
    lupMultiplier: 35.0,
    description: '銀河団の難易度'
  }
];

/**
 * SG報酬（難易度別）
 */
export const getSGReward = (difficulty, result) => {
  const mode = DIFFICULTY_MODES.find(m => m.id === difficulty) || DIFFICULTY_MODES[0];
  return mode.reward[result] || 0;
};

/**
 * SG報酬（旧版：互換性のため残す）
 */
export const SG_REWARDS = {
  WIN: 20,
  DRAW: 10,
  LOSE: 3,
};

/**
 * LUP報酬
 */
export const LUP_REWARDS = {
  NECTAR_DELIVERED: 1,
  ENEMY_DEFEATED: 5,
};

/**
 * 強化コスト
 */
export const UPGRADE_COSTS = {
  HP: 10,
  ATK: 20,
  DEF: 20,
  CARRY: 30,
  SPEED: 20,
};

/**
 * 難易度に応じたLUP報酬を計算
 */
export const getLUPReward = (difficulty, baseReward) => {
  const mode = DIFFICULTY_MODES.find(m => m.id === difficulty) || DIFFICULTY_MODES[0];
  return Math.floor(baseReward * (mode.lupMultiplier || 1.0));
};

/**
 * レベルアップコスト計算
 */
export const calculateLevelUpCost = (currentLevel) => {
  return currentLevel * 50 + 300;
};

/**
 * ステータス上限計算
 */
export const calculateStatCap = (baseValue, level) => {
  return baseValue * (1.0 + level * 0.1);
};

/**
 * コスト拡張の計算
 */
export const calculateExpansionCost = (currentExpansions) => {
  return 50000 * Math.pow(2, currentExpansions);
};

export const calculateTotalCost = (expansions) => {
  return GAME_CONFIG.INITIAL_DECK_COST + (expansions * 10);
};

/**
 * デッキシステム設定
 */
export const DECK_SYSTEM = {
  MAX_EXPANSIONS: GAME_CONFIG.MAX_COST_EXPANSIONS,
};

/**
 * コスト拡張価格の計算
 */
export const calculateCostExpansionPrice = (currentExpansions) => {
  return calculateExpansionCost(currentExpansions);
};

/**
 * ガチャ設定
 */
export const GACHA_CONFIG = {
  SINGLE_COST: 500,
  MULTI_COST: 5000,
  MULTI_COUNT: 11,
  PITY_THRESHOLD: 200,
  PITY_RARITY: 5,
  SELL_PRICE: 100,
};

/**
 * 運システム設定
 */
export const LUCK_CONFIG = {
  MAX_LEVEL: 20,
  LEVEL_COSTS: [
    0, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000,
    14000, 15000, 10000, 10000, 20000, 20000, 30000, 50000, 50000, 100000
  ],
  BASE_MULTIPLIERS: [
    1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0,
    2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0
  ],
};

/**
 * 運レベルのコスト計算
 */
export const calculateLuckLevelCost = (currentLevel) => {
  if (currentLevel >= LUCK_CONFIG.MAX_LEVEL) return null;
  return LUCK_CONFIG.LEVEL_COSTS[currentLevel];
};

/**
 * 運レベルの累計コスト計算
 */
export const calculateTotalLuckCost = (targetLevel) => {
  let total = 0;
  for (let i = 1; i < targetLevel && i < LUCK_CONFIG.LEVEL_COSTS.length; i++) {
    total += LUCK_CONFIG.LEVEL_COSTS[i];
  }
  return total;
};

/**
 * ゲームスピード設定
 */
export const GAME_SPEED_OPTIONS = [
  { speed: 1.0, cost: 0, label: '通常速度' },
  { speed: 1.5, cost: 1, label: '1.5倍速' },
  { speed: 2.0, cost: 3, label: '2倍速' },
  { speed: 3.0, cost: 5, label: '3倍速' },
];

/**
 * 🆕 ガチャ被り設定
 */
export const DUPLICATE_MODES = {
  ADD: 'add',              // 新規追加
  BREAKTHROUGH: 'breakthrough',  // 限界突破素材
  SELL: 'sell',            // 自動売却
};

export const DUPLICATE_MODE_LABELS = {
  [DUPLICATE_MODES.ADD]: '🆕 新規追加',
  [DUPLICATE_MODES.BREAKTHROUGH]: '💎 限界突破素材',
  [DUPLICATE_MODES.SELL]: '💰 自動売却',
};

export const DUPLICATE_MODE_DESCRIPTIONS = {
  [DUPLICATE_MODES.ADD]: '新しいキャラとして追加',
  [DUPLICATE_MODES.BREAKTHROUGH]: '既存キャラの素材+1',
  [DUPLICATE_MODES.SELL]: '即座に100 SG獲得',
};