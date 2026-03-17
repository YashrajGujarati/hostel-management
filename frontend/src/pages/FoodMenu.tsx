import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import API from '../apiConfig';

const FoodMenu = () => {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];

  useEffect(() => {
    axios.get(`${API}/food-menu`).then(r => setMenu(r.data)).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;

  return (
    <div className="section" style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-badge">🍽️ Mess Menu</div>
        <h2 className="section-title">Weekly Food Schedule</h2>
        <p className="section-subtitle">Nutritious and delicious meals served daily. Today is <strong>{todayName}</strong>.</p>
      </motion.div>

      <motion.div className="food-menu-grid" variants={container} initial="hidden" animate="show">
        {menu.map(day => (
          <motion.div key={day._id} className={`food-day-card ${day.day === todayName ? 'today' : ''}`} variants={item}>
            <div className="food-day-header">
              <h3>{day.day}</h3>
              {day.day === todayName && <span className="today-badge">TODAY</span>}
            </div>
            <div className="food-meal">
              <div className="food-meal-time morning">☀️ Morning (Breakfast)</div>
              <div className="food-meal-items">{day.meals.morning}</div>
            </div>
            <div className="food-meal">
              <div className="food-meal-time afternoon">🌤️ Afternoon (Lunch)</div>
              <div className="food-meal-items">{day.meals.afternoon}</div>
            </div>
            <div className="food-meal">
              <div className="food-meal-time night">🌙 Night (Dinner)</div>
              <div className="food-meal-items">{day.meals.night}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {menu.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>Menu not available</h3>
          <p>The weekly food menu hasn't been set up yet.</p>
        </div>
      )}
    </div>
  );
};

export default FoodMenu;
