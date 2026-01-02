// BeetleWarGame/server/routes/sg-points.js
// SemanticGroveのSGポイント管理API

import { Router } from 'express';
import pool from '../db/semanticgrove-db.js';

const router = Router();

/**
 * SGポイント残高取得
 * GET /api/sg/balance/:userId
 */
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT sg_points FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      balance: result.rows[0].sg_points,
      userId: parseInt(userId)
    });
    
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get SG balance' 
    });
  }
});

/**
 * SGポイント付与
 * POST /api/sg/add
 * Body: { userId, points, reason }
 */
router.post('/add', async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    // バリデーション
    if (!userId || !points || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, points, reason'
      });
    }
    
    if (points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Points must be positive'
      });
    }
    
    // トランザクション開始
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // usersテーブルのSGポイントを更新
      const updateResult = await client.query(
        'UPDATE users SET sg_points = sg_points + $1 WHERE id = $2 RETURNING sg_points',
        [points, userId]
      );
      
      if (updateResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // point_historyに履歴を記録
      await client.query(
        'INSERT INTO point_history (user_id, points, reason, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, points, reason]
      );
      
      await client.query('COMMIT');
      
      const newBalance = updateResult.rows[0].sg_points;
      
      console.log(`✅ ${userId} に ${points} SG を付与: ${reason}`);
      
      res.json({
        success: true,
        userId: parseInt(userId),
        pointsAdded: points,
        newBalance: newBalance,
        reason: reason
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to add SG points' 
    });
  }
});

/**
 * バトル勝利時のポイント付与（ゲーム専用）
 * POST /api/sg/battle-reward
 * Body: { userId, won, battleType }
 */
router.post('/battle-reward', async (req, res) => {
  try {
    const { userId, won, battleType = 'normal' } = req.body;
    
    if (!userId || won === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, won'
      });
    }
    
    // 勝利していない場合は何もしない
    if (!won) {
      return res.json({
        success: true,
        pointsEarned: 0,
        message: '次回頑張りましょう！'
      });
    }
    
    // バトルタイプ別のポイント設定
    const pointMap = {
      'normal': 10,      // 通常バトル
      'ranked': 20,      // ランクバトル
      'tournament': 50   // トーナメント
    };
    
    const points = pointMap[battleType] || 10;
    const reason = `beetle_battle_win_${battleType}`;
    
    // SGポイント付与（再利用）
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updateResult = await client.query(
        'UPDATE users SET sg_points = sg_points + $1 WHERE id = $2 RETURNING sg_points',
        [points, userId]
      );
      
      if (updateResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      await client.query(
        'INSERT INTO point_history (user_id, points, reason, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, points, reason]
      );
      
      await client.query('COMMIT');
      
      const newBalance = updateResult.rows[0].sg_points;
      
      console.log(`🎮 バトル勝利！ユーザー ${userId} に ${points} SG 付与`);
      
      res.json({
        success: true,
        userId: parseInt(userId),
        pointsEarned: points,
        newBalance: newBalance,
        battleType: battleType,
        message: `バトル勝利！+${points} SG獲得！`
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Battle reward error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process battle reward' 
    });
  }
});

export default router;