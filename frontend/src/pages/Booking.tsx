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

  if (loading) return <div className="loading loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="section page-section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="section-badge">✨ Reservation</div>
        <h2 className="section-title">Book Your Room</h2>
        <p className="section-subtitle">Reserve your spot at Hostel Sphere in just a few clicks.</p>
      </motion.div>

      <div className="container booking-container">
        <motion.div 
          className="auth-card booking-card" 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="booking-form">
            
            <div className="form-group full-width">
              <label htmlFor="booking-name">Full Name</label>
              <input 
                id="booking-name"
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="Enter your full name"
                title="Full Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-phone">Mobile Number</label>
              <input 
                id="booking-phone"
                type="tel" 
                className="form-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                required 
                placeholder="Enter mobile number"
                title="Mobile Number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-email">Email Address</label>
              <input 
                id="booking-email"
                type="email" 
                className="form-input" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="Enter email address"
                title="Email Address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-roomType">Select Room Type</label>
              <select 
                id="booking-roomType"
                className="form-input form-select" 
                value={formData.roomType}
                onChange={e => setFormData({...formData, roomType: e.target.value})}
                title="Select Room Type"
              >
                <option value="Single" className="select-option">Single Room</option>
                <option value="Double" className="select-option">Double Sharing</option>
                <option value="Triple" className="select-option">Triple Sharing</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="booking-date">Check-in Date</label>
              <input 
                id="booking-date"
                type="date" 
                className="form-input date-input" 
                value={formData.checkInDate} 
                onChange={e => setFormData({...formData, checkInDate: e.target.value})} 
                required 
                title="Check-in Date"
              />
            </div>

            <div className="submit-wrapper">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100" 
                disabled={submitting}
              >
                {submitting ? 'Processing Booking...' : 'Submit Booking Request →'}
              </button>
            </div>

            <p className="booking-note">
              Note: Actual room number will be allocated based on availability at the time of check-in.
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
