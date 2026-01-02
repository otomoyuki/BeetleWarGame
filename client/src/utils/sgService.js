// sgService.js - Flask API との通信

const API_URL = 'http://localhost:5000/api/sg';

export const sgService = {
  // SG残高取得
  async getBalance() {
    try {
      const response = await fetch(`${API_URL}/balance`, {
        credentials: 'include' // Cookie を送信
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SG残高取得エラー:', error);
      return { success: false, error: error.message };
    }
  },

  // SG追加（ゲーム報酬）
  async addSG(amount, reason = 'game_reward') {
    try {
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount, reason })
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${amount} SG獲得！ (${reason})`);
      }
      
      return data;
    } catch (error) {
      console.error('SG追加エラー:', error);
      return { success: false, error: error.message };
    }
  },

  // SG消費（ガチャ・購入）
  async spendSG(amount, reason = 'game_purchase') {
    try {
      const response = await fetch(`${API_URL}/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount, reason })
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`💰 ${amount} SG消費 (${reason})`);
      }
      
      return data;
    } catch (error) {
      console.error('SG消費エラー:', error);
      return { success: false, error: error.message };
    }
  }
};