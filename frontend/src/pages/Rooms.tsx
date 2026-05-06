import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import API from '../apiConfig';

const Rooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [hoveredRoom, setHoveredRoom] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${API}/rooms`);
      setRooms(data);
    } catch { }
    setLoading(false);
  };

  const bookRoom = (roomType: string) => {
    if (!user) { navigate('/login'); return; }
    navigate('/book', { state: { roomType } });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX + 20, y: e.clientY - 10 });
  };

  const filtered = rooms.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Available') return r.isAvailable;
    return r.type === filter;
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return <div className="loading min-h-screen pt-20"><div className="spinner"></div></div>;

  return (
    <div className="section pt-24 min-h-screen" onMouseMove={handleMouseMove}>
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-center gap-4 mb-4">
          <div className="section-badge">🏠 Accommodation</div>
          {user?.roomId && (
            <button 
              className="section-badge text-emerald cursor-pointer border border-emerald" 
              onClick={() => navigate('/pay-fees')}
            >
              💳 Pay My Fees
            </button>
          )}
        </div>
        <h2 className="section-title">Rooms Available</h2>
        <p className="section-subtitle">Browse all rooms. Hover to see details. Click "Book" to reserve.</p>
      </motion.div>

      <div className="tabs">
        {['All', 'Available', '1-Seater', '2-Seater', '3-Seater', '4-Seater'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <motion.div className="rooms-grid" variants={container} initial="hidden" animate="show">
        {filtered.map(room => (
          <motion.div
            key={room._id || room.id}
            className="room-card"
            variants={item}
            onMouseEnter={() => setHoveredRoom(room)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <div className="room-card-image h-45 overflow-hidden relative">
              <img 
                src={room.type === '1-Seater' ? '/room-single.png' : (room.type === '2-Seater' ? '/room-double.png' : '/room-triple.png')} 
                alt={room.type} 
                className="w-full h-full object-cover" 
              />
              <div className="room-type-badge absolute top-4 right-4 z-1">{room.type}</div>
            </div>
                        <div className="room-card-header border-t-none">
              <span className="room-number">Room {room.roomNumber}</span>
            </div>
            <div className="room-card-body">
              <div className="room-price">₹{room.price?.toLocaleString() || room.price} <span>/month</span></div>
              <p className="room-description">{room.description}</p>
              <div className="mb-2 text-xs text-muted">
                Floor {room.floor} • Capacity: {room.capacity}
              </div>
              <div className="room-amenities">
                {room.amenities?.map((a: string, i: number) => (
                  <span key={i} className="amenity-tag">{a}</span>
                )) || <span className="text-muted">No amenities listed</span>}
              </div>
              <div className="flex-between mt-4">
                <div className={`room-availability ${room.isAvailable ? 'available' : 'occupied'}`}>
                  <span className="availability-dot"></span>
                  {room.isAvailable ? 'AVAILABLE' : 'OCCUPIED'}
                </div>
                {room.isAvailable && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => bookRoom(room.type)}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3>No rooms found</h3>
          <p>Try a different filter</p>
        </div>
      )}

      {hoveredRoom && (
        <motion.div 
          className="room-hover-preview" 
          animate={{ x: mousePos.x + 15, y: mousePos.y + 15 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0 }}
        >
          <h4>Room {hoveredRoom.roomNumber} — {hoveredRoom.type}</h4>
          <div className="preview-row">
            <span className="preview-label">Floor</span>
            <span className="preview-value">{hoveredRoom.floor}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Price</span>
            <span className="preview-value">₹{hoveredRoom.price?.toLocaleString() || hoveredRoom.price}/mo</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Capacity</span>
            <span className="preview-value">{hoveredRoom.capacity} person(s)</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Status</span>
            <span className={`preview-value ${hoveredRoom.isAvailable ? 'text-green' : 'text-red'}`}>
              {hoveredRoom.isAvailable ? '✅ Available' : '❌ Occupied'}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Amenities</span>
            <span className="preview-value">{hoveredRoom.amenities?.join(', ') || 'N/A'}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Rooms;
