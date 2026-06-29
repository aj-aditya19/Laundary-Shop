import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Services',     href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Track Order',  href: '/track' },
    { label: 'Contact',      href: '#contact' },
  ];

  const handleNav = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">✨</div>
            <span className="navbar-logo-text">Sparkle <span>DC</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.label}>
                <button onClick={() => handleNav(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Auth Area */}
          <div className="navbar-auth">
            {user ? (
              <div className="navbar-user">
                <button
                  className="navbar-user-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>
                <div className="navbar-user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button className="navbar-logout-btn" onClick={logout} title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <button key={link.label} onClick={() => handleNav(link.href)}>
            {link.label}
          </button>
        ))}
        <div className="navbar-mobile-divider" />
        <div className="navbar-mobile-auth">
          {user ? (
            <>
              <button onClick={() => { navigate('/dashboard'); setMobileOpen(false); }} className="btn btn-primary">
                Dashboard
              </button>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-ghost">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost" style={{ textAlign: 'center' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
