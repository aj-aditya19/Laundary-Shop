import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';

// Particle canvas
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// Animated washing machine SVG
function WashingMachine3D() {
  return (
    <motion.div
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]"
    >
      {/* Glow behind machine */}
      <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-3xl scale-75" />
      <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0c1f35" />
          </linearGradient>
          <linearGradient id="drumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Machine body */}
        <rect x="30" y="40" width="260" height="260" rx="24" fill="url(#bodyGrad)" filter="url(#shadow)" />
        <rect x="30" y="40" width="260" height="260" rx="24" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />

        {/* Top panel */}
        <rect x="30" y="40" width="260" height="50" rx="24" fill="#1e293b" />
        <rect x="30" y="66" width="260" height="24" fill="#1e293b" />

        {/* Control dots */}
        <circle cx="70" cy="65" r="8" fill="#0ea5e9" opacity="0.9" />
        <circle cx="95" cy="65" r="5" fill="#334155" />
        <circle cx="113" cy="65" r="5" fill="#334155" />
        <rect x="160" y="57" width="70" height="16" rx="4" fill="#0f172a" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />
        <text x="168" y="69" fill="#38BDF8" fontSize="8" fontFamily="monospace">32°C</text>

        {/* Door circle outer */}
        <circle cx="160" cy="185" r="100" fill="#0f172a" stroke="rgba(56,189,248,0.15)" strokeWidth="2" />
        <circle cx="160" cy="185" r="92" fill="url(#doorGrad)" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />

        {/* Drum */}
        <circle cx="160" cy="185" r="72" fill="url(#drumGrad)" opacity="0.15" />
        <circle cx="160" cy="185" r="72" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="2" />

        {/* Drum holes pattern */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 160 + 50 * Math.cos(rad);
          const y = 185 + 50 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="5" fill="rgba(56,189,248,0.3)" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />;
        })}
        <circle cx="160" cy="185" r="22" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
        <circle cx="160" cy="185" r="10" fill="rgba(56,189,248,0.3)" />

        {/* Door handle */}
        <rect x="238" y="178" width="18" height="14" rx="7" fill="#334155" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />

        {/* Bottom panel */}
        <rect x="44" y="277" width="232" height="15" rx="4" fill="#1e293b" />
        <rect x="56" y="281" width="40" height="7" rx="3.5" fill="#334155" />
        <rect x="104" y="281" width="40" height="7" rx="3.5" fill="#334155" />

        {/* Spinning animation overlay */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 185px' }}
        >
          <circle cx="160" cy="135" r="6" fill="rgba(56,189,248,0.6)" />
          <circle cx="207" cy="210" r="4" fill="rgba(6,182,212,0.5)" />
          <circle cx="113" cy="210" r="4" fill="rgba(14,165,233,0.5)" />
        </motion.g>
      </svg>

      {/* Floating clothes bubbles */}
      {['👔', '🥻', '🧥', '👗', '👖'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none"
          style={{ top: `${15 + i * 15}%`, left: i % 2 === 0 ? '-20%' : '110%' }}
          animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          <div className="glass rounded-xl p-2 shadow-lg shadow-sky-500/10">{emoji}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const navigate = useNavigate();

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-navy-950">
      <ParticleCanvas />

      {/* Background gradients */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-sm">Now accepting digital tracking</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6"
            >
              Professional<br />
              <span className="gradient-text text-glow">Dry Cleaning</span>
              <br />& Laundry Services
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Track your garments digitally, receive notifications, and collect your clothes with complete confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <button onClick={() => navigate('/track')} className="btn-primary flex items-center justify-center gap-2">
                <Search size={18} />
                Track My Order
              </button>
              <button onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost flex items-center justify-center gap-2">
                View Services
                <ArrowRight size={18} />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex gap-8 justify-center lg:justify-start"
            >
              {[
                { value: '5000+', label: 'Garments Cleaned' },
                { value: '1200+', label: 'Happy Customers' },
                { value: '99%', label: 'Satisfaction Rate' },
              ].map(stat => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="font-display font-bold text-2xl gradient-text">{stat.value}</div>
                  <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Machine */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
            className="flex justify-center"
          >
            <WashingMachine3D />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-sky-400" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
