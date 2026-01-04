// BeetleWarGame/client/src/App.jsx
import { useState } from 'react';
import BeetleGame from './components/Game/BeetleGame';
import SpinnerBattle from './components/SpinnerBattle/SpinnerBattle';

function App() {
  const [currentGame, setCurrentGame] = useState('home');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ゲーム選択画面（ホーム） */}
      {currentGame === 'home' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
          {/* ⬇️⬇️⬇️ 追加：SemanticFieldに戻るボタン ⬇️⬇️⬇️ */}
          <a
            href="https://semanticgrove.onrender.com/games"
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span className="text-xl">←</span>
            <span>SemanticFieldに戻る</span>
          </a>
          {/* ⬆️⬆️⬆️ 追加終わり ⬆️⬆️⬆️ */}

          <h1 className="text-6xl font-bold text-white mb-12">
            🎮 SemanticGrove ゲーム広場 🎮
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* 甲虫戦争 */}
            <button
              onClick={() => setCurrentGame('beetle')}
              className="bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white p-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
            >
              <div className="text-6xl mb-4">🐛</div>
              <h2 className="text-3xl font-bold mb-2">甲虫戦争</h2>
              <p className="text-lg">Beetle War Game</p>
            </button>

            {/* 独楽戦場 */}
            <button
              onClick={() => setCurrentGame('spinner')}
              className="bg-gradient-to-br from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white p-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
            >
              <div className="text-6xl mb-4">🌀</div>
              <h2 className="text-3xl font-bold mb-2">独楽戦場</h2>
              <p className="text-lg">Spinning Top Battle</p>
            </button>
          </div>
        </div>
      )}

      {/* 甲虫戦争 */}
      {currentGame === 'beetle' && (
        <div>
          <button
            onClick={() => setCurrentGame('home')}
            className="fixed top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg z-50"
          >
            ← ホームに戻る
          </button>
          <BeetleGame />
        </div>
      )}

      {/* 独楽戦場 */}
      {currentGame === 'spinner' && (
        <div>
          <button
            onClick={() => setCurrentGame('home')}
            className="fixed top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg z-50"
          >
            ← ホームに戻る
          </button>
          <SpinnerBattle />
        </div>
      )}
    </div>
  );
}

export default App;