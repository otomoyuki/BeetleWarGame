// client/src/components/Game/GameControls.jsx

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const GameControls = ({ isRunning, onToggleRunning, onReset, disabled }) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={onToggleRunning}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition"
        disabled={disabled}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} />}
        {isRunning ? '一時停止' : '開始'}
      </button>
      
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition"
      >
        <RotateCcw size={20} />
        リセット
      </button>
    </div>
  );
};

export default GameControls;