import { motion } from 'framer-motion';

const galleryItems = [
  { src: '/hostel-building.png', title: 'Main Campus', category: 'Building' },
  { src: '/room-single.png', title: 'Luxury Single Room', category: 'Rooms' },
  { src: '/hostel-mess.png', title: 'Dining Hall', category: 'Mess' },
  { src: '/hostel-building.png', title: 'Entrance Plaza', category: 'Building' },
  { src: '/room-double.png', title: 'Double Sharing Room', category: 'Rooms' },
  { src: '/room-triple.png', title: 'Triple sharing Room', category: 'Rooms' },
];

const Gallery = () => {
  return (
    <div className="section" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📸 Visual Tour</div>
        <h2 className="section-title">Hostel Gallery</h2>
        <p className="section-subtitle">Take a glimpse into your future home across our campus.</p>
      </motion.div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem',
        }}>
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              className="room-card"
              style={{ padding: 0, overflow: 'hidden', cursor: 'zoom-in' }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <img 
                src={item.src} 
                alt={item.title} 
                style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '1.5rem' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--accent-cyan)', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em' 
                }}>
                  {item.category}
                </span>
                <h4 style={{ color: 'white', fontWeight: 700, marginTop: '0.5rem' }}>{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
