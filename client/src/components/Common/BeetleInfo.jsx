// client/src/components/Common/BeetleInfo.jsx

import React from 'react';
import { getAllBeetleTypes } from '../../utils/beetleData';

const BeetleInfo = () => {
  const beetleTypes = getAllBeetleTypes();

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
      {beetleTypes.map(([key, data]) => (
        <div key={key} className="bg-gray-700 p-3 rounded">
          <div className="font-bold text-amber-400">{data.name}</div>
          <div className="text-gray-300 text-xs mt-1">
            HP:{data.hp} 攻:{data.atk} 防:{data.def} 運搬:{data.carry} 速度:{data.speed} 数:{data.count}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BeetleInfo;