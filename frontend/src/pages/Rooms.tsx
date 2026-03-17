import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:5000/api';

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

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;

  return (
    <div className="section" style={{ paddingTop: '6rem', minHeight: '100vh' }} onMouseMove={handleMouseMove}>
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="section-badge">🏠 Accommodation</div>
          {user?.roomId && (
            <button 
              className="section-badge" 
              style={{ color: 'var(--accent-emerald)', cursor: 'pointer', border: '1px solid var(--accent-emerald)' }}
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
        {['All', 'Available', 'Single', 'Double', 'Triple'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <motion.div className="rooms-grid" variants={container} initial="hidden" animate="show">
        {filtered.map(room => (
          <motion.div
            key={room._id}
            className="room-card"
            variants={item}
            onMouseEnter={() => setHoveredRoom(room)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <div className="room-card-image" style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={room.type === 'Single' ? '/room-single.png' : (room.type === 'Double' ? '/room-double.png' : '/room-triple.png')} 
                alt={room.type} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div className="room-type-badge" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1 }}>{room.type}</div>
            </div>
            <div className="room-card-header" style={{ borderTop: 'none', paddingTop: '1.5rem' }}>
              <span className="room-number">Room {room.roomNumber}</span>
            </div>
            <div className="room-card-body">
              <div className="room-price">₹{room.price.toLocaleString()} <span>/month</span></div>
              <p className="room-description">{room.description}</p>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Floor {room.floor} • Capacity: {room.capacity}
              </div>
              <div className="room-amenities">
                {room.amenities.map((a: string, i: number) => (
                  <span key={i} className="amenity-tag">{a}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div className={`room-availability ${room.isAvailable ? 'available' : 'occupied'}`}>
                  <span className="availability-dot"></span>
                  {room.isAvailable ? 'Available' : 'Occupied'}
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
        <div className="room-hover-preview" style={{ left: mousePos.x, top: mousePos.y }}>
          <h4>Room {hoveredRoom.roomNumber} — {hoveredRoom.type}</h4>
          <div className="preview-row">
            <span className="preview-label">Floor</span>
            <span className="preview-value">{hoveredRoom.floor}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Price</span>
            <span className="preview-value">₹{hoveredRoom.price.toLocaleString()}/mo</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Capacity</span>
            <span className="preview-value">{hoveredRoom.capacity} person(s)</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Status</span>
            <span className="preview-value" style={{ color: hoveredRoom.isAvailable ? '#10b981' : '#f43f5e' }}>
              {hoveredRoom.isAvailable ? '✅ Available' : '❌ Occupied'}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Amenities</span>
            <span className="preview-value">{hoveredRoom.amenities.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
