import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Users, FileText, BarChart3,
  Bell, Settings, LogOut, Menu, X, Sparkles, UserCheck, Search
} from 'lucide-react';

const NAV_CONFIG = {
  customer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Orders', icon: Package, path: '/dashboard?tab=orders' },
    { label: 'Invoices', icon: FileText, path: '/dashboard?tab=invoices' },
    { label: 'Notifications', icon: Bell, path: '/dashboard?tab=notifications' },
    { label: 'Profile', icon: Settings, path: '/dashboard?tab=profile' },
  ],
  staff: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders', icon: Package, path: '/dashboard?tab=orders' },
    { label: 'Customers', icon: Users, path: '/dashboard?tab=customers' },
    { label: 'Create Order', icon: FileText, path: '/dashboard/orders/create' },
  ],
  manager: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders', icon: Package, path: '/dashboard?tab=orders' },
    { label: 'Customers', icon: Users, path: '/dashboard?tab=customers' },
    { label: 'Staff', icon: UserCheck, path: '/dashboard?tab=staff' },
    { label: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics' },
    { label: 'Create Order', icon: FileText, path: '/dashboard/orders/create' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders', icon: Package, path: '/dashboard?tab=orders' },
    { label: 'Customers', icon: Users, path: '/dashboard?tab=customers' },
    { label: 'Staff', icon: UserCheck, path: '/dashboard?tab=staff' },
    { label: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics' },
    { label: 'Create Order', icon: FileText, path: '/dashboard/orders/create' },
  ],
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_CONFIG[user?.role] || NAV_CONFIG.customer;

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard' && !location.search) return true;
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname === path;
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">Sparkle DC</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 glass rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white font-medium text-sm truncate">{user?.name}</div>
            <div className="text-white/40 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); if (mobile) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon size={17} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <Link to="/track" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all">
          <Search size={17} />
          Track Order
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-navy-900/60 backdrop-blur border-r border-white/5 fixed h-full z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-navy-900 border-r border-white/5 z-50 lg:hidden flex flex-col"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/5">
                  <X size={20} />
                </button>
              </div>
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-navy-900/60 backdrop-blur border-b border-white/5 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display font-semibold text-white text-lg">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/track" className="text-white/40 hover:text-white/70 p-2 rounded-lg hover:bg-white/5 transition-all hidden sm:flex">
              <Search size={18} />
            </Link>
            <button onClick={() => navigate('/dashboard?tab=notifications')} className="text-white/40 hover:text-white/70 p-2 rounded-lg hover:bg-white/5 transition-all relative">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
