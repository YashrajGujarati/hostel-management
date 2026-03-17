import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Counter from '../components/Counter';
import HostelMap from '../components/HostelMap';

import API from '../apiConfig';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === 'admin') { navigate('/admin'); return; }
    const fetchData = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          axios.get(`${API}/complaints`),
          axios.get(`${API}/bills`)
        ]);
        setComplaints(cRes.data);
        setBills(bRes.data);
        if (user.roomId) {
          const rId = typeof user.roomId === 'object' ? user.roomId._id : user.roomId;
          const rRes = await axios.get(`${API}/rooms/${rId}`);
          setRoom(rRes.data);
        }
      } catch { }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;
  if (!user) return null;

  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;
  const totalPaid = bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.totalAmount, 0);
  const pendingBills = bills.filter(b => b.paymentStatus === 'Pending');

  return (
    <div className="dashboard">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p>Ready for another great day at Hostel Sphere?</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div className="stat-card" style={{ padding: '0.8rem 1.5rem', minWidth: 'auto', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Booking Status</div>
                <div style={{ fontWeight: 800, color: user.bookingStatus === 'Approved' ? 'var(--accent-emerald)' : (user.bookingStatus === 'Pending' ? 'var(--accent-amber)' : 'white') }}>
                   {user.bookingStatus === 'None' ? 'No Active Booking' : user.bookingStatus}
                   {user.bookingStatus === 'Pending' && ' ⏳'}
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="dashboard-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="stat-card">
          <div className="stat-card-icon">🏠</div>
          <div className="stat-card-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>{user.bookingStatus === 'Approved' ? (room ? room.roomNumber : 'Assigning...') : 'N/A'}</span>
            {user.bookingStatus === 'Approved' && (
              <button 
                className="btn btn-emerald btn-sm" 
                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}
                onClick={() => navigate('/pay-fees')}
              >
                💳 Pay Fees
              </button>
            )}
           </div>
          <div className="stat-card-label">{room ? `${room.type} Room — Floor ${room.floor}` : (user.bookingStatus === 'Pending' ? 'Approval Awaited' : 'No Room Assigned')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value"><Counter value={complaints.length} /></div>
          <div className="stat-card-label">{pendingComplaints} pending complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value"><Counter value={totalPaid} prefix="₹" /></div>
          <div className="stat-card-label">Total fees paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📄</div>
          <div className="stat-card-value"><Counter value={pendingBills.length} /></div>
          <div className="stat-card-label">Pending bills</div>
        </div>
      </motion.div>

      {/* Visual Floor Map */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
        <HostelMap studentRoom={room?.roomNumber} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>Quick Actions</h3>
        <div className="quick-access">
          <Link to="/rooms" className="quick-access-card">
            <span className="quick-access-icon">🏠</span>
            <h4>{room ? 'Change Room' : 'Book a Room'}</h4>
            <p>{room ? `Currently in Room ${room.roomNumber}` : 'Select your room'}</p>
          </Link>
          <Link to="/food-menu" className="quick-access-card">
            <span className="quick-access-icon">🍽️</span>
            <h4>Food Menu</h4>
            <p>This week's menu</p>
          </Link>
          <Link to="/complaints" className="quick-access-card">
            <span className="quick-access-icon">📝</span>
            <h4>File Complaint</h4>
            <p>Report an issue</p>
          </Link>
          <Link to="/pay-fees" className="quick-access-card">
            <span className="quick-access-icon">💳</span>
            <h4>Pay Fees</h4>
            <p>Generate bill & pay</p>
          </Link>
        </div>
      </motion.div>

      {/* Recent Complaints */}
      {complaints.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>Recent Complaints</h3>
          <div className="complaints-list">
            {complaints.slice(0, 3).map(c => (
              <div key={c._id} className="complaint-card">
                <div className="complaint-header">
                  <span className={`complaint-category ${c.category}`}>{c.category}</span>
                  <span className={`complaint-status ${c.status.replace(' ', '-')}`}>{c.status}</span>
                </div>
                <div className="complaint-subject">{c.subject}</div>
                <div className="complaint-description">{c.description}</div>
                {c.adminResponse && (
                  <div className="complaint-response">
                    <div className="complaint-response-label">Admin Response</div>
                    <p>{c.adminResponse}</p>
                  </div>
                )}
                <div className="complaint-meta">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentDashboard;
