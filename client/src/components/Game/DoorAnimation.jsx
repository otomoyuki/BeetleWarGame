// client/src/components/Game/DoorAnimation.jsx
// 修正版（アニメーションが正しく動くように）

import React, { useState, useEffect } from 'react';

const DoorAnimation = ({ phase, onAnimationComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showStartText, setShowStartText] = useState(false);
  const [textScale, setTextScale] = useState(0.5);
  const [textOpacity, setTextOpacity] = useState(0);

  const totalFrames = 6; // frame-0 ~ frame-5

  useEffect(() => {
    if (phase === 'opening') {
      console.log('🚪 扉を開きます...');
      let frame = 0;
      setCurrentFrame(0); // ← 最初のフレームから開始
      
      const frameDuration = 2000 / totalFrames; // 約333ms/フレーム
      
      const frameInterval = setInterval(() => {
        frame++;
        setCurrentFrame(frame);
        console.log(`🚪 フレーム ${frame}/${totalFrames}`);
        
        if (frame >= totalFrames - 1) {
          clearInterval(frameInterval);
          console.log('🚪 扉が開ききりました');
          // 開き終わったら「ゲームスタート！」を表示
          setTimeout(() => {
            setShowStartText(true);
          }, 100);
        }
      }, frameDuration);

      return () => clearInterval(frameInterval);
      
    } else if (phase === 'closing') {
      console.log('🚪 扉を閉じます...');
      let frame = totalFrames - 1;
      setCurrentFrame(totalFrames - 1);
      
      const frameInterval = setInterval(() => {
        frame--;
        console.log(`🚪 フレーム ${frame}/${totalFrames}`);
        
        if (frame < 0) {
          clearInterval(frameInterval);
          setCurrentFrame(0);
          console.log('🚪 扉が閉じました');
          // 閉じ終わったら完了通知
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        } else {
          setCurrentFrame(frame);
        }
      }, 2000 / totalFrames);

      return () => clearInterval(frameInterval);
    }
  }, [phase, onAnimationComplete]);

  // 「ゲームスタート！」テキストアニメーション
  useEffect(() => {
    if (showStartText) {
      console.log('✨ ゲームスタート演出開始');
      let progress = 0;
      const duration = 1000; // 1秒
      const fps = 20;
      const interval = 1000 / fps; // 50ms
      
      const textInterval = setInterval(() => {
        progress += interval;
        const t = progress / duration; // 0〜1
        
        if (t <= 0.5) {
          // 0.0～0.5秒: 拡大しながらフェードイン
          setTextScale(0.5 + t * 3); // 0.5 → 2.0
          setTextOpacity(t * 2); // 0 → 1
        } else {
          // 0.5～1.0秒: さらに拡大しながらフェードアウト
          setTextScale(2.0 + (t - 0.5) * 4); // 2.0 → 4.0
          setTextOpacity(2 - t * 2); // 1 → 0
        }

        if (progress >= duration) {
          clearInterval(textInterval);
          setShowStartText(false);
          console.log('✨ ゲームスタート演出完了 → ゲーム開始');
          // アニメーション完了、ゲーム開始
          setTimeout(() => {
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, 100);
        }
      }, interval);

      return () => clearInterval(textInterval);
    }
  }, [showStartText, onAnimationComplete]);

  // 待機画面（クリックで開始）
  if (phase === 'waiting') {
    return (
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={onAnimationComplete}
      >
        <img 
          src="/images/door-animation/frame-0.png" 
          alt="閉じた扉" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white bg-black bg-opacity-50 px-8 py-4 rounded-lg animate-pulse">
              クリックでスタート
            </div>
            <p className="text-white text-sm mt-4 bg-black bg-opacity-30 px-4 py-2 rounded">
              💡 ゲーム中はESCキーで一時停止できます
            </p>
          </div>
        </div>
      </div>
    );
  }

  // リザルト画面
  if (phase === 'result') {
    return (
      <div className="relative w-full h-full">
        <img 
          src="/images/door-animation/frame-0.png" 
          alt="閉じた扉" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 開く・閉じるアニメーション中
  return (
    <div className="relative w-full h-full">
      <img 
        src={`/images/door-animation/frame-${currentFrame}.png`}
        alt={`扉フレーム${currentFrame}`}
        className="w-full h-full object-cover"
      />
      
      {showStartText && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
          }}
        >
          <div className="text-6xl font-bold text-amber-400 tracking-widest">
            ゲームスタート！
          </div>
        </div>
      )}
    </div>
  );
};

export default DoorAnimation;