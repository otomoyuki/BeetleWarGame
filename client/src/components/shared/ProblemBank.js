// client/src/components/shared/ProblemBank.js

// 独楽・凧あげ・その他ゲームで共通使用

/**
 * プログラミング問題バンク（JavaScript）
 */
export const PROGRAMMING_PROBLEMS = {
  javascript: [
    {
      id: 'js_001',
      question: '配列をソートするメソッドは？',
      hint: 'arr.______()',
      answer: 'sort',
      difficulty: 1,
    },
    {
      id: 'js_002',
      question: '配列の長さを取得するプロパティは？',
      hint: 'arr.______',
      answer: 'length',
      difficulty: 1,
    },
    {
      id: 'js_003',
      question: '配列の最後に要素を追加するメソッドは？',
      hint: 'arr.______(item)',
      answer: 'push',
      difficulty: 1,
    },
    {
      id: 'js_004',
      question: '文字列を大文字に変換するメソッドは？',
      hint: 'str._______()',
      answer: 'toUpperCase',
      difficulty: 2,
    },
    {
      id: 'js_005',
      question: '配列から条件に合う要素を抽出するメソッドは？',
      hint: 'arr.______(fn)',
      answer: 'filter',
      difficulty: 2,
    },
    {
      id: 'js_006',
      question: '配列の各要素を変換するメソッドは？',
      hint: 'arr.______(fn)',
      answer: 'map',
      difficulty: 2,
    },
    {
      id: 'js_007',
      question: '配列を結合して文字列にするメソッドは？',
      hint: 'arr.______(separator)',
      answer: 'join',
      difficulty: 2,
    },
    {
      id: 'js_008',
      question: '文字列を配列に分割するメソッドは？',
      hint: 'str.______(separator)',
      answer: 'split',
      difficulty: 2,
    },
  ],
  python: [
    {
      id: 'py_001',
      question: 'リストをソートするメソッドは？',
      hint: 'lst.______()',
      answer: 'sort',
      difficulty: 1,
    },
    {
      id: 'py_002',
      question: 'リストの長さを取得する関数は？',
      hint: '_____(lst)',
      answer: 'len',
      difficulty: 1,
    },
    {
      id: 'py_003',
      question: 'リストの最後に要素を追加するメソッドは？',
      hint: 'lst.______(item)',
      answer: 'append',
      difficulty: 1,
    },
    {
      id: 'py_004',
      question: '文字列を大文字に変換するメソッドは？',
      hint: 'str.______()',
      answer: 'upper',
      difficulty: 2,
    },
    {
      id: 'py_005',
      question: 'リストから条件に合う要素を抽出する関数は？',
      hint: '_____(fn, lst)',
      answer: 'filter',
      difficulty: 2,
    },
  ],
  rust: [
    {
      id: 'rs_001',
      question: 'ベクターをソートするメソッドは？',
      hint: 'vec.______()',
      answer: 'sort',
      difficulty: 1,
    },
    {
      id: 'rs_002',
      question: 'ベクターの長さを取得するメソッドは？',
      hint: 'vec.______()',
      answer: 'len',
      difficulty: 1,
    },
  ],
};

/**
 * 一般問題バンク（カジュアルモード）
 */
export const GENERAL_PROBLEMS = [
  {
    id: 'gen_001',
    question: '3 + 5 = ?',
    choices: ['6', '7', '8', '9'],
    answer: '8',
    difficulty: 1,
  },
  {
    id: 'gen_002',
    question: '日本の首都は？',
    choices: ['東京', '大阪', '京都', '名古屋'],
    answer: '東京',
    difficulty: 1,
  },
  {
    id: 'gen_003',
    question: '12 × 3 = ?',
    choices: ['24', '30', '36', '42'],
    answer: '36',
    difficulty: 1,
  },
  {
    id: 'gen_004',
    question: '1年は何日？',
    choices: ['360日', '365日', '366日', '370日'],
    answer: '365日',
    difficulty: 1,
  },
  {
    id: 'gen_005',
    question: '富士山の高さは約何メートル？',
    choices: ['2776m', '3376m', '3776m', '4176m'],
    answer: '3776m',
    difficulty: 2,
  },
  {
    id: 'gen_006',
    question: '15 + 27 = ?',
    choices: ['40', '42', '44', '46'],
    answer: '42',
    difficulty: 1,
  },
  {
    id: 'gen_007',
    question: '水の沸点は？',
    choices: ['50℃', '80℃', '100℃', '120℃'],
    answer: '100℃',
    difficulty: 1,
  },
  {
    id: 'gen_008',
    question: '1週間は何日？',
    choices: ['5日', '6日', '7日', '8日'],
    answer: '7日',
    difficulty: 1,
  },
];

/**
 * 問題バンク（統合版）
 */
export const PROBLEM_BANK = {
  programming: PROGRAMMING_PROBLEMS,
  general: GENERAL_PROBLEMS,
};

/**
 * ランダムな問題を取得
 */
export const getRandomProblem = (language, difficulty = null) => {
  if (language === 'general') {
    let problems = GENERAL_PROBLEMS;
    if (difficulty) {
      problems = problems.filter(p => p.difficulty === difficulty);
    }
    return problems[Math.floor(Math.random() * problems.length)];
  } else {
    const languageProblems = PROGRAMMING_PROBLEMS[language] || PROGRAMMING_PROBLEMS.javascript;
    let problems = languageProblems;
    if (difficulty) {
      problems = problems.filter(p => p.difficulty === difficulty);
    }
    return problems[Math.floor(Math.random() * problems.length)];
  }
};

/**
 * 難易度別の問題を取得
 */
export const getProblemsByDifficulty = (language, difficulty) => {
  if (language === 'general') {
    return GENERAL_PROBLEMS.filter(p => p.difficulty === difficulty);
  } else {
    const languageProblems = PROGRAMMING_PROBLEMS[language] || PROGRAMMING_PROBLEMS.javascript;
    return languageProblems.filter(p => p.difficulty === difficulty);
  }
};