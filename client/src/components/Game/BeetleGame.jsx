// client/src/components/Game/BeetleGame.jsx

import React, { useState, useEffect, useRef } from 'react';
import ScoreBoard from './ScoreBoard';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import PlayerStats from './PlayerStats';
import UpgradeShop from './UpgradeShop';
import DeckEditor from './DeckEditor';
import GachaSystem from './GachaSystem';
import SellShop from './SellShop';
import LuckSystem from './LuckSystem';
import { 
  createInitialGameState, 
  handleKnockout, 
  recoverHP, 
  selectNearestNectar, 
  collectNectar, 
  handleCombat, 
  preventOverlap, 
  updatePosition, 
  moveToTarget,
  returnNectarToPool,
  updateBeetleAngle
} from '../../utils/gameLogic';
import { drawGame, loadAllBeetleImages } from '../../utils/canvasDrawing';  // 🆕 追加
import { getBeetleStats } from '../../utils/beetleData';
import { 
  loadPlayerData, 
  savePlayerData, 
  addSG, 
  addLUP, 
  updateGameStats, 
  updateDeck, 
  expandCost, 
  addBeetleFromGacha, 
  updateGachaStats, 
  resetPityCounter, 
  purchaseBeetle, 
  upgradeLuckLevel, 
  distributeLuckPoints,
  upgradeBeetle,
  levelUpBeetle,
  sellBeetles
} from '../../utils/playerData';
import { 
  GAME_CONFIG, 
  BEETLE_STATES, 
  POSITIONS, 
  LUP_REWARDS, 
  getSGReward
} from '../../utils/constants';

const BeetleGame = () => {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [redNectar, setRedNectar] = useState(0);
  const [blueNectar, setBlueNectar] = useState(0);
  const [winner, setWinner] = useState(null);
  const [selectedBeetle, setSelectedBeetle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_TIME);
  const gameStateRef = useRef(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  // プレイヤーデータ
  const [playerData, setPlayerData] = useState(loadPlayerData());
  const [showShop, setShowShop] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [showLuck, setShowLuck] = useState(false);
  
  // 難易度設定
  const [difficulty, setDifficulty] = useState(1);
  
  // ゲーム中の統計
  const gameStatsRef = useRef({
    nectarDelivered: 0,
    enemiesDefeated: 0,
  });

   useEffect(() => {
    console.log('🎨 画像読み込み開始...');
    loadAllBeetleImages();
  }, []);

  

  // ゲーム初期化（ID配列ベース）
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    gameStateRef.current = createInitialGameState(
      canvas.width, 
      canvas.height, 
      playerData.deck, // ID配列
      playerData.beetleUpgrades, // ← 元の名前に戻す
      difficulty
    );

    setRedNectar(0);
    setBlueNectar(0);
    setWinner(null);
    setSelectedBeetle(null);
    setTimeLeft(GAME_CONFIG.GAME_TIME);
    gameStatsRef.current = { nectarDelivered: 0, enemiesDefeated: 0 };
  }, [resetTrigger, playerData.beetleUpgrades, playerData.deck, difficulty]);

  // タイマー管理と終了処理
  useEffect(() => {
    if (!isRunning || winner) return;

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間切れ：勝敗判定のみ
          if (redNectar > blueNectar) {
            setWinner('red');
          } else if (blueNectar > redNectar) {
            setWinner('blue');
          } else {
            setWinner('draw');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isRunning, winner, redNectar, blueNectar]);

  // 勝敗確定時の報酬処理
  useEffect(() => {
    if (!winner || !gameStateRef.current) return;
    
    const result = winner === 'red' ? 'win' : winner === 'blue' ? 'lose' : 'draw';
    const sgReward = getSGReward(difficulty, result);
    
    const newPlayerData = { ...playerData };
    addSG(newPlayerData, sgReward);
    
    // LUPをまとめて付与
    const redBeetles = gameStateRef.current.beetles.filter(b => b.team === 'red');
    if (redBeetles.length > 0) {
      redBeetles.forEach(beetle => {
        const nectarLUP = Math.floor((gameStatsRef.current.nectarDelivered / redBeetles.length) * LUP_REWARDS.NECTAR_DELIVERED);
        const defeatedLUP = Math.floor((gameStatsRef.current.enemiesDefeated / redBeetles.length) * LUP_REWARDS.ENEMY_DEFEATED);
        
        if (nectarLUP > 0 || defeatedLUP > 0) {
          addLUP(newPlayerData, nectarLUP + defeatedLUP);
        }
      });
    }
    
    updateGameStats(newPlayerData, result);
    setPlayerData(newPlayerData);
  }, [winner]);

  // ゲームループ
  useEffect(() => {
    if (!canvasRef.current || !gameStateRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gameLoop = () => {
      if (!gameStateRef.current) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const state = gameStateRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      const nectarRadius = GAME_CONFIG.NECTAR_RADIUS;
      const blueGoalY = POSITIONS.BLUE_GOAL_Y;
      const redGoalY = h - POSITIONS.RED_GOAL_Y_OFFSET;
      
      const nectar1X = w * POSITIONS.NECTAR1_X_RATIO;
      const nectar1Y = centerY;
      const nectar2X = w * POSITIONS.NECTAR2_X_RATIO;
      const nectar2Y = centerY;

      // 描画
      drawGame(ctx, state, selectedBeetle, w, h);

      if (isRunning && !winner) {
        // 甲虫の更新
        state.beetles.forEach(beetle => {
          const stats = getBeetleStats(beetle.type, beetle.upgrades, beetle.level);

          // ノックアウト処理
          if (beetle.state === BEETLE_STATES.KNOCKOUT) {
            handleKnockout(beetle, w, h);
            return;
          }

          // HP自動回復
          recoverHP(beetle);

          // AI行動決定
          if (beetle.state === BEETLE_STATES.IDLE) {
            const targetNectar = selectNearestNectar(beetle, nectar1X, nectar1Y, nectar2X, nectar2Y, state);
            if (targetNectar) {
              beetle.state = BEETLE_STATES.TO_NECTAR;
              beetle.targetNectar = targetNectar;
              beetle.target = targetNectar === 1 
                ? { x: nectar1X, y: nectar1Y }
                : { x: nectar2X, y: nectar2Y };
            }
          } else if (beetle.state === BEETLE_STATES.MANUAL) {
            if (beetle.target) {
              const arrived = moveToTarget(beetle, beetle.target.x, beetle.target.y);
              if (arrived) {
                beetle.state = BEETLE_STATES.STAYING;
                beetle.target = null;
                beetle.vx = 0;
                beetle.vy = 0;
              }
            }
          } else if (beetle.state === BEETLE_STATES.STAYING) {
            beetle.vx = 0;
            beetle.vy = 0;
          } else if (beetle.state === BEETLE_STATES.TO_NECTAR) {
            const targetX = beetle.target.x;
            const targetY = beetle.target.y;
            const dx = targetX - beetle.x;
            const dy = targetY - beetle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nectarRadius + 20) {
              const goalY = beetle.team === 'red' ? redGoalY : blueGoalY;
              collectNectar(beetle, state, nectar1X, nectar1Y, nectar2X, nectar2Y, nectarRadius, goalY, w);
            } else {
              beetle.vx = (dx / dist) * beetle.speed;
              beetle.vy = (dy / dist) * beetle.speed;
            }
          } else if (beetle.state === BEETLE_STATES.CARRYING) {
            const goalY = beetle.team === 'red' ? redGoalY : blueGoalY;
            const goalDx = w/2 - beetle.x;
            const goalDy = goalY - beetle.y;
            const goalDist = Math.sqrt(goalDx * goalDx + goalDy * goalDy);

            if (goalDist < 50) {
              const deliveredAmount = beetle.carrying;
              
              if (beetle.team === 'red') {
                setRedNectar(prev => {
                  const newVal = prev + deliveredAmount;
                  if (newVal >= GAME_CONFIG.TARGET_NECTAR) setWinner('red');
                  return newVal;
                });
                gameStatsRef.current.nectarDelivered += deliveredAmount;
              } else {
                setBlueNectar(prev => {
                  const newVal = prev + deliveredAmount;
                  if (newVal >= GAME_CONFIG.TARGET_NECTAR) setWinner('blue');
                  return newVal;
                });
              }
              
              returnNectarToPool(beetle, state, nectar1X, nectar1Y, nectar2X, nectar2Y);
              
              beetle.carrying = 0;
              beetle.state = BEETLE_STATES.IDLE;
            } else {
              beetle.vx = (goalDx / goalDist) * beetle.speed;
              beetle.vy = (goalDy / goalDist) * beetle.speed;
            }
          }

          // 戦闘判定
          if (beetle.state !== BEETLE_STATES.KNOCKOUT) {
            const nectarPositions = { nectar1X, nectar1Y, nectar2X, nectar2Y };
            const combatResult = handleCombat(
              beetle, 
              state.beetles, 
              state, 
              nectarPositions,
              playerData.beetleUpgrades // ← 元の名前に戻す
            );
            
            if (combatResult.defeatedEnemies && combatResult.defeatedEnemies.length > 0 && beetle.team === 'red') {
              gameStatsRef.current.enemiesDefeated += combatResult.defeatedEnemies.length;
            }
            
            preventOverlap(beetle, state.beetles);
          }

          // 位置更新
          updatePosition(beetle, w, h);

          if (beetle.state !== BEETLE_STATES.KNOCKOUT) {
            updateBeetleAngle(beetle);
          }
        });
      }

      state.time++;
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRunning, winner, selectedBeetle, resetTrigger, playerData.beetleUpgrades, difficulty]);

  // キャンバスクリック処理
  const handleCanvasClick = (e) => {
    if (!isRunning || !gameStateRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    const w = canvas.width;
    const h = canvas.height;
    const nectar1X = w * POSITIONS.NECTAR1_X_RATIO;
    const nectar1Y = h / 2;
    const nectar2X = w * POSITIONS.NECTAR2_X_RATIO;
    const nectar2Y = h / 2;
    const nectarRadius = GAME_CONFIG.NECTAR_RADIUS;
    const redGoalY = h - POSITIONS.RED_GOAL_Y_OFFSET;

    if (selectedBeetle) {
      const beetle = gameStateRef.current.beetles.find(b => b.id === selectedBeetle);
      if (beetle && beetle.team === 'red' && beetle.state !== BEETLE_STATES.KNOCKOUT) {
        beetle.target = { x: clickX, y: clickY };
        
        const distToNectar1 = Math.sqrt((clickX - nectar1X) ** 2 + (clickY - nectar1Y) ** 2);
        const distToNectar2 = Math.sqrt((clickX - nectar2X) ** 2 + (clickY - nectar2Y) ** 2);
        const distToGoal = Math.sqrt((clickX - w/2) ** 2 + (clickY - redGoalY) ** 2);
        
        if (distToNectar1 < nectarRadius + 20) {
          beetle.state = BEETLE_STATES.TO_NECTAR;
          beetle.targetNectar = 1;
        } else if (distToNectar2 < nectarRadius + 20) {
          beetle.state = BEETLE_STATES.TO_NECTAR;
          beetle.targetNectar = 2;
        } else if (distToGoal < 70) {
          beetle.state = BEETLE_STATES.CARRYING;
        } else {
          beetle.state = BEETLE_STATES.MANUAL;
        }
      }
      setSelectedBeetle(null);
    } else {
      let closestBeetle = null;
      let closestDist = Infinity;
      
      gameStateRef.current.beetles.forEach(beetle => {
        if (beetle.team !== 'red' || beetle.state === BEETLE_STATES.KNOCKOUT) return;
        const dx = beetle.x - clickX;
        const dy = beetle.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 20 + 5 && dist < closestDist) {
          closestBeetle = beetle;
          closestDist = dist;
        }
      });
      
      if (closestBeetle) {
        setSelectedBeetle(closestBeetle.id);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setResetTrigger(prev => prev + 1);
  };
  

// 強化処理（修正版）
const handleUpgrade = (beetleId, stat) => {
  const newPlayerData = { ...playerData };
  const result = upgradeBeetle(newPlayerData, beetleId, stat);
  if (result) {
    setPlayerData(newPlayerData);
  }
};

// レベルアップ処理（修正版）
const handleLevelUp = (beetleId) => {
  const newPlayerData = { ...playerData };
  const result = levelUpBeetle(newPlayerData, beetleId);
  if (result) {
    setPlayerData(newPlayerData);
  }
};

// デッキ保存（ID配列）
const handleSaveDeck = (newDeckIds) => {
  if (isRunning) {
    alert('ゲーム中はデッキを変更できません！');
    return;
  }
  
  const newPlayerData = { ...playerData };
  updateDeck(newPlayerData, newDeckIds);
  setPlayerData(newPlayerData);
  setResetTrigger(prev => prev + 1);
};

// コスト拡張（修正版）
const handleExpandCost = (cost) => {
  const newPlayerData = { ...playerData };
  const result = expandCost(newPlayerData);
  if (result) {
    setPlayerData(result);
  }
};

// 難易度変更
const handleDifficultyChange = (newDifficulty) => {
  if (!isRunning) {
    setDifficulty(newDifficulty);
  }
};

// ガチャ実行
const handleGachaPull = (results, pullCount) => {
  const newPlayerData = { ...playerData };
  
  // SGを消費
  const cost = pullCount === 1 ? 500 : 5000;
  newPlayerData.sg -= cost;
  
  // キャラを追加
  results.forEach(result => {
    addBeetleFromGacha(newPlayerData, result.type);
  });
  
  // ガチャ統計更新
  updateGachaStats(newPlayerData, pullCount, results.map(r => r.type));
  
  // 天井リセット（5段以上が出た場合）
  const hasRarity5Plus = results.some(r => r.tier >= 5);
  if (hasRarity5Plus) {
    resetPityCounter(newPlayerData);
  }
  
  setPlayerData(newPlayerData);
  savePlayerData(newPlayerData);
};

// 直接購入
const handlePurchase = (type, price) => {
  const newPlayerData = { ...playerData };
  const result = purchaseBeetle(newPlayerData, type, price);
  
  if (result) {
    setPlayerData(result.data);
    alert(`購入しました！`);
  }
};

// 売却処理（複数）
const handleSellMultiple = (beetleIds) => {
  const totalSG = beetleIds.length * 100; // 1体100 SG
  const newPlayerData = { ...playerData };
  const result = sellBeetles(newPlayerData, beetleIds);
  
  if (result) {
    setPlayerData(result);
    alert(`${beetleIds.length}体を売却し、${totalSG.toLocaleString()} SG 獲得しました！`);
  }
};

// 運レベルアップ（修正版）
const handleLuckLevelUp = () => {
  const newPlayerData = { ...playerData };
  const result = upgradeLuckLevel(newPlayerData);
  
  if (result) {
    setPlayerData(result);
    alert('運レベルがアップしました！');
  } else {
    alert('SGが足りないか、最大レベルです');
  }
};

// 運ポイント配分（修正版）
const handleLuckDistribute = (gachaPoints, expPoints) => {
  const newPlayerData = { ...playerData };
  const result = distributeLuckPoints(newPlayerData, gachaPoints, expPoints);
  
  if (result) {
    setPlayerData(result);
  }
};

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col p-4 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-center mb-4 text-amber-400">
          🪲 甲虫戦争ゲーム 🪲
        </h1>

        <PlayerStats 
          sg={playerData.sg}
          costExpansions={playerData.costExpansions || 0}
          difficulty={difficulty}
          luck={playerData.luck}
          onDifficultyChange={handleDifficultyChange}
          onOpenShop={() => setShowShop(true)}
          onOpenDeck={() => setShowDeck(true)}
          onOpenGacha={() => setShowGacha(true)}
          onOpenSell={() => setShowSell(true)}
          onOpenLuck={() => setShowLuck(true)}
          gameStarted={isRunning}
        />

        <ScoreBoard 
          redNectar={redNectar} 
          blueNectar={blueNectar} 
          timeLeft={timeLeft}
        />

        <GameCanvas 
          canvasRef={canvasRef}
          onClick={handleCanvasClick}
          selectedBeetle={selectedBeetle}
          winner={winner}
        />

        <GameControls 
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning(!isRunning)}
          onReset={handleReset}
          disabled={winner !== null}
        />
      </div>
      
      {showShop && (
        <UpgradeShop
          playerData={playerData}
          onClose={() => setShowShop(false)}
          onUpgrade={handleUpgrade}
          onLevelUp={handleLevelUp}
        />
      )}
      
      {showDeck && (
        <DeckEditor
          playerData={playerData}
          onClose={() => setShowDeck(false)}
          onSave={handleSaveDeck}
          onExpandCost={handleExpandCost}
        />
      )}
      
      {showGacha && (
        <GachaSystem
          playerData={playerData}
          onClose={() => setShowGacha(false)}
          onPull={handleGachaPull}
          onPurchase={handlePurchase}
        />
      )}
      
      {showSell && (
        <SellShop
          playerData={playerData}
          onClose={() => setShowSell(false)}
          onSell={handleSellMultiple}
        />
      )}
      
      {showLuck && (
        <LuckSystem
          playerData={playerData}
          onClose={() => setShowLuck(false)}
          onLevelUp={handleLuckLevelUp}
          onDistribute={handleLuckDistribute}
        />
      )}
    </div>
  );
};

export default BeetleGame;