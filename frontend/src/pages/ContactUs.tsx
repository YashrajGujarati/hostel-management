import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const mockReviews = [
  { id: 1, name: 'Aarav Mehta', rating: 5, comment: 'The best hostel experience I have had so far! The facilities are top-notch.', date: '2 days ago' },
  { id: 2, name: 'Sneha Patel', rating: 4, comment: 'Very clean and safe. The food menu is actually quite good and varied.', date: '1 week ago' },
  { id: 3, name: 'Rohan Sharma', rating: 5, comment: 'Great community. The study rooms are quiet and perfect for exams.', date: '2 weeks ago' },
];

const ContactUs = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }
    setReviewSubmitting(true);
    setTimeout(() => {
      const addedReview = {
        id: Date.now(),
        name: user.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: 'Just now'
      };
      setReviews([addedReview, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      setReviewSubmitting(false);
      toast.success("Thank you for your feedback! ✨");
    }, 1000);
  };

  return (
    <div className="section" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📞 Get in Touch</div>
        <h2 className="section-title">Contact & Feedback</h2>
        <p className="section-subtitle">Have questions or want to share your experience? We're here 24/7.</p>
      </motion.div>

      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
          
          {/* Info & Reviews Side */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="stat-card" 
              style={{ marginBottom: '2rem' }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '2rem' }}>Contact Information</h3>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    123 Hostel Sphere Heights, Ahmedabad, 380001
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📞</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>+91 98765 43210</p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✉️</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>hello@hostelsphere.com</p>
              </div>
            </motion.div>

            {/* Recent Reviews List within Contact Page */}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '1.5rem' }}>Community Reviews</h3>
              <AnimatePresence>
                {reviews.slice(0, 3).map((rev) => (
                  <motion.div 
                    key={rev.id}
                    className="stat-card"
                    style={{ textAlign: 'left', marginBottom: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <div style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
                         {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                       </div>
                       <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                    </div>
                    <p style={{ color: 'white', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{rev.comment}"</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>— {rev.name}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Combined Form Side */}
          <div>
            <div className="tabs" style={{ marginBottom: '2rem' }}>
               <button className="tab active">Send Message</button>
            </div>
            
            <div className="auth-card" style={{ maxWidth: '100%', background: 'var(--bg-glass)' }}>
              <form onSubmit={handleMessageSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Your Message</label>
                  <textarea className="form-input" style={{ minHeight: '100px' }} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', background: 'rgba(255,255,255,0.03)', marginTop: '2rem' }}>
               <h4 style={{ color: 'white', marginBottom: '1rem' }}>Submit a Review</h4>
               <form onSubmit={handleReviewSubmit}>
                 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                   {[1, 2, 3, 4, 5].map(star => (
                     <span key={star} onClick={() => setNewReview({ ...newReview, rating: star })} style={{ cursor: 'pointer', fontSize: '1.2rem', color: star <= newReview.rating ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)' }}>★</span>
                   ))}
                 </div>
                 <textarea className="form-input" placeholder="Your experience..." style={{ minHeight: '80px', fontSize: '0.9rem' }} value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} required />
                 {user ? (
                   <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} disabled={reviewSubmitting}>
                     {reviewSubmitting ? 'Posting...' : 'Post Review'}
                   </button>
                 ) : (
                   <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-rose)', marginTop: '0.5rem' }}>Login to post a review</div>
                 )}
               </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
