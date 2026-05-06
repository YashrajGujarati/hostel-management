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
    <div className="section pt-32 min-h-screen">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📸 Visual Tour</div>
        <h2 className="section-title">Hostel Gallery</h2>
        <p className="section-subtitle">Take a glimpse into your future home across our campus.</p>
      </motion.div>

      <div className="container max-w-1200 mx-auto px-4">
                <div className="grid gap-6 grid-cols-auto-350">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              className="room-card p-0 overflow-hidden cursor-zoom-in"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <img 
                src={item.src} 
                alt={item.title} 
                className="w-full h-250 object-cover"
              />
              <div className="p-6">
                <span className="text-[0.7rem] text-cyan font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="text-white font-bold mt-2">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
