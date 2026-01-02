// client/src/utils/api.js

/**
 * SemanticGrove & BeetleWarGame 共通API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SEMANTIC_GROVE_URL = import.meta.env.VITE_SEMANTIC_GROVE_URL || 'http://localhost:5000';

/**
 * セッションIDをlocalStorageから取得
 */
export const getSessionId = () => {
  return localStorage.getItem('semantic_grove_session_id');
};

/**
 * セッションIDを保存
 */
export const setSessionId = (sessionId) => {
  localStorage.setItem('semantic_grove_session_id', sessionId);
};

/**
 * ユーザー情報を取得
 */
export const fetchUserData = async () => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    throw new Error('Session ID not found. Please login via SemanticGrove.');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * SG残高を取得
 */
export const getSGBalance = async () => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // セッションIDがない場合はローカルストレージから取得
    const beetleData = localStorage.getItem('beetleWarGame_playerData');
    if (beetleData) {
      const data = JSON.parse(beetleData);
      return { sg: data.sg || 0 };
    }
    return { sg: 0 };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/sg-balance`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch SG balance');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching SG balance:', error);
    // フォールバック: ローカルストレージ
    const beetleData = localStorage.getItem('beetleWarGame_playerData');
    if (beetleData) {
      const data = JSON.parse(beetleData);
      return { sg: data.sg || 0 };
    }
    return { sg: 0 };
  }
};

/**
 * SGを追加（報酬）
 */
export const addSG = async (amount, reason = 'game_reward') => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // ローカルモード: localStorageに保存
    console.log(`[Local Mode] Adding ${amount} SG (${reason})`);
    return { success: true, local: true };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/sg-add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add SG');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding SG:', error);
    return { success: false, error: error.message };
  }
};

/**
 * SGを消費
 */
export const spendSG = async (amount, reason = 'purchase') => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // ローカルモード
    console.log(`[Local Mode] Spending ${amount} SG (${reason})`);
    return { success: true, local: true };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/sg-spend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to spend SG');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error spending SG:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 甲虫コレクションを取得
 */
export const getBeetleCollection = async () => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // ローカルモード
    const beetleData = localStorage.getItem('beetleWarGame_playerData');
    if (beetleData) {
      const data = JSON.parse(beetleData);
      return { beetles: data.beetleUpgrades || {} };
    }
    return { beetles: {} };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/beetle-collection`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch beetle collection');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching beetle collection:', error);
    throw error;
  }
};

/**
 * 独楽コレクションを取得
 */
export const getSpinnerCollection = async () => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // ローカルモード
    const spinnerData = localStorage.getItem('spinnerBattle_playerData');
    if (spinnerData) {
      const data = JSON.parse(spinnerData);
      return { spinners: data.spinners || {} };
    }
    return { spinners: {} };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/spinner-collection`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch spinner collection');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching spinner collection:', error);
    throw error;
  }
};

/**
 * バトル結果を記録
 */
export const recordBattleResult = async (gameType, result) => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // ローカルモード
    console.log(`[Local Mode] Recording ${gameType} battle:`, result);
    return { success: true, local: true };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/battle-result`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameType, ...result }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to record battle result');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error recording battle result:', error);
    return { success: false, error: error.message };
  }
};

/**
 * モード判定: SemanticGroveから来たかどうか
 */
export const isConnectedToSemanticGrove = () => {
  return !!getSessionId();
};

/**
 * SemanticGroveへのリンクを取得
 */
export const getSemanticGroveLink = () => {
  return SEMANTIC_GROVE_URL;
};