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
    <div className="section pt-32 min-h-screen">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-badge">📜 Compliance</div>
        <h2 className="section-title">Rules & Regulations</h2>
        <p className="section-subtitle">Please adhere to these guidelines to ensure a harmonious environment.</p>
      </motion.div>

      <div className="container max-w-1000 mx-auto px-4">
        <div className="grid gap-8 grid-cols-auto-400">
          {ruleCategories.map((cat, i) => (
            <motion.div 
              key={i}
              className="stat-card text-left p-10"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-cyan font-extrabold mb-6 text-2xl">
                {cat.title}
              </h3>
              <ul className="list-none p-0">
                {cat.rules.map((rule, ri) => (
                  <li key={ri} className="relative pl-6 mb-4 text-secondary leading-relaxed">
                    <span className="absolute left-0 text-cyan">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-10 text-center bg-rose-5 border-rose-20 rounded-3xl">
          <h4 className="text-red font-extrabold mb-2">⚠️ Important Notice</h4>
          <p className="text-secondary text-sm">
            Violating these rules may result in strict disciplinary action or cancellation of the hostel admit card.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rules;
