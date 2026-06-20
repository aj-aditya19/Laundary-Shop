import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Sparkles, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Track Order', href: '/track' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNav = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100); }
      else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else navigate(href);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-navy-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-all duration-300">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Sparkle <span className="gradient-text">DC</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={logout} className="text-white/40 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-900/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <button key={link.label} onClick={() => handleNav(link.href)} className="w-full text-left text-white/70 hover:text-white text-sm font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-all">
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                {user ? (
                  <>
                    <button onClick={() => { navigate('/dashboard'); setMobileOpen(false); }} className="btn-primary text-sm">Dashboard</button>
                    <button onClick={logout} className="btn-ghost text-sm">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center block">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center block">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
