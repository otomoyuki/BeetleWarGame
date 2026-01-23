// client/src/utils/canvasDrawing.js

import { beetleTypes } from './beetleData';
import { BEETLE_STATES } from './constants';

// 画像キャッシュ
const beetleImages = {};
const backgroundImages = {
  treeBark: null,
  nectarPool: null,
};

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
 * 背景画像を読み込む
 */
const loadBackgroundImage = (key, imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      backgroundImages[key] = img;
      console.log(`✅ 背景画像読み込み成功: ${key}`);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`⚠️ 背景画像読み込み失敗: ${key} (${imagePath})`);
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
  const beetlePromises = types.map(type => 
    loadBeetleImage(type, `/images/beetles/${type}.png`)
  );
  
  // 背景画像も読み込む
  const backgroundPromises = [
    loadBackgroundImage('treeBark', '/images/tree-bark.jpg'),
    loadBackgroundImage('nectarPool', '/images/nectar-pool.png'),
  ];
  
  try {
    await Promise.allSettled([...beetlePromises, ...backgroundPromises]);
    console.log('✅ 全画像の読み込み完了');
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
    
    // 円形の半透明背景を描画（白）
    ctx.fillStyle = 'rgba(185, 195, 185, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, drawSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // 影を追加（白い縁取り）
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.drawImage(
      image,
      -drawSize,
      -drawSize,
      drawSize * 2,
      drawSize * 2
    );
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
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
  // 背景：木の樹皮を描画
  if (backgroundImages.treeBark) {
    ctx.drawImage(backgroundImages.treeBark, 0, 0, width, height);
  } else {
    // 画像がない場合は緑の背景
    console.warn('⚠️ 木の樹皮画像が読み込まれていません');
    ctx.fillStyle = '#8a8';
    ctx.fillRect(0, 0, width, height);
  }

  // 中央ライン
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 蜜溜まり位置
  const nectar1X = width * 0.3;
  const nectar1Y = height / 2;
  const nectar2X = width * 0.7;
  const nectar2Y = height / 2;
  const nectarImageSize = 120; // 蜜玉画像のサイズ
  const nectarRadius = 60; // 判定用の半径

  // 蜜玉画像を描画
  if (backgroundImages.nectarPool) {
    ctx.drawImage(
      backgroundImages.nectarPool,
      nectar1X - nectarImageSize / 2,
      nectar1Y - nectarImageSize / 2,
      nectarImageSize,
      nectarImageSize
    );
    ctx.drawImage(
      backgroundImages.nectarPool,
      nectar2X - nectarImageSize / 2,
      nectar2Y - nectarImageSize / 2,
      nectarImageSize,
      nectarImageSize
    );
  } else {
    // 画像がない場合は円で表示
    console.warn('⚠️ 蜜玉画像が読み込まれていません');
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
  }

  // 樹液残量表示
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(`蜜:${state.nectarPool1}`, nectar1X, nectar1Y + 5);
  ctx.fillText(`蜜:${state.nectarPool1}`, nectar1X, nectar1Y + 5);
  ctx.strokeText(`蜜:${state.nectarPool2}`, nectar2X, nectar2Y + 5);
  ctx.fillText(`蜜:${state.nectarPool2}`, nectar2X, nectar2Y + 5);

  // ゴールエリア
  const redGoalY = height - 50;
  const blueGoalY = 50;
  const goalWidth = 200;

  ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
  ctx.fillRect(width / 2 - goalWidth / 2, redGoalY - 30, goalWidth, 60);
  ctx.fillStyle = 'rgba(100, 100, 255, 0.3)';
  ctx.fillRect(width / 2 - goalWidth / 2, blueGoalY - 30, goalWidth, 60);

  ctx.strokeStyle = '#ff6666';
  ctx.lineWidth = 3;
  ctx.strokeRect(width / 2 - goalWidth / 2, redGoalY - 30, goalWidth, 60);
  ctx.strokeStyle = '#6666ff';
  ctx.strokeRect(width / 2 - goalWidth / 2, blueGoalY - 30, goalWidth, 60);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText('🏠 赤ゴール', width / 2, redGoalY + 5);
  ctx.fillText('🏠 赤ゴール', width / 2, redGoalY + 5);
  ctx.strokeText('🏠 敵ゴール', width / 2, blueGoalY + 5);
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