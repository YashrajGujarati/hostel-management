import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const AboutUs = () => {
  return (
    <div className="section pt-32 min-h-screen">
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

      <div className="container max-w-1000 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src="/hostel-building.png" 
              alt="Hostel Sphere Building" 
              className="w-full rounded-3xl shadow-lg" 
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-extrabold text-white mb-6">Our Journey</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Established in 2024, **Hostel Sphere** began with a simple mission: to redefine student living. We realized that for a student to excel, they need more than just a room; they need an environment that fosters growth, community, and peace of mind.
            </p>
            <p className="text-secondary leading-relaxed">
              From a single building to a premium network of student residences, our commitment to safety, nutrition, and comfort has never wavered. We are proud to be the home away from home for hundreds of students across the city.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="dashboard-grid grid-auto-fit gap-8 mb-16" 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="stat-card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="font-extrabold text-white mb-2">Our Mission</h4>
            <p className="text-sm text-muted">To provide a secure, tech-enabled, and vibrant living ecosystem for students.</p>
          </div>
          <div className="stat-card text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h4 className="font-extrabold text-white mb-2">Community First</h4>
            <p className="text-sm text-muted">We believe in the power of shared experiences and collaborative growth.</p>
          </div>
          <div className="stat-card text-center">
            <div className="text-4xl mb-4">🛠️</div>
            <h4 className="font-extrabold text-white mb-2">Management</h4>
            <p className="text-sm text-muted">Professional staff available 24/7 to ensure your comfort and safety.</p>
          </div>
        </motion.div>

        <div className="bg-glass rounded-3xl p-12 border-glass text-center">
          <div className="flex-center mb-6">
            <Logo size={80} />
          </div>
          <h3 className="text-4xl font-black text-white mb-4">The Hostel Sphere Brand</h3>
          <p className="max-w-700 mx-auto text-secondary leading-relaxed">
            The name **Sphere** represents completeness and unity. Within our sphere, every student is integral. We provide the structure, and you provide the life. Together, we create a world of possibilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
