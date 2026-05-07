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
    const [localPart, domain] = email.split('@');
    return `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.slice(-1)}@${domain}`;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

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

  if (loading) return <div className="loading min-h-screen pt-20"><div className="spinner"></div></div>;
  if (!user) return null;

  const pendingComplaints = (complaints || []).filter(c => c.status === 'Pending' || c.status === 'Open').length;
  const availableRooms = (rooms || []).filter(r => r.isAvailable).length;
  const totalRevenue = (bills || []).filter(b => b.status === 'Paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);

  return (
    <div className="dashboard">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Admin Dashboard 🏨</h1>
        <p>Manage hostel operations, complaints, and payments.</p>
      </motion.div>

      <motion.div className="dashboard-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="stat-card">
          <div className="stat-card-icon">🚨</div>
          <div className="stat-card-value text-amber">
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
        className="glass-card mt-6 p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-between items-center mb-8">
           <h3 className="text-white font-extrabold text-1.3rem">📈 Performance Insights</h3>
           <div className="text-xs text-muted">Real-time Data Sync</div>
        </div>
        
        <div className="w-full h-300">
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

      <div className="tabs mb-10 bg-glass p-1-5 rounded-xl">
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
                <div className="flex-wrap items-center gap-2 flex">
                  <span className={`complaint-category ${c.category}`}>{c.category}</span>
                  <span className="text-sm text-muted">by {c.studentId?.name || 'Unknown'}</span>
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
                        <label htmlFor="resolve-status">Status</label>
                        <select id="resolve-status" title="Resolve Status" className="form-select" value={resolveStatus} onChange={e => setResolveStatus(e.target.value)}>
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
                      <div className="flex gap-2">
                        <button className="btn btn-emerald btn-sm" onClick={() => resolveComplaint(c._id)}>Submit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setResolveId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm mt-4"
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
            <div key={b._id} className="complaint-card flex-between">
              <div>
                <div className="complaint-header">
                  <span className={`complaint-status ${b.status === 'Paid' ? 'Resolved' : 'Pending'}`}>{b.status || 'Unpaid'}</span>
                  <span className="text-sm text-muted">
                    {new Date(b.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="complaint-subject">₹{(b.totalAmount || b.amount || 0).toLocaleString()} — {b.durationLabel || 'Monthly'}</div>
                <div className="complaint-description">
                  {b.studentId?.name || 'Unknown student'} • Room {b.studentId?.roomId?.roomNumber || 'N/A'}
                </div>
              </div>
              {b.status === 'Paid' && (
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
          <table className="w-full mt-4 text-white border-collapse">
            <thead>
              <tr className="bg-glass text-left">
                <th className="p-4">Student</th>
                <th className="p-4">Room Preference</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.filter(s => s.bookingStatus !== 'None').map(s => (
                <tr key={s._id} className="border-b-glass">
                  <td className="p-4">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs opacity-60 cursor-pointer" onClick={() => toggleSensitive(s._id)}>
                      {showSensitive[s._id] ? s.phone : maskPhone(s.phone)} 👁️
                    </div>
                  </td>
                  <td className="p-4">{s.roomId?.roomNumber || 'Any Available'}</td>
                  <td className="p-4">
                    <span className={`complaint-status ${s.bookingStatus}`}>
                      {s.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="btn btn-emerald btn-sm" onClick={() => updateBooking(s._id, 'Approved')}>Approve</button>
                      <button className="btn btn-rose btn-sm" onClick={() => updateBooking(s._id, 'Rejected')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.filter(s => s.bookingStatus !== 'None').length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center opacity-50">No booking requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'students' && (
        <div className="complaints-list">
          <table className="w-full mt-4 text-white border-collapse">
            <thead>
              <tr className="bg-glass text-left">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Room</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-b-glass">
                  <td className="p-4">{s.name}</td>
                  <td className="p-4 opacity-70 cursor-pointer" onClick={() => toggleSensitive(s._id)}>
                    {showSensitive[s._id] ? s.email : maskEmail(s.email)} 👁️
                  </td>
                  <td className="p-4">{s.roomId ? `Room ${s.roomId.roomNumber || '?'}` : 'Unassigned'}</td>
                  <td className="p-4">
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
        <div className="p-4">
           <div className="flex justify-end mb-8">
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
                       <div className="grid gap-4 grid-cols-auto-140">
              {rooms.map(room => (
                <div 
                  key={room._id} 
                  className={`p-6 text-center relative transition-all rounded-2xl ${room.isAvailable ? 'bg-green-10 border border-green' : 'bg-red-10 border border-red'}`}
                >
                   <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => openEditRoom(room)}
                      className="bg-transparent border-none text-blue cursor-pointer text-xs p-1"
                    >✏️</button>
                    <button 
                      onClick={() => deleteRoom(room._id)}
                      className="bg-transparent border-none text-red cursor-pointer text-xs p-1"
                    >🗑️</button>
                  </div>
                  <div className="text-lg font-extrabold">{room.roomNumber}</div>
                  <div className="text-[0.65rem] opacity-70 mb-2">{room.type}</div>
                  <div className={`text-xs font-bold ${room.isAvailable ? 'text-green' : 'text-red'}`}>
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
          <div className="modal-overlay flex-center p-4 bg-black-80 backdrop-blur-md z-50 fixed inset-0">
            <motion.div 
              className="glass-card w-full max-w-500 border border-blue" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex-between mb-6">
                <h2 className="text-2xl">{editingRoom ? 'Edit Room 🏠' : 'Add New Room 🏠'}</h2>
                <button onClick={() => setShowRoomModal(false)} className="bg-transparent border-none text-white text-2xl cursor-pointer">×</button>
              </div>
              <form onSubmit={handleRoomSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="room-number">Room Number</label>
                    <input id="room-number" title="Room Number" placeholder="e.g. 101" type="text" className="form-input" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="room-price">Price (₹)</label>
                    <input id="room-price" title="Room Price" placeholder="e.g. 5000" type="number" className="form-input" value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="room-type">Room Type</label>
                    <select id="room-type" title="Room Type" className="form-select" value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                      <option value="1-Seater">1-Seater</option>
                      <option value="2-Seater">2-Seater</option>
                      <option value="3-Seater">3-Seater</option>
                      <option value="4-Seater">4-Seater</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="room-floor">Floor</label>
                    <input id="room-floor" title="Room Floor" placeholder="e.g. 1" type="number" className="form-input" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="room-capacity">Max Capacity</label>
                  <input id="room-capacity" title="Max Capacity" placeholder="e.g. 2" type="number" className="form-input" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="room-desc">Description (Optional)</label>
                  <textarea id="room-desc" title="Room Description" placeholder="Description..." className="form-textarea" value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} rows={3}></textarea>
                </div>
                <button type="submit" className="btn btn-primary mt-4">
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
