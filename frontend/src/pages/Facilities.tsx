import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const facilities = [
  { icon: '📶', title: 'Free High-Speed WiFi', desc: 'Secure, unlimited internet access across every floor, perfect for online classes and streaming.' },
  { icon: '🍽️', title: 'Food / Mess', desc: 'Hygienic, home-style meals served three times a day. We prioritize nutrition and taste.' },
  { icon: '🔒', title: '24×7 Security', desc: 'CCTV surveillance, bio-metric access, and professional security guards for your peace of mind.' },
  { icon: '👔', title: 'Laundry Service', desc: 'Modern washing machines and professional cleaning services for all residents.' },
  { icon: '📚', title: 'Quiet Study Room', desc: 'Dedicated air-conditioned study spaces with comfortable seating for deep focus.' },
  { icon: '🏋️', title: 'Modern Gymnasium', desc: 'Equipped with the latest cardio and strength training machines to keep you fit.' },
  { icon: '🚰', title: 'Purified RO Water', desc: 'Clean, safe drinking water available through RO water purifiers on every floor.' },
  { icon: '⚡', title: '100% Power Backup', desc: 'Powerful industrial generators ensure you are never in the dark during a power cut.' },
  { icon: '🎮', title: 'Recreation Zone', desc: 'Common room with indoor games like Table Tennis, Carrom, and Chess.' },
];

const Facilities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFacilityClick = (title: string) => {
    if (!user) { navigate('/login'); return; }
    navigate('/complaints', { 
      state: { openForm: true, category: 'Maintenance', subject: `Report for ${title}` } 
    });
  };

  return (
    <div className="section pt-32 min-h-screen">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="section-badge">🎯 Premium Amenities</div>
        <h2 className="section-title">Exclusive Facilities</h2>
        <p className="section-subtitle">We go beyond housing to provide a complete lifestyle for students.</p>
      </motion.div>

      <div className="container max-w-1200 mx-auto px-8">
                <div className="facilities-grid grid gap-8 grid-cols-auto-320">
          {facilities.map((f, i) => (
            <motion.div 
              key={i} 
              className="facility-card p-10 text-left flex flex-col items-start"
              whileHover={{ y: -10, borderColor: 'var(--accent-cyan)' }}
              onClick={() => handleFacilityClick(f.title)}
            >
              <div className="text-5xl mb-6 p-4 bg-glass rounded-2xl">
                {f.icon}
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-4">{f.title}</h3>
              <p className="text-secondary leading-relaxed mb-6">{f.desc}</p>
              <div className="mt-auto text-rose font-bold text-xs cursor-pointer">
                🚩 Report Issue or Query
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Facilities;
