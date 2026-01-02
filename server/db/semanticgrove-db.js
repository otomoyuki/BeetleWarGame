// BeetleWarGame/server/db/semanticgrove-db.js
// SemanticGroveのPostgreSQLデータベースに接続

import pg from 'pg';
const { Pool } = pg;

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// 接続テスト
pool.on('connect', () => {
  console.log('✅ SemanticGrove PostgreSQL接続成功');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL接続エラー:', err);
});

// データベースクエリのヘルパー関数
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export default pool;