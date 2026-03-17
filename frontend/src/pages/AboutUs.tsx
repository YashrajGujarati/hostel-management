import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const AboutUs = () => {
  return (
    <div className="section" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-badge">✨ Discover Our Story</div>
        <h2 className="section-title">About Hostel Sphere</h2>
        <p className="section-subtitle">A premier living space designed for the modern student.</p>
      </motion.div>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src="/hostel-building.png" 
              alt="Hostel Sphere Building" 
              style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }} 
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Our Journey</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              Established in 2024, **Hostel Sphere** began with a simple mission: to redefine student living. We realized that for a student to excel, they need more than just a room; they need an environment that fosters growth, community, and peace of mind.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              From a single building to a premium network of student residences, our commitment to safety, nutrition, and comfort has never wavered. We are proud to be the home away from home for hundreds of students across the city.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="dashboard-grid" 
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Our Mission</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>To provide a secure, tech-enabled, and vibrant living ecosystem for students.</p>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
            <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Community First</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>We believe in the power of shared experiences and collaborative growth.</p>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛠️</div>
            <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Management</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Professional staff available 24/7 to ensure your comfort and safety.</p>
          </div>
        </motion.div>

        <div style={{ background: 'var(--bg-glass)', borderRadius: '32px', padding: '3rem', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
          <Logo size={80} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>The Hostel Sphere Brand</h3>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            The name **Sphere** represents completeness and unity. Within our sphere, every student is integral. We provide the structure, and you provide the life. Together, we create a world of possibilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
