import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

import API from '../apiConfig';

const Booking = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    roomType: 'Single',
    checkInDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    axios.get(`${API}/rooms`).then(r => {
      setRooms(r.data.filter((rm: any) => rm.isAvailable));
      setLoading(false);
    }).catch(() => setLoading(false));

    // If redirected from rooms page with a room type
    if (location.state?.roomType) {
      setFormData(prev => ({ ...prev, roomType: location.state.roomType }));
    }
  }, [user, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book a room");
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      // Find a matching room and book it
      const matchingRoom = rooms.find(r => r.type === formData.roomType && r.isAvailable);
      
      if (!matchingRoom) {
        toast.error(`No ${formData.roomType} rooms available currently.`);
        setSubmitting(false);
        return;
      }

      await axios.post(`${API}/students/book-request`, { 
        roomType: formData.roomType,
        roomId: matchingRoom._id 
      });
      
      toast.success("Booking request submitted! Admin will review soon. ⏳");
      await updateUser();
      navigate('/pay-fees');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;

  return (
    <div className="section" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="section-badge">✨ Reservation</div>
        <h2 className="section-title">Book Your Room</h2>
        <p className="section-subtitle">Reserve your spot at Hostel Sphere in just a few clicks.</p>
      </motion.div>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <motion.div 
          className="auth-card" 
          style={{ maxWidth: '100%', padding: '3rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Select Room Type</label>
              <select 
                className="form-input" 
                style={{ appearance: 'none', background: 'var(--bg-glass)', color: 'white' }}
                value={formData.roomType}
                onChange={e => setFormData({...formData, roomType: e.target.value})}
              >
                <option value="Single" style={{ background: '#111827' }}>Single Room</option>
                <option value="Double" style={{ background: '#111827' }}>Double Sharing</option>
                <option value="Triple" style={{ background: '#111827' }}>Triple Sharing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Check-in Date</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ colorScheme: 'dark' }}
                value={formData.checkInDate} 
                onChange={e => setFormData({...formData, checkInDate: e.target.value})} 
                required 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }} 
                disabled={submitting}
              >
                {submitting ? 'Processing Booking...' : 'Submit Booking Request →'}
              </button>
            </div>

            <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Note: Actual room number will be allocated based on availability at the time of check-in.
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
