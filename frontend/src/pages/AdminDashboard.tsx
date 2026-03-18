import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import API from '../apiConfig';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('complaints');
  const [students, setStudents] = useState<any[]>([]);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [roomForm, setRoomForm] = useState({
    roomNumber: '', type: '2-Seater', capacity: 2, price: 5000, floor: 1, description: ''
  });

  const toggleSensitive = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    return `${user.charAt(0)}${'*'.repeat(user.length - 2)}${user.slice(-1)}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    return `${phone.slice(0, 2)}${'*'.repeat(6)}${phone.slice(-2)}`;
  };

  const updateBooking = async (studentId: string, status: string) => {
    try {
      await axios.patch(`${API}/students/${studentId}/booking`, { status });
      toast.success(`Booking ${status}`);
      fetchData();
    } catch { toast.error("Update failed"); }
  };

  const deleteRoom = async (id: string) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await axios.delete(`${API}/rooms/${id}`);
      fetchData();
      toast.success("Room deleted");
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await axios.patch(`${API}/rooms/${editingRoom._id}`, roomForm);
        toast.success("Room updated");
      } else {
        await axios.post(`${API}/rooms`, roomForm);
        toast.success("Room added");
      }
      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomForm({ roomNumber: '', type: '2-Seater', capacity: 2, price: 5000, floor: 1, description: '' });
      fetchData();
    } catch { toast.error("Operation failed"); }
  };

  const openEditRoom = (room: any) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      floor: room.floor,
      description: room.description || ''
    });
    setShowRoomModal(true);
  };
  const [resolveResponse, setResolveResponse] = useState('');
  const [resolveStatus, setResolveStatus] = useState('Resolved');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [cRes, bRes, rRes, sRes] = await Promise.all([
        axios.get(`${API}/complaints`),
        axios.get(`${API}/bills`),
        axios.get(`${API}/rooms`),
        axios.get(`${API}/students`)
      ]);
      setComplaints(cRes.data);
      setBills(bRes.data);
      setRooms(rRes.data);
      setStudents(sRes.data);
    } catch { }
    setLoading(false);
  };

  const resolveComplaint = async (id: string) => {
    try {
      await axios.patch(`${API}/complaints/${id}/resolve`, {
        status: resolveStatus,
        adminResponse: resolveResponse
      });
      setResolveId(null);
      setResolveResponse('');
      await fetchData();
    } catch { }
  };

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;
  if (!user) return null;

  const pendingComplaints = (complaints || []).filter(c => c.status === 'Pending' || c.status === 'Open').length;
  const availableRooms = (rooms || []).filter(r => r.isAvailable).length;
  const totalRevenue = (bills || []).filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.totalAmount || b.amount || 0), 0);

  return (
    <div className="dashboard">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Admin Dashboard 🏨</h1>
        <p>Manage hostel operations, complaints, and payments.</p>
      </motion.div>

      <motion.div className="dashboard-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="stat-card">
          <div className="stat-card-icon">🚨</div>
          <div className="stat-card-value" style={{ color: pendingComplaints > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
            {pendingComplaints}
          </div>
          <div className="stat-card-label">Pending Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value">{complaints.length}</div>
          <div className="stat-card-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🏠</div>
          <div className="stat-card-value">{availableRooms}/{rooms.length}</div>
          <div className="stat-card-label">Rooms Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">₹{totalRevenue.toLocaleString()}</div>
          <div className="stat-card-label">Total Revenue</div>
        </div>
      </motion.div>

      {/* ANALYTICS SECTION */}
      <motion.div 
        className="glass-card" 
        style={{ marginTop: '24px', padding: '2.5rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
           <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem' }}>📈 Performance Insights</h3>
           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Data Sync</div>
        </div>
        
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Jan', revenue: 45000, bookings: 40 },
              { name: 'Feb', revenue: 52000, bookings: 45 },
              { name: 'Mar', revenue: 48000, bookings: 42 },
              { name: 'Apr', revenue: 61000, bookings: 55 },
              { name: 'May', revenue: 55000, bookings: 50 },
              { name: 'Jun', revenue: 72000, bookings: 65 }
            ]}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `₹${value/1000}k`} />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--accent-blue)', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="tabs" style={{ marginBottom: '2.5rem', background: 'var(--bg-glass)', padding: '0.4rem', borderRadius: 'var(--radius-xl)' }}>
        <button className={`tab ${tab === 'complaints' ? 'active' : ''}`} onClick={() => setTab('complaints')}>
          🚨 Complaints
        </button>
        <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
          👥 Students
        </button>
        <button className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          📅 Bookings
        </button>
        <button className={`tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
          💰 Payments
        </button>
        <button className={`tab ${tab === 'rooms' ? 'active' : ''}`} onClick={() => setTab('rooms')}>
          🏢 Room Map
        </button>
      </div>

      {/* COMPLAINTS TAB */}
      {tab === 'complaints' && (
        <div className="complaints-list">
          {(complaints || []).length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No complaints</h3></div>
          )}
          {(complaints || []).map(c => (
            <motion.div key={c._id} className="complaint-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="complaint-header">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`complaint-category ${c.category}`}>{c.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {c.studentId?.name || 'Unknown'}</span>
                </div>
                <span className={`complaint-status ${c.status.replace(' ', '-')}`}>{c.status}</span>
              </div>
              <div className="complaint-subject">{c.title}</div>
              <div className="complaint-description">{c.description}</div>
              <div className="complaint-meta">
                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>

              {c.status !== 'Resolved' && (
                <>
                  {resolveId === c._id ? (
                    <div className="admin-resolve-form">
                      <div className="form-group">
                        <label>Status</label>
                        <select className="form-select" value={resolveStatus} onChange={e => setResolveStatus(e.target.value)}>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Response to Student</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Your response..."
                          value={resolveResponse}
                          onChange={e => setResolveResponse(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-emerald btn-sm" onClick={() => resolveComplaint(c._id)}>Submit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setResolveId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '0.75rem' }}
                      onClick={() => { setResolveId(c._id); setResolveResponse(''); setResolveStatus('Resolved'); }}
                    >
                      Respond & Resolve
                    </button>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* PAYMENTS TAB */}
      {tab === 'payments' && (
        <div className="complaints-list">
          {bills.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">💰</div><h3>No payments yet</h3></div>
          )}
          {bills.map(b => (
            <div key={b._id} className="complaint-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="complaint-header">
                  <span className={`complaint-status ${b.paymentStatus === 'Paid' ? 'Resolved' : 'Pending'}`}>{b.paymentStatus || 'Pending'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(b.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="complaint-subject">₹{(b.totalAmount || b.amount || 0).toLocaleString()} — {b.durationLabel || 'Monthly'}</div>
                <div className="complaint-description">
                  {b.studentId?.name || 'Unknown student'} • Room {b.studentId?.roomId?.roomNumber || 'N/A'}
                </div>
              </div>
              {b.paymentStatus === 'Paid' && (
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    import('../utils/receiptGenerator').then(m => {
                      m.generateReceiptPDF({
                        id: b._id,
                        studentName: b.studentId?.name || 'N/A',
                        roomNumber: b.studentId?.roomId?.roomNumber || 'N/A',
                        roomType: b.studentId?.roomId?.type || 'Standard',
                        amount: b.totalAmount || b.amount,
                        roomCharges: b.roomCharges || 0,
                        foodCharges: b.foodCharges || 0,
                        laundryCharges: b.laundryCharges || 0,
                        gstAmount: b.gstAmount || 0,
                        date: b.paidAt || b.createdAt,
                        duration: b.durationLabel || 'Monthly',
                        paymentMethod: b.paymentMethod || 'Online'
                      });
                    });
                  }}
                >
                  📥 Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {tab === 'bookings' && (
        <div className="complaints-list">
          <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Student</th>
                <th style={{ padding: '1rem' }}>Room Preference</th>
                <th style={{ padding: '1rem' }}>Current Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.filter(s => s.bookingStatus !== 'None').map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, cursor: 'pointer' }} onClick={() => toggleSensitive(s._id)}>
                      {showSensitive[s._id] ? s.phone : maskPhone(s.phone)} 👁️
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{s.roomId?.roomNumber || 'Any Available'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`complaint-status ${s.bookingStatus}`}>
                      {s.bookingStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-emerald btn-sm" onClick={() => updateBooking(s._id, 'Approved')}>Approve</button>
                      <button className="btn btn-rose btn-sm" onClick={() => updateBooking(s._id, 'Rejected')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.filter(s => s.bookingStatus !== 'None').length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No booking requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'students' && (
        <div className="complaints-list">
          <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Room</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem' }}>{s.name}</td>
                  <td style={{ padding: '1rem', opacity: 0.7, cursor: 'pointer' }} onClick={() => toggleSensitive(s._id)}>
                    {showSensitive[s._id] ? s.email : maskEmail(s.email)} 👁️
                  </td>
                  <td style={{ padding: '1rem' }}>{s.roomId ? `Room ${s.roomId.roomNumber || '?'}` : 'Unassigned'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`complaint-status ${s.roomId ? 'Resolved' : 'Pending'}`}>
                      {s.roomId ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ROOMS TAB (Visual Map) */}
      {tab === 'rooms' && (
        <div style={{ padding: '1rem' }}>
           <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setEditingRoom(null);
                  setRoomForm({ roomNumber: '', type: '2-Seater', capacity: 2, price: 5000, floor: 1, description: '' });
                  setShowRoomModal(true);
                }}
              >
                + Add New Room
              </button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {rooms.map(room => (
                <div 
                  key={room._id} 
                  style={{ 
                    padding: '1.2rem', 
                    background: room.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${room.isAvailable ? '#10b981' : '#f43f5e'}`,
                    borderRadius: '16px',
                    textAlign: 'center',
                    position: 'relative',
                    transition: '0.3s'
                  }}
                >
                   <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => openEditRoom(room)}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', padding: '5px' }}
                    >✏️</button>
                    <button 
                      onClick={() => deleteRoom(room._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: '5px' }}
                    >🗑️</button>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{room.roomNumber}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '8px' }}>{room.type}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: room.isAvailable ? '#10b981' : '#f43f5e' }}>
                    {room.isAvailable ? 'FREE' : 'FULL'}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ADD/EDIT ROOM MODAL */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              className="glass-card" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ width: '100%', maxWidth: '500px', border: '1px solid var(--accent-blue)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{editingRoom ? 'Edit Room 🏠' : 'Add New Room 🏠'}</h2>
                <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.5rem' }}>×</button>
              </div>
              <form onSubmit={handleRoomSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input type="text" className="form-input" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" className="form-input" value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: Number(e.target.value)})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select className="form-select" value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                      <option value="1-Seater">1-Seater</option>
                      <option value="2-Seater">2-Seater</option>
                      <option value="3-Seater">3-Seater</option>
                      <option value="4-Seater">4-Seater</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Floor</label>
                    <input type="number" className="form-input" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Max Capacity</label>
                  <input type="number" className="form-input" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea className="form-textarea" value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} rows={3}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
