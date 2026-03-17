import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Counter from '../components/Counter';
import Logo from '../components/Logo';

const API = 'http://localhost:5000/api';

const facilities = [
  { icon: '📶', title: 'High-Speed WiFi', desc: 'Unlimited internet access throughout the hostel' },
  { icon: '🏋️', title: 'Gymnasium', desc: 'Fully equipped modern gym for residents' },
  { icon: '👔', title: 'Laundry Service', desc: 'Professional wash, dry & iron service' },
  { icon: '📚', title: 'Study Room', desc: '24/7 quiet study area with AC' },
  { icon: '🍽️', title: 'Mess/Dining', desc: '3 meals daily — nutritious home-style food' },
  { icon: '🏥', title: 'Medical Aid', desc: 'First-aid & doctor on call facility' },
  { icon: '🔒', title: '24/7 Security', desc: 'CCTV surveillance & security guards' },
  { icon: '🚰', title: 'RO Water', desc: 'Purified drinking water on every floor' },
  { icon: '⚡', title: 'Power Backup', desc: 'Uninterrupted electricity with generator' },
  { icon: '🅿️', title: 'Parking', desc: 'Covered parking for two-wheelers' },
  { icon: '🎮', title: 'Recreation Room', desc: 'Indoor games — TT, carrom, chess' },
  { icon: '🧹', title: 'Housekeeping', desc: 'Daily cleaning of common areas' },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [todayMenu, setTodayMenu] = useState<any>(null);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API}/rooms`).then(r => setRooms(r.data)).catch(() => { });
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    axios.get(`${API}/food-menu`).then(r => {
      const menu = r.data.find((m: any) => m.day === today);
      if (menu) {
        setTodayMenu(menu);
        if (user) setTimeout(() => setShowMenuPopup(true), 2000);
      }
    }).catch(() => { });
  }, [user]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX + 20, y: e.clientY - 10 });
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const displayedFacilities = showAllFacilities ? facilities : facilities.slice(0, 6);
  const availableRooms = rooms.filter(r => r.isAvailable);

  const handleFacilityClick = (facilityTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/complaints', { 
      state: { 
        openForm: true, 
        category: 'Maintenance', 
        subject: `Issue with ${facilityTitle}` 
      } 
    });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-badge">✨ Premium Student Accommodation</div>
          <h1>
            Your Perfect <span className="gradient-text">Home Away</span> From Home
          </h1>
          <p className="hero-subtitle">
            Experience comfortable living with world-class amenities, delicious meals,
            and a vibrant community at Hostel Sphere.
          </p>
          <div className="hero-buttons">
            <Link to="/book" className="btn btn-primary btn-lg">
              ✨ Book Your Room
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              🔍 Learn More
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number"><Counter value={rooms.length} suffix="+" /></div>
              <div className="hero-stat-label">Rooms</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number"><Counter value={availableRooms.length} /></div>
              <div className="hero-stat-label">Available</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number"><Counter value={facilities.length} suffix="+" /></div>
              <div className="hero-stat-label">Amenities</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">24/7</div>
              <div className="hero-stat-label">Support</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ROOMS AVAILABLE */}
      <section className="section" onMouseMove={handleMouseMove}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">🏠 Accommodation</div>
          <h2 className="section-title">Rooms Available</h2>
          <p className="section-subtitle">
            Hover over rooms to preview details. Choose your ideal living space.
          </p>
        </motion.div>

        <motion.div
          className="rooms-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {rooms.slice(0, 6).map((room) => (
            <motion.div
              key={room._id}
              className="room-card"
              variants={item}
              onMouseEnter={() => setHoveredRoom(room)}
              onMouseLeave={() => setHoveredRoom(null)}
              onClick={() => navigate('/book', { state: { roomType: room.type } })}
              style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
            >
              <div style={{ height: '160px', position: 'relative' }}>
                <img 
                  src={room.type === 'Single' ? '/room-single.png' : (room.type === 'Double' ? '/room-double.png' : '/room-triple.png')} 
                  alt={room.type} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div className="room-type-badge" style={{ position: 'absolute', top: '10px', right: '10px' }}>{room.type}</div>
              </div>
              <div className="room-card-header" style={{ border: 'none', padding: '1.2rem 1.5rem 0' }}>
                <span className="room-number">Room {room.roomNumber}</span>
              </div>
              <div className="room-card-body">
                <div className="room-price">₹{room.price.toLocaleString()} <span>/month</span></div>
                <p className="room-description">{room.description}</p>
                <div className="room-amenities">
                  {room.amenities.slice(0, 3).map((a: string, i: number) => (
                    <span key={i} className="amenity-tag">{a}</span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="amenity-tag">+{room.amenities.length - 3} more</span>
                  )}
                </div>
                <div className={`room-availability ${room.isAvailable ? 'available' : 'occupied'}`}>
                  <span className="availability-dot"></span>
                  {room.isAvailable ? 'Available' : 'Occupied'}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/rooms" className="btn btn-primary btn-lg">View All Rooms →</Link>
        </div>

        {/* Cursor hover preview */}
        {hoveredRoom && (
          <div
            ref={previewRef}
            className="room-hover-preview"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
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
      </section>

      {/* FACILITIES */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-badge">✨ Amenities</div>
          <h2 className="section-title">Hostel Facilities</h2>
          <p className="section-subtitle">World-class amenities to make your stay comfortable and productive.</p>
        </motion.div>

        <motion.div
          className="facilities-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {displayedFacilities.map((f, i) => (
            <motion.div 
              key={i} 
              className="facility-card" 
              variants={item}
              onClick={() => handleFacilityClick(f.title)}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              title="Click to file a complaint about this facility"
            >
              <span className="facility-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                🚩 Report Issue
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => setShowAllFacilities(!showAllFacilities)}
          >
            {showAllFacilities ? 'Show Less' : 'View All Facilities →'}
          </button>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-badge">⚡ Quick Access</div>
          <h2 className="section-title">Get Started</h2>
          <p className="section-subtitle">Quick links to manage your hostel experience.</p>
        </motion.div>

        <motion.div
          className="quick-access"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item} className="quick-access-card" onClick={() => navigate('/book')}>
            <span className="quick-access-icon">🏠</span>
            <h4>Book a Room</h4>
            <p>Browse and select your room</p>
          </motion.div>
          <motion.div variants={item} className="quick-access-card" onClick={() => navigate('/facilities')}>
            <span className="quick-access-icon">🍽️</span>
            <h4>Facilities</h4>
            <p>View all hostel amenities</p>
          </motion.div>
          <motion.div variants={item} className="quick-access-card" onClick={() => navigate(user ? '/pay-fees' : '/login')}>
            <span className="quick-access-icon">💳</span>
            <h4>Pay Fees</h4>
            <p>Pay hostel fees online</p>
          </motion.div>
          <motion.div variants={item} className="quick-access-card" onClick={() => navigate('/contact')}>
            <span className="quick-access-icon">📝</span>
            <h4>Support</h4>
            <p>Contact us for any help</p>
          </motion.div>
        </motion.div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="section-badge">📸 Experience</div>
          <h2 className="section-title">Hostel Life at a Glance</h2>
          <p className="section-subtitle">A glimpse into the comfortable and vibrant life at Hostel Sphere.</p>
        </motion.div>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
             <img src="/hostel-building.png" alt="Building" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '16px' }} />
             <img src="/hostel-room.png" alt="Room" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '16px' }} />
             <img src="/hostel-mess.png" alt="Mess" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '16px' }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/gallery" className="btn btn-outline">Explore Full Gallery →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
         <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
           <div style={{ maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <Logo size={40} />
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>Hostel Sphere</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Providing premium, secure, and comfortable accommodation for students since 2024. Your perfect home away from home.
              </p>
           </div>
           
           <div style={{ display: 'flex', gap: '4rem' }}>
              <div>
                <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Quick Links</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li><Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About Us</Link></li>
                  <li><Link to="/rooms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Rooms</Link></li>
                  <li><Link to="/facilities" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Facilities</Link></li>
                  <li><Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Contact</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Ahmedabad, Gujarat<br />
                  +91 98765 43210<br />
                  hello@hostelsphere.com
                </p>
              </div>
           </div>
         </div>
         <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.6 }}>
           <p>© 2026 Hostel Sphere Management System. All rights reserved.</p>
         </div>
      </footer>

      {/* Today's Menu Popup */}
      {showMenuPopup && todayMenu && (
        <motion.div
          className="popup-toast"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="popup-toast-header">
            <h4>🍽️ Today's Menu ({todayMenu.day})</h4>
            <button className="popup-toast-close" onClick={() => setShowMenuPopup(false)}>✕</button>
          </div>
          <div className="food-meal">
            <div className="food-meal-time morning">☀️ Morning</div>
            <div className="food-meal-items">{todayMenu.meals.morning}</div>
          </div>
          <div className="food-meal">
            <div className="food-meal-time afternoon">🌤️ Afternoon</div>
            <div className="food-meal-items">{todayMenu.meals.afternoon}</div>
          </div>
          <div className="food-meal">
            <div className="food-meal-time night">🌙 Night</div>
            <div className="food-meal-items">{todayMenu.meals.night}</div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Landing;
