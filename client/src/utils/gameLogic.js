// client/src/utils/gameLogic.js

import { beetleTypes } from './beetleData';
import { 
  BEETLE_STATES, 
  COMBAT_CONFIG, 
  PHYSICS_CONFIG, 
  RESPAWN_CORNERS,
  GAME_CONFIG 
} from './constants';

/**
 * 🆕 初期ゲーム状態を作成（ID配列ベース）
 * @param {number} width - キャンバス幅
 * @param {number} height - キャンバス高さ
 * @param {Array} deckIds - プレイヤーのデッキ（ID配列）
 * @param {Object} beetleUpgrades - 強化データ
 * @param {number} difficulty - 難易度ID (1-12)
 */
export const createInitialGameState = (width, height, deckIds = [], beetleUpgrades = {}, difficulty = 1) => {
  const beetles = [];

  // 難易度ボーナス計算（CPU側のステータス強化）
  const difficultyBonus = difficulty > 1 ? (difficulty - 1) * 0.15 : 0;

  console.log('🔄 ゲーム状態を完全リセット...');

  // 🆕 赤チーム（下）プレイヤー側 - デッキIDに基づいて配置
  deckIds.forEach(id => {
    const upgrade = beetleUpgrades[id];
    
    if (!upgrade) {
      console.warn(`⚠️ デッキID "${id}" に対応する甲虫データが見つかりません`);
      return;
    }
    
    const baseData = beetleTypes[upgrade.type];
    
    if (!baseData) {
      console.warn(`⚠️ 甲虫タイプ "${upgrade.type}" のデータが見つかりません`);
      return;
    }
    
    const upgrades = upgrade.upgrades || { hp: 0, atk: 0, def: 0, carry: 0, speed: 0 };
    
    // 🔥 修正：upgrade.stats を参照せず、常にベースステータス + 強化値から計算
    // これにより、前回のゲーム状態（HP減少など）を引き継がない
    // 🔥 修正：レベルボーナスは強化値にのみ適用し、carry は整数で扱う
    const levelBonus = (upgrade.level - 1) * 0.1;
    
    const maxHP = Math.round(baseData.hp * (1 + upgrades.hp * 0.1 + levelBonus));
    const currentAtk = Math.round(baseData.atk * (1 + upgrades.atk * 0.1 + levelBonus));
    const currentDef = Math.round(baseData.def * (1 + upgrades.def * 0.1 + levelBonus));
    const currentCarry = Math.round(baseData.carry * (1 + upgrades.carry * 0.1 + levelBonus));
    const currentSpeed = baseData.speed * (1 + upgrades.speed * 0.1 + levelBonus);
    
    // 🔥 修正：ランダムな位置を毎回新規生成
    const randomX = Math.random() * width;
    const randomY = height - Math.random() * 100 - 50;
    
    beetles.push({
      id,  // ← IDは同じでもOK
      type: upgrade.type,
      team: 'red',
      x: randomX,      // ← 新しい位置
      y: randomY,      // ← 新しい位置
      vx: 0,           // ← 速度リセット
      vy: 0,           // ← 速度リセット
      hp: maxHP,       // ← 最大HPで開始（前回の減ったHPを引き継がない）
      maxHp: maxHP,
      atk: currentAtk,
      def: currentDef,
      carry: currentCarry,
      speed: currentSpeed,
      carrying: 0,     // ← 運搬量リセット
      state: BEETLE_STATES.IDLE,  // ← 状態リセット
      target: null,    // ← ターゲットリセット
      knockoutTime: 0, // ← ノックアウト時間リセット
      angle: 0         // ← 角度リセット
    });
    
    console.log(`✅ ${upgrade.type} (ID: ${id}) を配置: HP ${maxHP}, CARRY ${currentCarry}, 位置 (${Math.round(randomX)}, ${Math.round(randomY)})`);
  });

  if (beetles.length === 0) {
    console.error('❌ プレイヤー甲虫が1体も配置されませんでした');
    console.error('デッキIDs:', deckIds);
    console.error('所有甲虫:', Object.keys(beetleUpgrades));
    throw new Error('デッキデータが不正です。リセットが必要です。');
  }

  // 青チーム（上）敵側 - 難易度に応じて強化
  Object.entries(beetleTypes).forEach(([type, data]) => {
    for (let i = 0; i < data.count; i++) {
      const maxHP = Math.round(data.hp * (1 + difficultyBonus));
      
      beetles.push({
        id: `blue_${type}_${i}`,
        type,
        team: 'blue',
        x: Math.random() * width,   // ← 毎回ランダム
        y: Math.random() * 100 + 50, // ← 毎回ランダム
        vx: 0,
        vy: 0,
        hp: maxHP,                   // ← 最大HPで開始
        maxHp: maxHP,
        atk: Math.round(data.atk * (1 + difficultyBonus)),
        def: Math.round(data.def * (1 + difficultyBonus)),
        carry: data.carry,
        speed: data.speed,
        carrying: 0,
        state: BEETLE_STATES.IDLE,
        target: null,
        knockoutTime: 0,
        angle: 0
      });
    }
  });

  console.log(`✅ ゲーム初期化完了: プレイヤー甲虫 ${beetles.filter(b => b.team === 'red').length}体`);
  console.log(`🍯 蜜残量: Pool1=${GAME_CONFIG.INITIAL_NECTAR}, Pool2=${GAME_CONFIG.INITIAL_NECTAR}`);

  return {
    beetles,
    nectarPool1: GAME_CONFIG.INITIAL_NECTAR,  // ← 常に150
    nectarPool2: GAME_CONFIG.INITIAL_NECTAR,  // ← 常に150
    time: 0
  };
};

/**
 * ノックアウト状態の処理
 */
export const handleKnockout = (beetle, width, height) => {
  beetle.knockoutTime--;
  if (beetle.knockoutTime <= 0) {
    beetle.hp = 1;
    beetle.state = BEETLE_STATES.IDLE;
    
    const corners = RESPAWN_CORNERS(width, height);
    let availableCorners;
    if (beetle.team === 'red') {
      availableCorners = [corners[2], corners[3]]; // 下の2隅
    } else {
      availableCorners = [corners[0], corners[1]]; // 上の2隅
    }
    
    const corner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    beetle.x = corner.x;
    beetle.y = corner.y;
  }
};

/**
 * HP自動回復
 */
export const recoverHP = (beetle) => {
  if (beetle.hp > 0 && beetle.hp < beetle.maxHp) {
    beetle.hp = Math.min(beetle.maxHp, beetle.hp + COMBAT_CONFIG.HP_RECOVERY_RATE);
  }
};

/**
 * 最も近い樹液エリアを選択
 */
export const selectNearestNectar = (beetle, nectar1X, nectar1Y, nectar2X, nectar2Y, state) => {
  const distToNectar1 = Math.sqrt((beetle.x - nectar1X) ** 2 + (beetle.y - nectar1Y) ** 2);
  const distToNectar2 = Math.sqrt((beetle.x - nectar2X) ** 2 + (beetle.y - nectar2Y) ** 2);
  
  if (state.nectarPool1 > 0 && state.nectarPool2 > 0) {
    return distToNectar1 < distToNectar2 ? 1 : 2;
  } else if (state.nectarPool1 > 0) {
    return 1;
  } else if (state.nectarPool2 > 0) {
    return 2;
  }
  return null;
};

/**
 * 樹液採取の処理
 * @returns {boolean} 採取に成功したかどうか
 */
export const collectNectar = (beetle, state, nectar1X, nectar1Y, nectar2X, nectar2Y, nectarRadius, goalY, width) => {
  const pool1Dist = Math.sqrt((beetle.x - nectar1X) ** 2 + (beetle.y - nectar1Y) ** 2);
  const pool2Dist = Math.sqrt((beetle.x - nectar2X) ** 2 + (beetle.y - nectar2Y) ** 2);
  
  let nectarPool;
  if (pool1Dist < pool2Dist && state.nectarPool1 > 0) {
    nectarPool = 'nectarPool1';
  } else if (state.nectarPool2 > 0) {
    nectarPool = 'nectarPool2';
  } else if (state.nectarPool1 > 0) {
    nectarPool = 'nectarPool1';
  } else {
    return false;
  }
  
  const amount = Math.min(beetle.carry, state[nectarPool]);
  if (amount > 0) {
    beetle.carrying = amount;
    state[nectarPool] -= amount;
    beetle.state = BEETLE_STATES.CARRYING;
    // ゴールの中心に向かう
    beetle.target = { 
      x: width / 2,
      y: goalY
    };
    return true;
  }
  return false;
};

/**
 * 蜜を最も近い樹液エリアに戻す
 */
export const returnNectarToPool = (beetle, state, nectar1X, nectar1Y, nectar2X, nectar2Y) => {
  if (beetle.carrying <= 0) return;
  
  const pool1Dist = Math.sqrt((beetle.x - nectar1X) ** 2 + (beetle.y - nectar1Y) ** 2);
  const pool2Dist = Math.sqrt((beetle.x - nectar2X) ** 2 + (beetle.y - nectar2Y) ** 2);
  
  if (pool1Dist < pool2Dist) {
    state.nectarPool1 += beetle.carrying;
  } else {
    state.nectarPool2 += beetle.carrying;
  }
};

/**
 * 戦闘処理
 * @param {Object} state - ゲーム状態（nectarPool1, nectarPool2）
 * @param {Object} nectarPositions - { nectar1X, nectar1Y, nectar2X, nectar2Y }
 * @returns {Object} { defeatedEnemies: [], eliteBattles: [] }
 */
export const handleCombat = (beetle, allBeetles, state, nectarPositions, upgradeData = null) => {
  const bType = beetleTypes[beetle.type];
  const defeatedEnemies = [];
  const eliteBattles = [];
  
  allBeetles.forEach(other => {
    if (other.team !== beetle.team && other.state !== BEETLE_STATES.KNOCKOUT) {
      const dx = other.x - beetle.x;
      const dy = other.y - beetle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minCombatDist = bType.size + beetleTypes[other.type].size + COMBAT_CONFIG.COMBAT_DISTANCE_BONUS;
      
      if (dist < minCombatDist) {
        // エリート戦闘判定
        const isEliteBattle = checkEliteBattle(beetle, other, upgradeData);
        if (isEliteBattle) {
          eliteBattles.push({
            beetle1: beetle,
            beetle2: other,
            x: (beetle.x + other.x) / 2,
            y: (beetle.y + other.y) / 2
          });
        }
        
        const damage = Math.max(1, beetle.atk - other.def);
        other.hp -= damage * COMBAT_CONFIG.DAMAGE_MULTIPLIER;
        
        if (other.hp <= 0) {
          other.hp = 0;
          other.state = BEETLE_STATES.KNOCKOUT;
          other.knockoutTime = COMBAT_CONFIG.KNOCKOUT_TIME;
          
          // 運搬中の蜜を最も近い樹液エリアに戻す
          if (other.carrying > 0 && nectarPositions && state) {
            const { nectar1X, nectar1Y, nectar2X, nectar2Y } = nectarPositions;
            returnNectarToPool(other, state, nectar1X, nectar1Y, nectar2X, nectar2Y);
          }
          
          other.carrying = 0;
          defeatedEnemies.push(other.id);
        }
      }
    }
  });
  
  return { defeatedEnemies, eliteBattles };
};

/**
 * エリート戦闘判定（強者同士の戦い）
 */
const checkEliteBattle = (beetle1, beetle2, upgradeData) => {
  // 強化データがない場合は基本ステータスで判定
  const getLevel = (beetle) => {
    if (!upgradeData || !upgradeData[beetle.id]) return 1;
    return upgradeData[beetle.id].level || 1;
  };
  
  const level1 = getLevel(beetle1);
  const level2 = getLevel(beetle2);
  const hp1 = beetle1.maxHp;
  const hp2 = beetle2.maxHp;
  
  // どちらもレベル5以上、またはHP80以上
  const isElite1 = level1 >= 5 || hp1 >= 80;
  const isElite2 = level2 >= 5 || hp2 >= 80;
  
  return isElite1 && isElite2;
};

/**
 * 甲虫同士の重なり防止
 */
export const preventOverlap = (beetle, allBeetles) => {
  const bType = beetleTypes[beetle.type];
  
  allBeetles.forEach(other => {
    if (other.id !== beetle.id && other.state !== BEETLE_STATES.KNOCKOUT) {
      const dx = other.x - beetle.x;
      const dy = other.y - beetle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = bType.size + beetleTypes[other.type].size + PHYSICS_CONFIG.OVERLAP_PADDING;
      
      if (dist < minDist && dist > 0) {
        const pushStrength = (minDist - dist) * PHYSICS_CONFIG.PUSH_STRENGTH;
        const angle = Math.atan2(dy, dx);
        beetle.x -= Math.cos(angle) * pushStrength;
        beetle.y -= Math.sin(angle) * pushStrength;
      }
    }
  });
};

/**
 * 位置更新と画面端処理
 */
export const updatePosition = (beetle, width, height) => {
  const bType = beetleTypes[beetle.type];
  
  beetle.x += beetle.vx;
  beetle.y += beetle.vy;
  beetle.vx *= PHYSICS_CONFIG.VELOCITY_DAMPING;
  beetle.vy *= PHYSICS_CONFIG.VELOCITY_DAMPING;

  beetle.x = Math.max(bType.size, Math.min(width - bType.size, beetle.x));
  beetle.y = Math.max(bType.size, Math.min(height - bType.size, beetle.y));
};

/**
 * 移動処理（ゲームスピード対応）
 */
export const moveToTarget = (beetle, targetX, targetY, gameSpeed = 1.0) => {
  const dx = targetX - beetle.x;
  const dy = targetY - beetle.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 10) {
    beetle.vx = (dx / dist) * beetle.speed * gameSpeed;
    beetle.vy = (dy / dist) * beetle.speed * gameSpeed;
    return false;
  }
  return true;
};

/**
 * 移動方向に角度を更新
 */
export const updateBeetleAngle = (beetle) => {
  if (Math.abs(beetle.vx) > 0.1 || Math.abs(beetle.vy) > 0.1) {
    beetle.angle = Math.atan2(beetle.vy, beetle.vx);
  }
};