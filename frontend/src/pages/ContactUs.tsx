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
    <div className="section pt-32 min-h-screen">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📞 Get in Touch</div>
        <h2 className="section-title">Contact & Feedback</h2>
        <p className="section-subtitle">Have questions or want to share your experience? We're here 24/7.</p>
      </motion.div>

      <div className="container max-w-1100 mx-auto px-4">
        <div className="grid gap-16 grid-cols-auto-350">
          
          {/* Info & Reviews Side */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="stat-card mb-8"
            >
              <h3 className="text-2xl font-extrabold text-white mb-8">Contact Information</h3>
              <div className="flex gap-6 mb-8">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-secondary text-sm m-0">
                    Munjka, Rajkot 360005
                  </p>
                </div>
              </div>
              <div className="flex gap-6 mb-8">
                <span className="text-xl">📞</span>
                <p className="text-secondary text-sm m-0">+91 63556 99781</p>
              </div>
              <div className="flex gap-6">
                <span className="text-xl">✉️</span>
                <p className="text-secondary text-sm m-0">hello@hostelsphere.com</p>
              </div>
            </motion.div>

            {/* Recent Reviews List within Contact Page */}
            <div className="mt-12">
              <h3 className="text-white font-extrabold mb-6">Community Reviews</h3>
              <AnimatePresence>
                {reviews.slice(0, 3).map((rev) => (
                  <motion.div 
                    key={rev.id}
                    className="stat-card text-left mb-4 p-6 bg-white-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex-between mb-2">
                       <div className="text-amber text-sm">
                         {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                       </div>
                       <span className="text-[0.7rem] text-muted">{rev.date}</span>
                    </div>
                    <p className="text-white text-sm italic mb-2">"{rev.comment}"</p>
                    <div className="text-xs text-cyan font-bold">— {rev.name}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Combined Form Side */}
          <div>
            <div className="tabs mb-8">
               <button className="tab active">Send Message</button>
            </div>
            
            <div className="auth-card w-full bg-glass">
              <form onSubmit={handleMessageSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input id="contact-name" title="Full Name" placeholder="John Doe" type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input id="contact-email" title="Email Address" placeholder="john@example.com" type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Your Message</label>
                                    <textarea id="contact-message" title="Your Message" placeholder="Write your message here..." className="form-input min-h-100" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>

            <div className="auth-card w-full mt-8 bg-white-3">
               <h4 className="text-white mb-4">Submit a Review</h4>
               <form onSubmit={handleReviewSubmit}>
                 <div className="flex gap-2 mb-4">
                   {[1, 2, 3, 4, 5].map(star => (
                                           <span key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className={`cursor-pointer text-xl ${star <= newReview.rating ? 'text-amber' : 'text-white-10'}`}>★</span>
                   ))}
                 </div>
                 <label htmlFor="review-comment" className="hidden-file-input">Your review</label>
                                   <textarea id="review-comment" title="Your review" className="form-input min-h-80 text-sm" placeholder="Your experience..." value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} required />
                 {user ? (
                   <button type="submit" className="btn btn-secondary btn-sm w-full mt-2" disabled={reviewSubmitting}>
                     {reviewSubmitting ? 'Posting...' : 'Post Review'}
                   </button>
                 ) : (
                   <div className="text-center text-xs text-rose mt-2">Login to post a review</div>
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
