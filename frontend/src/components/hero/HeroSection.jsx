import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle, Clock, Star } from 'lucide-react';

// Simple static washing machine illustration using plain SVG
function WashingMachineIllustration() {
  return (
    <div className="hero-machine-wrap">
      <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
        {/* Machine body */}
        <rect x="20" y="30" width="240" height="240" rx="20" fill="#fff" stroke="#C6BCC0" strokeWidth="1.5" />

        {/* Top panel */}
        <rect x="20" y="30" width="240" height="48" rx="20" fill="#F2E1E1" />
        <rect x="20" y="55" width="240" height="23" fill="#F2E1E1" />

        {/* Control dots */}
        <circle cx="58" cy="56" r="9" fill="#614668" />
        <circle cx="82" cy="56" r="6" fill="#C6BCC0" />
        <circle cx="100" cy="56" r="6" fill="#C6BCC0" />

        {/* Display */}
        <rect x="148" y="46" width="72" height="20" rx="5" fill="#fff" stroke="#C6BCC0" strokeWidth="1" />
        <text x="156" y="60" fill="#614668" fontSize="9" fontFamily="monospace" fontWeight="700">32°C  WASH</text>

        {/* Door outer ring */}
        <circle cx="140" cy="170" r="96" fill="#F2E1E1" stroke="#C6BCC0" strokeWidth="2" />
        {/* Door inner ring */}
        <circle cx="140" cy="170" r="84" fill="#fff" stroke="#C6BCC0" strokeWidth="1.5" />

        {/* Drum */}
        <circle cx="140" cy="170" r="68" fill="none" stroke="#C6BCC0" strokeWidth="1" />
        <circle cx="140" cy="170" r="50" fill="#F2E1E1" stroke="#C6BCC0" strokeWidth="1" />

        {/* Drum holes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 140 + 58 * Math.cos(rad);
          const y = 170 + 58 * Math.sin(rad);
          return (
            <circle key={i} cx={x} cy={y} r="5" fill="#C6BCC0" stroke="#fff" strokeWidth="1" />
          );
        })}

        {/* Center hub */}
        <circle cx="140" cy="170" r="18" fill="#fff" stroke="#C6BCC0" strokeWidth="1.5" />
        <circle cx="140" cy="170" r="8" fill="#614668" />

        {/* Door handle */}
        <rect x="218" y="163" width="16" height="14" rx="7" fill="#C6BCC0" />

        {/* Bottom strip */}
        <rect x="34" y="255" width="212" height="12" rx="4" fill="#F2E1E1" />
        <rect x="46" y="258" width="40" height="6" rx="3" fill="#C6BCC0" />
        <rect x="94" y="258" width="40" height="6" rx="3" fill="#C6BCC0" />
      </svg>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  const trustItems = [
    { icon: <CheckCircle size={15} />, label: 'Digital Tracking' },
    { icon: <Clock size={15} />,       label: '24hr Notifications' },
    { icon: <Star size={15} />,        label: '99% Satisfaction' },
  ];

  return (
    <>
      {/* Main hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">

            {/* Left — text */}
            <div className="hero-content">
              <span className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                Now accepting digital tracking
              </span>

              <h1 className="hero-title">
                Professional<br />
                <span>Dry Cleaning</span><br />
                &amp; Laundry Services
              </h1>

              <p className="hero-desc">
                Track your garments digitally, receive notifications, and collect your clothes
                with complete confidence. Every garment photographed and documented.
              </p>

              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/track')}>
                  <Search size={18} />
                  Track My Order
                </button>
                <button
                  className="btn btn-ghost btn-lg"
                  onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Services
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="hero-stats">
                {[
                  { value: '5000+', label: 'Garments Cleaned' },
                  { value: '1200+', label: 'Happy Customers' },
                  { value: '99%',   label: 'Satisfaction Rate' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="hero-stat-num">{stat.value}</div>
                    <div className="hero-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — illustration */}
            <div className="hero-visual">
              <WashingMachineIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="hero-trust">
        <div className="container">
          <div className="hero-trust-inner">
            {trustItems.map(item => (
              <div key={item.label} className="hero-trust-item">
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
