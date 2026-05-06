import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password, phone);
      toast.success('Account Created Successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the server. Please check if the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h2>Create Account 🎓</h2>
          <p>Register to get started with Hostel Sphere</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input id="signup-name" type="text" className="form-input" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required title="Full Name" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input id="signup-email" type="email" className="form-input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required title="Email Address" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-phone">Phone Number</label>
            <input id="signup-phone" type="tel" className="form-input" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} required title="Phone Number" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" className="form-input" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required title="Password" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
