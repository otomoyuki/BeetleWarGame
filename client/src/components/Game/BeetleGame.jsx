// client/src/components/Game/BeetleGame.jsx

import React, { useState, useEffect, useRef } from 'react';
import ScoreBoard from './ScoreBoard';
import GameCanvas from './GameCanvas';
import PlayerStats from './PlayerStats';
import UpgradeShop from './UpgradeShop';
import DeckEditor from './DeckEditor';
import GachaSystem from './GachaSystem';
import SellShop from './SellShop';
import LuckSystem from './LuckSystem';
import DoorAnimation from './DoorAnimation';
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
  updateBeetleAngle
} from '../../utils/gameLogic';
import { drawGame, loadAllBeetleImages } from '../../utils/canvasDrawing';
import { getBeetleStats } from '../../utils/beetleData';
import { 
  loadPlayerData, 
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
  getSGReward,
  DIFFICULTY_MODES,
  GAME_SPEED_OPTIONS
} from '../../utils/constants';

const BeetleGame = () => {
  const canvasRef = useRef(null);
  
  // ゲームフェーズ管理
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting' | 'opening' | 'playing' | 'closing' | 'result'
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // ← 一時停止状態
  
  const [redNectar, setRedNectar] = useState(0);
  const [blueNectar, setBlueNectar] = useState(0);
  const [winner, setWinner] = useState(null);
  const [selectedBeetle, setSelectedBeetle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_TIME);
  const gameStateRef = useRef(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const [playerData, setPlayerData] = useState(loadPlayerData());
  const [showShop, setShowShop] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [showLuck, setShowLuck] = useState(false);
  
  const [difficulty, setDifficulty] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(1.0); // ゲームスピード
  
  const gameStatsRef = useRef({
    nectarDelivered: 0,
    enemiesDefeated: 0,
  });

  useEffect(() => {
    console.log('🎨 画像読み込み開始...');
    loadAllBeetleImages();
  }, []);

  // ESCキーで一時停止
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gamePhase === 'playing' && (e.key === 'Escape' || e.key === ' ')) {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gamePhase]);

  // ゲーム初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Canvas サイズを確認
    console.log('🎮 Canvas サイズ:', canvas.width, 'x', canvas.height);
    
    gameStateRef.current = createInitialGameState(
      canvas.width, 
      canvas.height, 
      playerData.deck,
      playerData.beetleUpgrades,
      difficulty
    );

    setRedNectar(0);
    setBlueNectar(0);
    setWinner(null);
    setSelectedBeetle(null);
    setTimeLeft(GAME_CONFIG.GAME_TIME);
    gameStatsRef.current = { nectarDelivered: 0, enemiesDefeated: 0 };
  }, [resetTrigger, playerData.beetleUpgrades, playerData.deck, difficulty]);

  // gamePhase が 'playing' になった時に Canvas を強制再描画
  useEffect(() => {
    if (gamePhase === 'playing' && canvasRef.current) {
      console.log('🎮 ゲームフェーズ変更 → playing');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // ゲーム状態がなければ初期化
      if (!gameStateRef.current) {
        console.log('⚠️ ゲーム状態がないため初期化します');
        gameStateRef.current = createInitialGameState(
          canvas.width,
          canvas.height,
          playerData.deck,
          playerData.beetleUpgrades,
          difficulty
        );
      }
      
      // 即座に1回描画
      drawGame(ctx, gameStateRef.current, selectedBeetle, canvas.width, canvas.height);
      console.log('✅ 初回描画完了');
      
      // 念のため 100ms 後にもう一度描画
      setTimeout(() => {
        if (canvasRef.current && gameStateRef.current) {
          drawGame(ctx, gameStateRef.current, selectedBeetle, canvas.width, canvas.height);
          console.log('✅ 2回目描画完了');
        }
      }, 100);
    }
  }, [gamePhase, playerData.deck, playerData.beetleUpgrades, difficulty]);

  // タイマー管理（スピード適用）
  useEffect(() => {
    if (!isRunning || winner || gamePhase !== 'playing' || isPaused) return; // ← isPaused追加

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間切れ：勝敗判定
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
    }, 1000 / gameSpeed); // スピード倍率を適用

    return () => clearInterval(timerInterval);
  }, [isRunning, winner, redNectar, blueNectar, gamePhase, gameSpeed, isPaused]); // ← isPaused追加

  // 勝敗確定時の処理
  useEffect(() => {
    if (!winner || !gameStateRef.current) return;
    
    setIsRunning(false);
    
    const result = winner === 'red' ? 'win' : winner === 'blue' ? 'lose' : 'draw';
    const sgReward = getSGReward(difficulty, result);
    
    const newPlayerData = { ...playerData };
    addSG(newPlayerData, sgReward);
    
    // LUP付与
    const redBeetles = gameStateRef.current.beetles.filter(b => b.team === 'red');
    if (redBeetles.length > 0) {
      redBeetles.forEach(beetle => {
        const mode = DIFFICULTY_MODES.find(m => m.id === difficulty) || DIFFICULTY_MODES[0];
        const lupMultiplier = mode.lupMultiplier || 1.0;

        const nectarLUP = Math.floor((gameStatsRef.current.nectarDelivered / redBeetles.length) * LUP_REWARDS.NECTAR_DELIVERED * lupMultiplier);
        const defeatedLUP = Math.floor((gameStatsRef.current.enemiesDefeated / redBeetles.length) * LUP_REWARDS.ENEMY_DEFEATED * lupMultiplier);
        if (nectarLUP > 0 || defeatedLUP > 0) {
          addLUP(newPlayerData, nectarLUP + defeatedLUP);
        }
      });
    }
    
    updateGameStats(newPlayerData, result);
    setPlayerData(newPlayerData);
    
    // 扉を閉じる演出
    setTimeout(() => {
      setGamePhase('closing');
    }, 1000);
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

      if (isRunning && !winner && gamePhase === 'playing' && !isPaused) { // ← isPaused追加
        // 甲虫の更新（スピード適用）
        state.beetles.forEach(beetle => {
          const stats = getBeetleStats(beetle.type, beetle.upgrades, beetle.level);
          
          // スピード倍率を甲虫に適用
          const effectiveSpeed = beetle.speed * gameSpeed;

          if (beetle.state === BEETLE_STATES.KNOCKOUT) {
            handleKnockout(beetle, w, h);
            return;
          }

          recoverHP(beetle);

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
              const arrived = moveToTarget(beetle, beetle.target.x, beetle.target.y, gameSpeed);
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
              beetle.vx = (dx / dist) * effectiveSpeed;
              beetle.vy = (dy / dist) * effectiveSpeed;
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
              
              beetle.carrying = 0;
              beetle.state = BEETLE_STATES.IDLE;
            } else {
              beetle.vx = (goalDx / goalDist) * effectiveSpeed;
              beetle.vy = (goalDy / goalDist) * effectiveSpeed;
            }
          }

          if (beetle.state !== BEETLE_STATES.KNOCKOUT) {
            const nectarPositions = { nectar1X, nectar1Y, nectar2X, nectar2Y };
            const combatResult = handleCombat(
              beetle, 
              state.beetles, 
              state, 
              nectarPositions,
              playerData.beetleUpgrades
            );
            
            if (combatResult.defeatedEnemies && combatResult.defeatedEnemies.length > 0 && beetle.team === 'red') {
              gameStatsRef.current.enemiesDefeated += combatResult.defeatedEnemies.length;
            }
            
            preventOverlap(beetle, state.beetles);
          }

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
  }, [isRunning, winner, selectedBeetle, resetTrigger, playerData.beetleUpgrades, difficulty, gamePhase, gameSpeed, isPaused]); // ← isPaused追加

  // キャンバスクリック処理
  const handleCanvasClick = (e) => {
    if (!isRunning || !gameStateRef.current || gamePhase !== 'playing') return;
    
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

  // 扉アニメーション完了時の処理
  const handleDoorAnimationComplete = () => {
    console.log('🚪 扉アニメーション完了:', gamePhase);
    
    if (gamePhase === 'waiting') {
      // スピード料金を消費
      const speedOption = GAME_SPEED_OPTIONS.find(s => s.speed === gameSpeed);
      if (speedOption && speedOption.cost > 0) {
        if (playerData.sg >= speedOption.cost) {
          const newPlayerData = { ...playerData };
          newPlayerData.sg -= speedOption.cost;
          setPlayerData(newPlayerData);
        } else {
          alert('SGが足りません！通常速度でプレイします。');
          setGameSpeed(1.0);
        }
      }
      setGamePhase('opening');
      console.log('🚪 フェーズ変更: waiting → opening');
    } else if (gamePhase === 'opening') {
      setGamePhase('playing');
      setIsRunning(true);
      console.log('🎮 ゲーム開始: opening → playing');
    } else if (gamePhase === 'closing') {
      setGamePhase('result');
      console.log('📊 リザルト表示: closing → result');
    }
  };

  // リセット処理
  const handleReturnToTitle = () => {
    setIsRunning(false);
    setWinner(null);
    setRedNectar(0);
    setBlueNectar(0);
    setTimeLeft(GAME_CONFIG.GAME_TIME);
    setSelectedBeetle(null);
    gameStatsRef.current = { nectarDelivered: 0, enemiesDefeated: 0 };
    
    // ゲーム状態を完全にリセット
    if (canvasRef.current) {
      gameStateRef.current = createInitialGameState(
        canvasRef.current.width,
        canvasRef.current.height,
        playerData.deck,
        playerData.beetleUpgrades,
        difficulty
      );
    }
    
    setGamePhase('waiting');
    setResetTrigger(prev => prev + 1);
  };

  // 強化処理
  const handleUpgrade = (beetleId, stat) => {
    const newPlayerData = { ...playerData };
    const result = upgradeBeetle(newPlayerData, beetleId, stat);
    if (result) {
      setPlayerData(newPlayerData);
    }
  };

  // レベルアップ処理
  const handleLevelUp = (beetleId) => {
    const newPlayerData = { ...playerData };
    const result = levelUpBeetle(newPlayerData, beetleId);
    if (result) {
      setPlayerData(newPlayerData);
    }
  };

  // デッキ保存
  const handleSaveDeck = (newDeckIds) => {
    if (gamePhase === 'playing') {
      alert('ゲーム中はデッキを変更できません！');
      return;
    }
    
    const newPlayerData = { ...playerData };
    updateDeck(newPlayerData, newDeckIds);
    setPlayerData(newPlayerData);
    setResetTrigger(prev => prev + 1);
  };

  // コスト拡張
  const handleExpandCost = (cost) => {
    const newPlayerData = { ...playerData };
    const result = expandCost(newPlayerData);
    if (result) {
      setPlayerData(result);
    }
  };

  // 難易度変更
  const handleDifficultyChange = (newDifficulty) => {
    if (gamePhase !== 'playing') {
      setDifficulty(newDifficulty);
    }
  };

  // ゲームスピード変更
  const handleGameSpeedChange = (newSpeed) => {
    if (gamePhase !== 'playing') {
      setGameSpeed(newSpeed);
    }
  };

  // ガチャ実行
  const handleGachaPull = (results, pullCount) => {
    const newPlayerData = { ...playerData };
    
    const cost = pullCount === 1 ? 500 : 5000;
    newPlayerData.sg -= cost;
    
    results.forEach(result => {
      addBeetleFromGacha(newPlayerData, result.type);
    });
    
    updateGachaStats(newPlayerData, pullCount, results.map(r => r.type));
    
    const hasRarity5Plus = results.some(r => r.tier >= 5);
    if (hasRarity5Plus) {
      resetPityCounter(newPlayerData);
    }
    
    setPlayerData(newPlayerData);
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

  // 売却処理
  const handleSellMultiple = (beetleIds) => {
    const totalSG = beetleIds.length * 100;
    const newPlayerData = { ...playerData };
    const result = sellBeetles(newPlayerData, beetleIds);
    
    if (result) {
      setPlayerData(result);
      alert(`${beetleIds.length}体を売却し、${totalSG.toLocaleString()} SG 獲得しました！`);
    }
  };

  // 運レベルアップ
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

  // 運ポイント配分
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

        {/* 上部エリア（高さ固定） */}
        <div style={{ minHeight: '220px' }}>
          {/* 待機画面とリザルト画面でのみPlayerStatsを表示 */}
          {(gamePhase === 'waiting' || gamePhase === 'result') && (
            <PlayerStats 
              sg={playerData.sg}
              costExpansions={playerData.costExpansions || 0}
              difficulty={difficulty}
              luck={playerData.luck}
              gameSpeed={gameSpeed}
              onDifficultyChange={handleDifficultyChange}
              onGameSpeedChange={handleGameSpeedChange}
              onOpenShop={() => setShowShop(true)}
              onOpenDeck={() => setShowDeck(true)}
              onOpenGacha={() => setShowGacha(true)}
              onOpenSell={() => setShowSell(true)}
              onOpenLuck={() => setShowLuck(true)}
              gameStarted={gamePhase === 'playing'}
            />
          )}

          {/* ゲーム中はScoreBoardのみ表示 */}
          {gamePhase === 'playing' && (
            <ScoreBoard 
              redNectar={redNectar} 
              blueNectar={blueNectar} 
              timeLeft={timeLeft}
              isPaused={isPaused}                        // ← 追加
              onTogglePause={() => setIsPaused(!isPaused)} // ← 追加    
            />
          )}
        </div>

        {/* 扉アニメーション or ゲーム画面 */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden mx-auto" style={{ width: '900px', height: '700px' }}>
          {(gamePhase === 'waiting' || gamePhase === 'opening' || gamePhase === 'closing') && (
            <DoorAnimation 
              phase={gamePhase} 
              onAnimationComplete={handleDoorAnimationComplete}
            />
          )}
          
          {gamePhase === 'playing' && (
            <div className="w-full h-full">
              <GameCanvas 
                canvasRef={canvasRef}
                onClick={handleCanvasClick}
                selectedBeetle={selectedBeetle}
                winner={winner}
              />
              
              {/* 一時停止画面 */}
              {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                  <div className="text-center bg-gray-800 p-8 rounded-lg border-4 border-amber-500">
                    <h2 className="text-4xl font-bold mb-6 text-amber-400">⏸️ 一時停止</h2>
                    <div className="space-y-4">
                      <button
                        onClick={() => setIsPaused(false)}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xl"
                      >
                        ▶️ 再開
                      </button>
                      <button
                        onClick={handleReturnToTitle}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                      >
                        🏠 タイトルに戻る
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">ESC または スペースキーでも再開できます</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {gamePhase === 'result' && (
            <div className="absolute inset-0">
              <DoorAnimation phase="result" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                <div className="text-center bg-gray-800 p-8 rounded-lg">
                  <h2 className="text-4xl font-bold mb-4 text-amber-400">
                    {winner === 'red' ? '🎉 勝利！' : winner === 'blue' ? '💀 敗北' : '🤝 引き分け'}
                  </h2>
                  <div className="text-2xl text-white mb-6">
                    <p>獲得SG: {getSGReward(difficulty, winner === 'red' ? 'win' : winner === 'blue' ? 'lose' : 'draw')}</p>
                  </div>
                  <button
                    onClick={handleReturnToTitle}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg"
                  >
                    タイトルに戻る
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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