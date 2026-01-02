// BeetleWarGame/client/src/components/SpinnerBattle/SpinnerBattle.jsx
import { useState, useEffect } from 'react';

// 独楽データ（実際の画像パスを設定）
const SPINNERS = {
  python: { 
    name: 'Python独楽', 
    color: '#3776AB', 
    attack: 85, 
    speed: 75,
    description: '青龍の力を宿す独楽',
    image: '/images/blue.png'
  },
  rust: { 
    name: 'Rust独楽', 
    color: '#CE422B', 
    attack: 95, 
    speed: 70,
    description: '赤龍の力を宿す独楽',
    image: '/images/red.png'
  },
  javascript: { 
    name: 'JavaScript独楽', 
    color: '#F7DF1E', 
    attack: 80, 
    speed: 90,
    description: '金色の高速独楽',
    image: '/images/gold.png'
  },
  casual: { 
    name: 'カジュアル独楽', 
    color: '#4CAF50', 
    attack: 70, 
    speed: 85,
    description: '緑の万能独楽',
    image: '/images/green2.png'
  }
};

// 問題データ
const QUESTIONS = [
  {
    question: 'JavaScriptで配列の最後の要素を取得する方法は？',
    options: ['arr[arr.length - 1]', 'arr.getLast()', 'arr.last()', 'arr[-1]'],
    correct: 0
  },
  {
    question: 'Pythonでリストの要素数を取得する関数は？',
    options: ['size()', 'length()', 'len()', 'count()'],
    correct: 2
  },
  {
    question: 'Rustの所有権システムの目的は？',
    options: ['速度向上', 'メモリ安全性', 'コード短縮', '並列処理'],
    correct: 1
  },
  {
    question: 'CSSのflexboxで子要素を中央揃えにするプロパティは？',
    options: ['align-items: center', 'text-align: center', 'vertical-align: middle', 'position: center'],
    correct: 0
  }
];

export default function SpinnerBattle() {
  const [phase, setPhase] = useState('select');
  const [selectedSpinner, setSelectedSpinner] = useState(null);
  const [enemySpinner, setEnemySpinner] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [battleResult, setBattleResult] = useState(null);
  const [showClash, setShowClash] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (selectedSpinner && !enemySpinner) {
      const spinnerKeys = Object.keys(SPINNERS);
      const randomKey = spinnerKeys[Math.floor(Math.random() * spinnerKeys.length)];
      setEnemySpinner(randomKey);
    }
  }, [selectedSpinner, enemySpinner]);

  const handleSelectSpinner = (type) => {
    setSelectedSpinner(type);
    setPhase('question');
  };

  const handleAnswer = (optionIndex) => {
    const question = QUESTIONS[currentQuestion];
    const isCorrect = optionIndex === question.correct;
    
    setPhase('ready');
    
    setTimeout(() => {
      setPhase('clash');
      setShowClash(true);
      
      setTimeout(() => {
        setShowClash(false);
        
        if (isCorrect) {
          const damage = SPINNERS[selectedSpinner].attack;
          const newEnemyHP = Math.max(0, enemyHP - damage);
          setEnemyHP(newEnemyHP);
          setScore(prev => prev + 100);
          
          if (newEnemyHP <= 0) {
            setBattleResult('victory');
            setPhase('result');
          } else if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setPhase('question');
          } else {
            setBattleResult('victory');
            setPhase('result');
          }
        } else {
          const damage = SPINNERS[enemySpinner].attack;
          const newPlayerHP = Math.max(0, playerHP - damage);
          setPlayerHP(newPlayerHP);
          
          if (newPlayerHP <= 0) {
            setBattleResult('defeat');
            setPhase('result');
          } else if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setPhase('question');
          } else {
            setBattleResult('defeat');
            setPhase('result');
          }
        }
      }, 2000);
    }, 1000);
  };

  const handleReset = () => {
    setPhase('select');
    setSelectedSpinner(null);
    setEnemySpinner(null);
    setCurrentQuestion(0);
    setPlayerHP(100);
    setEnemyHP(100);
    setBattleResult(null);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2 animate-pulse">
            🌀 独楽戦場 🌀
          </h1>
          <p className="text-2xl text-gray-300 font-semibold tracking-wide">
            Spinning Top Battle Arena
          </p>
          {score > 0 && (
            <div className="mt-4 text-3xl font-bold text-yellow-400">
              スコア: {score}
            </div>
          )}
        </div>

        {/* 独楽選択 */}
        {phase === 'select' && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-center text-white mb-10">
              独楽を選択してください
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(SPINNERS).map(([key, spinner]) => (
                <button
                  key={key}
                  onClick={() => handleSelectSpinner(key)}
                  className="group relative bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-2xl p-8 transition-all duration-300 hover:scale-110 hover:shadow-2xl border-2 border-transparent hover:border-yellow-400"
                >
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={spinner.image} 
                      alt={spinner.name}
                      className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        console.error(`画像読み込みエラー: ${spinner.image}`);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="text-6xl">${spinner.color === '#3776AB' ? '🔵' : spinner.color === '#CE422B' ? '🔴' : spinner.color === '#F7DF1E' ? '🟡' : '🟢'}</div>`;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{spinner.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{spinner.description}</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>⚔️ 攻撃力:</span>
                      <span className="font-bold text-red-400">{spinner.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ 速度:</span>
                      <span className="font-bold text-blue-400">{spinner.speed}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* バトル画面 */}
        {phase !== 'select' && selectedSpinner && enemySpinner && (
          <div className="space-y-6">
            
            {/* HPバー */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/50">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">あなたの独楽</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src={SPINNERS[selectedSpinner].image}
                    alt={SPINNERS[selectedSpinner].name}
                    className={`w-40 h-40 object-contain drop-shadow-2xl ${phase === 'clash' ? 'animate-spin-slow' : ''}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="text-8xl">🔵</div>';
                    }}
                  />
                </div>
                <div className="text-lg text-white mb-3 text-center font-semibold">
                  {SPINNERS[selectedSpinner].name}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-cyan-500 h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    style={{ width: `${playerHP}%` }}
                  >
                    HP: {playerHP}%
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
                <h3 className="text-2xl font-bold text-red-400 mb-4">敵の独楽</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src={SPINNERS[enemySpinner].image}
                    alt={SPINNERS[enemySpinner].name}
                    className={`w-40 h-40 object-contain drop-shadow-2xl ${phase === 'clash' ? 'animate-spin-slow' : ''}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="text-8xl">🔴</div>';
                    }}
                  />
                </div>
                <div className="text-lg text-white mb-3 text-center font-semibold">
                  {SPINNERS[enemySpinner].name}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    style={{ width: `${enemyHP}%` }}
                  >
                    HP: {enemyHP}%
                  </div>
                </div>
              </div>
            </div>

            {/* 準備フェーズ */}
            {phase === 'ready' && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-16 text-center border-2 border-yellow-500/50">
                <div className="flex justify-center gap-8 mb-8">
                  <img src={SPINNERS[selectedSpinner].image} alt="player" className="w-32 h-32 object-contain animate-bounce" />
                  <div className="text-6xl flex items-center">⚡</div>
                  <img src={SPINNERS[enemySpinner].image} alt="enemy" className="w-32 h-32 object-contain animate-bounce" />
                </div>
                <h2 className="text-5xl font-bold text-yellow-400 animate-pulse">
                  独楽を投げる準備！
                </h2>
              </div>
            )}

            {/* 衝突フェーズ */}
            {phase === 'clash' && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-16 text-center relative overflow-hidden border-2 border-orange-500/50">
                {/* バトルシーン画像 */}
                <div className="relative mb-8">
                  <img 
                    src="/images/two.png" 
                    alt="Battle Scene"
                    className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {showClash && (
                    <div className="absolute inset-0 bg-white/30 rounded-2xl animate-pulse" />
                  )}
                </div>
                
                <h2 className="text-5xl font-bold text-red-500 animate-pulse">
                  激突！！！
                </h2>
                
                {showClash && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400 rounded-full opacity-20 animate-ping" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500 rounded-full opacity-30 animate-pulse" />
                  </>
                )}
              </div>
            )}

            {/* 問題フェーズ */}
            {phase === 'question' && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-10 border-2 border-purple-500/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">
                    問題 {currentQuestion + 1} / {QUESTIONS.length}
                  </h2>
                  <div className="text-xl text-yellow-400 font-bold">
                    ⏱️ 制限時間なし
                  </div>
                </div>
                <p className="text-2xl text-gray-200 mb-10 text-center font-semibold leading-relaxed">
                  {QUESTIONS[currentQuestion].question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {QUESTIONS[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-purple-600 hover:to-pink-600 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-yellow-400"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 結果フェーズ */}
            {phase === 'result' && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-16 text-center border-2 border-yellow-500">
                {battleResult === 'victory' ? (
                  <>
                    <div className="mb-8 flex justify-center">
                      <img 
                        src={SPINNERS[selectedSpinner].image}
                        alt="Victory"
                        className="w-64 h-64 object-contain drop-shadow-2xl animate-bounce"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-9xl">🎉</div>';
                        }}
                      />
                    </div>
                    <h2 className="text-6xl font-bold text-yellow-400 mb-6">
                      🎉 勝利！ 🎉
                    </h2>
                    <p className="text-3xl text-gray-300 mb-4">
                      相手の独楽を弾き飛ばした！
                    </p>
                    <p className="text-2xl text-yellow-400 mb-10">
                      獲得スコア: {score}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-8 flex justify-center opacity-50">
                      <img 
                        src={SPINNERS[selectedSpinner].image}
                        alt="Defeat"
                        className="w-64 h-64 object-contain drop-shadow-2xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-9xl">💔</div>';
                        }}
                      />
                    </div>
                    <h2 className="text-6xl font-bold text-red-500 mb-6">
                      💔 敗北... 💔
                    </h2>
                    <p className="text-3xl text-gray-300 mb-4">
                      独楽が弾き飛ばされた...
                    </p>
                    <p className="text-2xl text-gray-400 mb-10">
                      獲得スコア: {score}
                    </p>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-5 px-16 rounded-2xl text-2xl font-bold transition-all duration-300 hover:scale-110 shadow-2xl"
                >
                  もう一度挑戦
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}