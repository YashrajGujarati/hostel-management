import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import API from '../apiConfig';

const Complaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state || {};

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(initialState.openForm || false);
  const [category, setCategory] = useState(initialState.category || 'Staff');
  const [subject, setSubject] = useState(initialState.subject || '');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(`${API}/complaints`);
      setComplaints(data);
    } catch { }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await axios.post(`${API}/complaints`, { category, subject, description });
      setSuccess('Complaint submitted successfully! It has been sent directly to the hostel management.');
      setCategory('Staff');
      setSubject('');
      setDescription('');
      setShowForm(false);
      await fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit');
    }
    setSubmitting(false);
    setTimeout(() => { setSuccess(''); setError(''); }, 5000);
  };

  if (loading) return <div className="loading min-h-screen pt-20"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex-between flex-wrap gap-4">
          <div>
            <h1>Complaints 📝</h1>
            <p>Submit and track your complaints. Messages are sent directly to the hostel owner.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Complaint'}
          </button>
        </div>
      </motion.div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card mb-8"
        >
          <h3 className="text-lg font-bold mb-4">Submit New Complaint</h3>
          <p className="text-sm text-amber mb-4">
            ⚠️ Note: Complaints cannot be edited or deleted after submission.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" title="Complaint Category" className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Staff">Staff</option>
                <option value="Medical">Medical</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input id="subject" title="Subject" type="text" className="form-input" placeholder="Brief subject of complaint" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" title="Description" className="form-textarea" placeholder="Describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Submitting...' : '🚨 Submit Complaint'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="complaints-list">
        {complaints.map(c => (
          <motion.div
            key={c._id}
            className="complaint-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="complaint-header">
              <div className="flex items-center gap-2">
                <span className={`complaint-category ${c.category}`}>{c.category}</span>
              </div>
              <span className={`complaint-status ${c.status.replace(' ', '-')}`}>{c.status}</span>
            </div>
            <div className="complaint-subject">{c.title || c.subject}</div>
            <div className="complaint-description">{c.description}</div>
            {(c.comment || c.adminResponse) && (
              <div className="complaint-response">
                <div className="complaint-response-label">🏨 Owner's Response</div>
                <p>{c.comment || c.adminResponse}</p>
              </div>
            )}
            <div className="complaint-meta">
              Submitted on {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {c.resolvedAt && ` • Resolved on ${new Date(c.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </div>
          </motion.div>
        ))}
      </div>

      {complaints.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No complaints yet</h3>
          <p>Great! You haven't filed any complaints.</p>
        </div>
      )}
    </div>
  );
};

export default Complaints;
