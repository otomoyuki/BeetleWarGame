// client/src/utils/canvasDrawing.js

import { beetleTypes } from './beetleData';
import { BEETLE_STATES } from './constants';

// 画像キャッシュ
const beetleImages = {};

/**
 * 甲虫画像を読み込む
 */
export const loadBeetleImage = (type, imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      beetleImages[type] = img;
      console.log(`✅ 画像読み込み成功: ${type}`);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`⚠️ 画像読み込み失敗: ${type} (${imagePath})`);
      reject();
    };
    img.src = imagePath;
  });
};

/**
 * 全甲虫の画像を一括読み込み
 */
export const loadAllBeetleImages = async () => {
  const types = Object.keys(beetleTypes);
  const promises = types.map(type => 
    loadBeetleImage(type, `/images/beetles/${type}.png`)
  );
  
  try {
    await Promise.allSettled(promises);
    console.log('✅ 甲虫画像の読み込み完了');
  } catch (error) {
    console.warn('⚠️ 一部の画像読み込みに失敗しました');
  }
};

/**
 * 甲虫を回転させて描画
 */
const drawBeetleWithRotation = (ctx, beetle, size) => {
  const bType = beetleTypes[beetle.type];
  const image = beetleImages[beetle.type];
  
  ctx.save();
  
  // 甲虫の位置に移動
  ctx.translate(beetle.x, beetle.y);
  
  // 角度を適用（beetle.angle がラジアン）
  if (beetle.angle !== undefined) {
    ctx.rotate(beetle.angle);
  }
  
  if (image) {
    // imageScale を適用（デフォルト1.0）
    const scale = bType.imageScale || 1.0;
    const drawSize = size * scale;
    
    ctx.drawImage(
      image,
      -drawSize,
      -drawSize,
      drawSize * 2,
      drawSize * 2
    );
  } else {
    // 画像がない場合は円＋矢印
    ctx.fillStyle = bType.color;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 方向を示す矢印
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size * 0.5, size * 0.3);
    ctx.lineTo(size * 0.5, -size * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
};

/**
 * ゲーム全体を描画
 */
export const drawGame = (ctx, state, selectedBeetle, width, height) => {
  // 背景をクリア
  ctx.fillStyle = '#8a8';
  ctx.fillRect(0, 0, width, height);

  // 中央ライン
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 樹液エリア（2箇所）
  const nectar1X = width * 0.3;
  const nectar1Y = height / 2;
  const nectar2X = width * 0.7;
  const nectar2Y = height / 2;
  const nectarRadius = 40;

  ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(nectar1X, nectar1Y, nectarRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(nectar2X, nectar2Y, nectarRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 200, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(nectar1X, nectar1Y, nectarRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(nectar2X, nectar2Y, nectarRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 樹液残量表示
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`蜜:${state.nectarPool1}`, nectar1X, nectar1Y + 5);
  ctx.fillText(`蜜:${state.nectarPool2}`, nectar2X, nectar2Y + 5);

  // ゴールエリア
  const redGoalY = height - 50;
  const blueGoalY = 50;
  const goalWidth = 200;

  ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
  ctx.fillRect(width / 2 - goalWidth / 2, redGoalY - 30, goalWidth, 60);
  ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
  ctx.fillRect(width / 2 - goalWidth / 2, blueGoalY - 30, goalWidth, 60);

  ctx.strokeStyle = '#ff6666';
  ctx.lineWidth = 3;
  ctx.strokeRect(width / 2 - goalWidth / 2, redGoalY - 30, goalWidth, 60);
  ctx.strokeStyle = '#6666ff';
  ctx.strokeRect(width / 2 - goalWidth / 2, blueGoalY - 30, goalWidth, 60);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏠 赤ゴール', width / 2, redGoalY + 5);
  ctx.fillText('🏠 敵ゴール', width / 2, blueGoalY + 5);

  // 甲虫を描画（回転対応）
  state.beetles.forEach(beetle => {
    if (beetle.state === BEETLE_STATES.KNOCKOUT) return;

    const bType = beetleTypes[beetle.type];
    const size = bType.size;

    // 回転描画
    drawBeetleWithRotation(ctx, beetle, size);

    // HPバー
    if (beetle.hp < beetle.maxHp) {
      const barWidth = size * 2;
      const barHeight = 4;
      const barX = beetle.x - barWidth / 2;
      const barY = beetle.y - size - 10;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const hpPercent = beetle.hp / beetle.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.2 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }

    // 運搬中の表示
    if (beetle.carrying > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🍯${beetle.carrying}`, beetle.x, beetle.y + size + 15);
    }

    // 選択中の表示
    if (selectedBeetle === beetle.id) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(beetle.x, beetle.y, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};