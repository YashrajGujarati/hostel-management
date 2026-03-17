import { motion } from 'framer-motion';

const Rules = () => {
  const ruleCategories = [
    {
      title: '🕐 Timings & Entry',
      rules: [
        'Campus entry/exit time: 6:00 AM to 10:00 PM.',
        'Late entry requires prior written approval from the warden.',
        'Visitors are only allowed in the common lobby area.',
        'Guest stay in rooms is strictly prohibited.'
      ]
    },
    {
      title: '🧼 Cleanliness & Hygiene',
      rules: [
        'Rooms must be kept tidy at all times.',
        'Daily cleaning service access must be provided.',
        'Waste must be disposed of only in designated bins.',
        'Cooking inside rooms (except shared pantry) is not allowed.'
      ]
    },
    {
      title: '🔒 Security & Asset Care',
      rules: [
        'ID cards must be carried while inside the campus.',
        'Any damage to hostel property will result in a fine.',
        'Management is not responsible for personal valuables.',
        'The use of heavy electrical appliances in rooms is restricted.'
      ]
    },
    {
      title: '💳 Payment & Admin',
      rules: [
        'Monthly fees must be paid before the 5th of every month.',
        'Security deposit is refundable only after a 1-month notice.',
        'Any change in personal contact info must be updated immediately.',
        'Discipline is priority; any misbehavior will lead to expulsion.'
      ]
    }
  ];

  return (
    <div className="section" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📜 Compliance</div>
        <h2 className="section-title">Rules & Regulations</h2>
        <p className="section-subtitle">Please adhere to these guidelines to ensure a harmonious environment.</p>
      </motion.div>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {ruleCategories.map((cat, i) => (
            <motion.div 
              key={i}
              className="stat-card"
              style={{ textAlign: 'left', padding: '2.5rem' }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 style={{ color: 'var(--accent-cyan)', fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                {cat.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cat.rules.map((rule, ri) => (
                  <li key={ri} style={{ 
                    position: 'relative', 
                    paddingLeft: '1.5rem', 
                    marginBottom: '1rem', 
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6'
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent-cyan)' }}>•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div style={{ 
          marginTop: '4rem', 
          padding: '2.5rem', 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '24px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#ef4444', fontWeight: 800, marginBottom: '0.5rem' }}>⚠️ Important Notice</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Violating these rules may result in strict disciplinary action or cancellation of the hostel admit card.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rules;
