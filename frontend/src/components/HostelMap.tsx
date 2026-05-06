import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface HostelMapProps {
  studentRoom?: string;
}

const HostelMap: React.FC<HostelMapProps> = ({ studentRoom }) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  
  // Simulated room grid data
  const floors = [1, 2, 3, 4];
  const roomsPerFloor = 10;

  return (
    <div className="stat-card p-8 mt-8">
      <div className="flex-between mb-8">
        <div>
          <h3 className="text-white font-extrabold m-0">🏢 Interactive Floor Plan</h3>
          <p className="text-muted text-sm">Visual representation of room locations and status.</p>
        </div>
        <div className="flex gap-2">
          {floors.map(f => (
            <button 
              key={f} 
              className={`tab ${selectedFloor === f ? 'active' : ''} px-3 py-1.5 text-xs`}
              onClick={() => setSelectedFloor(f)}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 bg-black-20 p-6 rounded-2xl border-glass">
        {Array.from({ length: roomsPerFloor }).map((_, i) => {
          const roomNo = selectedFloor * 100 + (i + 1);
          const isUserRoom = studentRoom === roomNo.toString();
          const isOccupied = Math.random() > 0.4 || isUserRoom;

          return (
            <motion.div
              key={roomNo}
              whileHover={{ scale: 1.05 }}
              className={`h-20 rounded-xl flex-col flex-center relative cursor-pointer ${isUserRoom ? 'bg-cyan border-white' : (isOccupied ? 'bg-red-10 border-red' : 'bg-green-10 border-green')}`}
            >
              <span className={`text-xs font-extrabold ${isUserRoom ? 'text-bg-dark' : 'text-white'}`}>
                {roomNo}
              </span>
              <span className={`text-[0.6rem] ${isUserRoom ? 'text-bg-dark' : 'text-muted'}`}>
                {isUserRoom ? 'Your Room' : (isOccupied ? 'Occupied' : 'Vacant')}
              </span>
              {isUserRoom && (
                <div className="absolute -top-1 -right-1 text-base">📍</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-6 mt-6 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-cyan"></div> Your Room
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border-green bg-green-10"></div> Vacant
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border-red bg-red-10"></div> Occupied
        </div>
      </div>
    </div>
  );
};

export default HostelMap;
