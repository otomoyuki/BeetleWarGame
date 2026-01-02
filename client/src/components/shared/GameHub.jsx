// client/src/components/shared/GameHub.jsx

import React from 'react';

const GameHub = ({ onSelectGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
          🎮 SemanticField ゲーム広場
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 甲虫戦争 */}
          <button
            onClick={() => onSelectGame('beetle')}
            className="block w-full text-left"
          >
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border-2 border-green-400 hover:border-green-300 transition transform hover:scale-105 cursor-pointer">
              <div className="text-6xl mb-4 text-center">🪲</div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">甲虫戦争</h2>
              <p className="text-gray-300 mb-4">
                樹液を集めてゴールに運べ！<br/>
                17種類の甲虫でデッキを組み、<br/>
                3分間のリアルタイムバトル！
              </p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>⚔️ リアルタイム戦略</span>
                <span>💎 勝利 +10 SG</span>
              </div>
            </div>
          </button>

          {/* 独楽戦場 */}
          <button
            onClick={() => onSelectGame('spinner')}
            className="block w-full text-left"
          >
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-400 hover:border-purple-300 transition transform hover:scale-105 cursor-pointer relative">
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                NEW!
              </div>
              <div className="text-6xl mb-4 text-center">🌀</div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">独楽戦場</h2>
              <p className="text-gray-300 mb-4">
                プログラミング知識で独楽を回せ！<br/>
                正解するほど強力な攻撃が繰り出される！<br/>
                💻 or 🎮 モード選択可能
              </p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>💡 学習バトル</span>
                <span>💎 勝利 +50 SG</span>
              </div>
            </div>
          </button>

          {/* 凧あげ（Coming Soon） */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-600 opacity-60 cursor-not-allowed relative">
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Coming Soon
            </div>
            <div className="text-6xl mb-4 text-center">🪁</div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">凧あげ競争</h2>
            <p className="text-gray-300 mb-4">
              問題に正解して凧を上昇させよう！<br/>
              最高記録を目指してランキング上位を狙え。
            </p>
            <div className="flex justify-between text-sm text-gray-400">
              <span>📈 記録挑戦</span>
              <span>🏆 ランキング</span>
            </div>
          </div>

          {/* 甲虫綱引き（Coming Soon） */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-600 opacity-60 cursor-not-allowed relative">
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Coming Soon
            </div>
            <div className="text-6xl mb-4 text-center">🪢</div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">甲虫綱引き</h2>
            <p className="text-gray-300 mb-4">
              自分の甲虫10体 vs CPU 10体！<br/>
              プログラミング問題正解で士気UP！
            </p>
            <div className="flex justify-between text-sm text-gray-400">
              <span>🪲 甲虫連携</span>
              <span>💪 チーム戦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;