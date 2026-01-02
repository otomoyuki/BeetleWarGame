-- database/schema.sql
-- 将来のマルチプレイヤー対応のためのスキーマ設計

-- ユーザーテーブル
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ゲーム履歴テーブル
CREATE TABLE game_history (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER REFERENCES users(id),
  player2_id INTEGER REFERENCES users(id),
  winner_id INTEGER REFERENCES users(id),
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  game_duration INTEGER NOT NULL, -- 秒単位
  game_mode VARCHAR(20) NOT NULL, -- 'pvp', 'pve'
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー統計テーブル
CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  total_playtime INTEGER DEFAULT 0, -- 秒単位
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- リプレイデータテーブル
CREATE TABLE replays (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES game_history(id),
  replay_data JSONB NOT NULL, -- ゲーム状態のスナップショット
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_game_history_player1 ON game_history(player1_id);
CREATE INDEX idx_game_history_player2 ON game_history(player2_id);
CREATE INDEX idx_game_history_winner ON game_history(winner_id);
CREATE INDEX idx_game_history_played_at ON game_history(played_at);
CREATE INDEX idx_replays_game_id ON replays(game_id);

-- トリガー: updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 独楽戦場（Spinner Battle）テーブル
-- ========================================

-- 独楽コレクション
CREATE TABLE IF NOT EXISTS spinner_collection (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  spinner_id VARCHAR(50) UNIQUE NOT NULL,
  spinner_type VARCHAR(20) NOT NULL,  -- 'javascript', 'python', 'rust', 'basic', 'advanced'
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  upgrades JSONB DEFAULT '{"attack": 0, "speed": 0, "stability": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 独楽バトル履歴
CREATE TABLE IF NOT EXISTS spinner_battle_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  spinner_id VARCHAR(50),
  game_mode VARCHAR(20) NOT NULL,      -- 'programming' or 'general'
  language VARCHAR(20),                 -- 'javascript', 'python', 'rust', 'general'
  result VARCHAR(10) NOT NULL,          -- 'win' or 'lose'
  rounds INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  total_damage INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  exp_earned INTEGER DEFAULT 0,
  sg_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_spinner_collection_user_id ON spinner_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_spinner_collection_spinner_id ON spinner_collection(spinner_id);
CREATE INDEX IF NOT EXISTS idx_spinner_battle_history_user_id ON spinner_battle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spinner_battle_history_created_at ON spinner_battle_history(created_at DESC);

-- ========================================
-- 凧あげチャレンジ（Kite Flying）テーブル
-- ========================================

-- 凧コレクション
CREATE TABLE IF NOT EXISTS kite_collection (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  kite_id VARCHAR(50) UNIQUE NOT NULL,
  design VARCHAR(20) NOT NULL,          -- 'dragon', 'phoenix', 'tiger', 'basic'
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  upgrades JSONB DEFAULT '{"lift": 0, "stability": 0, "resistance": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 凧記録
CREATE TABLE IF NOT EXISTS kite_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  kite_id VARCHAR(50),
  max_height INTEGER DEFAULT 0,        -- 最高到達高度（メートル）
  game_mode VARCHAR(20) NOT NULL,      -- 'programming' or 'general'
  language VARCHAR(20),                 -- 'javascript', 'python', 'rust', 'general'
  correct_answers INTEGER DEFAULT 0,
  time_played INTEGER DEFAULT 0,        -- プレイ時間（秒）
  exp_earned INTEGER DEFAULT 0,
  sg_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_kite_collection_user_id ON kite_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_kite_records_user_id ON kite_records(user_id);
CREATE INDEX IF NOT EXISTS idx_kite_records_max_height ON kite_records(max_height DESC);

-- ========================================
-- ゲーム統計（共通）テーブル
-- ========================================

-- ゲームプレイ統計
CREATE TABLE IF NOT EXISTS game_statistics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(20) NOT NULL,       -- 'beetle_war', 'spinner_battle', 'kite_flying'
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_sg_earned INTEGER DEFAULT 0,
  total_exp_earned INTEGER DEFAULT 0,
  last_played TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_game_statistics_user_id ON game_statistics(user_id);

-- ========================================
-- 初期データ挿入（テスト用）
-- ========================================

-- ユーザーに初期独楽を付与する関数
CREATE OR REPLACE FUNCTION grant_initial_spinners()
RETURNS TRIGGER AS $$
BEGIN
  -- JavaScript独楽を1体
  INSERT INTO spinner_collection (user_id, spinner_id, spinner_type, level, exp, upgrades)
  VALUES (NEW.id, CONCAT('spinner_javascript_', NEW.id, '_0'), 'javascript', 1, 0, '{"attack": 0, "speed": 0, "stability": 0}');
  
  -- カジュアル独楽を1体
  INSERT INTO spinner_collection (user_id, spinner_id, spinner_type, level, exp, upgrades)
  VALUES (NEW.id, CONCAT('spinner_basic_', NEW.id, '_0'), 'basic', 1, 0, '{"attack": 0, "speed": 0, "stability": 0}');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー: 新規ユーザー登録時に初期独楽を付与
CREATE TRIGGER trigger_grant_initial_spinners
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION grant_initial_spinners();

-- ========================================
-- 便利なビュー
-- ========================================

-- ユーザーの全ゲームデータを一覧表示
CREATE OR REPLACE VIEW user_game_overview AS
SELECT 
  u.id AS user_id,
  u.username,
  u.sg_points,
  gs_beetle.total_games AS beetle_war_games,
  gs_beetle.total_wins AS beetle_war_wins,
  gs_spinner.total_games AS spinner_battle_games,
  gs_spinner.total_wins AS spinner_battle_wins,
  gs_kite.total_games AS kite_flying_games,
  (SELECT COUNT(*) FROM beetle_collection WHERE user_id = u.id) AS total_beetles,
  (SELECT COUNT(*) FROM spinner_collection WHERE user_id = u.id) AS total_spinners,
  (SELECT COUNT(*) FROM kite_collection WHERE user_id = u.id) AS total_kites
FROM users u
LEFT JOIN game_statistics gs_beetle ON u.id = gs_beetle.user_id AND gs_beetle.game_type = 'beetle_war'
LEFT JOIN game_statistics gs_spinner ON u.id = gs_spinner.user_id AND gs_spinner.game_type = 'spinner_battle'
LEFT JOIN game_statistics gs_kite ON u.id = gs_kite.user_id AND gs_kite.game_type = 'kite_flying';

-- ========================================
-- 完了
-- ========================================