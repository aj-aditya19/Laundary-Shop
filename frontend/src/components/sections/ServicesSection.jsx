import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { services } from '../../data';

const TABS = [
  { key: 'men', label: "Men's", icon: '👔' },
  { key: 'women', label: "Women's", icon: '👗' },
  { key: 'household', label: 'Household', icon: '🏠' },
];

function TiltCard({ service, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientY - cy) / (rect.height / 2)) * 8;
    const y = (-(e.clientX - cx) / (rect.width / 2)) * 8;
    setTilt({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.04 : 1})`,
        transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      }}
      className="glass-card p-6 cursor-pointer group relative overflow-hidden"
    >
      {/* Glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 rounded-2xl transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${hovered ? 'border-glow' : ''}`} />

      <div className="relative z-10">
        <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">{service.icon}</div>
        <h3 className="font-display font-semibold text-white text-lg mb-1">{service.name}</h3>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-sky-400 font-bold text-xl">₹{service.price}</span>
            <span className="text-white/30 text-sm ml-1">/ piece</span>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs">Ready in</div>
            <div className="text-white/70 text-sm font-medium">{service.time}</div>
          </div>
        </div>
        <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-500 rounded-full" />
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('men');

  return (
    <section id="services" className="py-24 relative bg-navy-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">What We Clean</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Professional cleaning for every garment type, handled with precision and care.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {services[activeTab].map((service, i) => (
            <TiltCard key={service.id} service={service} index={i} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/40 text-sm mb-4">Don't see your item? We clean almost anything.</p>
          <a href="#contact" className="text-sky-400 hover:text-sky-300 text-sm font-medium underline underline-offset-4 transition-colors">
            Contact us for custom pricing →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
