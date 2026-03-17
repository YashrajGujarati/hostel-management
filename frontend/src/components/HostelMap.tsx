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
    <div className="stat-card" style={{ padding: '2rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: 800, margin: 0 }}>🏢 Interactive Floor Plan</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Visual representation of room locations and status.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {floors.map(f => (
            <button 
              key={f} 
              className={`tab ${selectedFloor === f ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setSelectedFloor(f)}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '1rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-glass)'
      }}>
        {Array.from({ length: roomsPerFloor }).map((_, i) => {
          const roomNo = selectedFloor * 100 + (i + 1);
          const isUserRoom = studentRoom === roomNo.toString();
          const isOccupied = Math.random() > 0.4 || isUserRoom;

          return (
            <motion.div
              key={roomNo}
              whileHover={{ scale: 1.05 }}
              style={{
                background: isUserRoom ? 'var(--accent-cyan)' : (isOccupied ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                border: `1px solid ${isUserRoom ? 'white' : (isOccupied ? '#f43f5e' : '#10b981')}`,
                height: '80px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isUserRoom ? 'var(--bg-dark)' : 'white' }}>
                {roomNo}
              </span>
              <span style={{ fontSize: '0.6rem', color: isUserRoom ? 'var(--bg-dark)' : 'var(--text-muted)' }}>
                {isUserRoom ? 'Your Room' : (isOccupied ? 'Occupied' : 'Vacant')}
              </span>
              {isUserRoom && (
                <div style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '1rem' }}>📍</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-cyan)' }}></div> Your Room
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.1)' }}></div> Vacant
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid #f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}></div> Occupied
        </div>
      </div>
    </div>
  );
};

export default HostelMap;
