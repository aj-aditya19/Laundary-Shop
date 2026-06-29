import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Users, FileText, BarChart3,
  Bell, Settings, LogOut, Menu, X, UserCheck, Search
} from 'lucide-react';

const NAV_CONFIG = {
  customer: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Orders',     icon: Package,         path: '/dashboard?tab=orders' },
    { label: 'Invoices',      icon: FileText,        path: '/dashboard?tab=invoices' },
    { label: 'Notifications', icon: Bell,            path: '/dashboard?tab=notifications' },
    { label: 'Profile',       icon: Settings,        path: '/dashboard?tab=profile' },
  ],
  staff: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders',       icon: Package,         path: '/dashboard?tab=orders' },
    { label: 'Customers',    icon: Users,           path: '/dashboard?tab=customers' },
    { label: 'Create Order', icon: FileText,        path: '/dashboard/orders/create' },
  ],
  manager: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders',       icon: Package,         path: '/dashboard?tab=orders' },
    { label: 'Customers',    icon: Users,           path: '/dashboard?tab=customers' },
    { label: 'Staff',        icon: UserCheck,       path: '/dashboard?tab=staff' },
    { label: 'Analytics',    icon: BarChart3,       path: '/dashboard?tab=analytics' },
    { label: 'Create Order', icon: FileText,        path: '/dashboard/orders/create' },
  ],
  admin: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders',       icon: Package,         path: '/dashboard?tab=orders' },
    { label: 'Customers',    icon: Users,           path: '/dashboard?tab=customers' },
    { label: 'Staff',        icon: UserCheck,       path: '/dashboard?tab=staff' },
    { label: 'Analytics',    icon: BarChart3,       path: '/dashboard?tab=analytics' },
    { label: 'Create Order', icon: FileText,        path: '/dashboard/orders/create' },
  ],
};

function SidebarContent({ user, navItems, isActive, onNavClick, onLogout }) {
  return (
    <>
      {/* Logo */}
      <Link to="/" className="dash-sidebar-logo">
        <div className="dash-sidebar-logo-icon">✨</div>
        <span className="dash-sidebar-logo-text">Sparkle DC</span>
      </Link>

      {/* User info */}
      <div className="dash-user-block">
        <div className="dash-user-inner">
          <div className="dash-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="dash-user-name">{user?.name}</div>
            <div className="dash-user-role">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="dash-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`dash-nav-btn ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => onNavClick(item.path)}
            >
              <Icon size={16} />
              {item.label}
              {isActive(item.path) && <span className="dash-nav-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="dash-sidebar-bottom">
        <Link to="/track" className="dash-sidebar-bottom-btn">
          <Search size={16} />
          Track Order
        </Link>
        <button className="dash-sidebar-bottom-btn logout" onClick={onLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV_CONFIG[user?.role] || NAV_CONFIG.customer;

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard' && !location.search) return true;
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname === path;
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="dash-wrap">
      {/* Desktop sidebar */}
      <aside className="dash-sidebar">
        <SidebarContent
          user={user}
          navItems={navItems}
          isActive={isActive}
          onNavClick={handleNavClick}
          onLogout={logout}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="dash-mobile-overlay open"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`dash-mobile-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="dash-mobile-sidebar-close">
          <button onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          user={user}
          navItems={navItems}
          isActive={isActive}
          onNavClick={handleNavClick}
          onLogout={logout}
        />
      </div>

      {/* Main */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-header">
          <button className="dash-hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="dash-header-title">{title}</h1>
          <div className="dash-header-right">
            <Link to="/track" className="dash-header-icon-btn" title="Track Order">
              <Search size={17} />
            </Link>
            <button
              className="dash-header-icon-btn"
              title="Notifications"
              onClick={() => navigate('/dashboard?tab=notifications')}
            >
              <Bell size={17} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}
