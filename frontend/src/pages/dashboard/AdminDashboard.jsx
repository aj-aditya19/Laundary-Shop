import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Plus, Search, UserPlus } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatCard, OrderRow, LoadingSpinner, EmptyState } from '../../components/dashboard/DashboardWidgets';
import { analyticsAPI, orderAPI, customerAPI, staffAPI, invoiceAPI } from '../../services/api';
import { orderStatuses, garmentTypes } from '../../data';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  const titles = { home: 'Admin Dashboard', orders: 'Order Management', customers: 'Customers', staff: 'Staff Management', analytics: 'Analytics' };

  return (
    <DashboardLayout title={titles[tab] || 'Dashboard'}>
      {tab === 'home' && <AdminHome />}
      {tab === 'orders' && <AdminOrders />}
      {tab === 'customers' && <AdminCustomers />}
      {tab === 'staff' && <AdminStaff />}
      {tab === 'analytics' && <AdminAnalytics />}
    </DashboardLayout>
  );
}

function AdminHome() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([analyticsAPI.getDashboard(), orderAPI.getOrders({ limit: 10 })])
      .then(([s, o]) => { setStats(s.data.stats); setOrders(o.data.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const chartTooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`₹${stats?.todayRevenue || 0}`} icon="💰" color="#10B981" index={0} />
        <StatCard label="Month Revenue" value={`₹${stats?.monthRevenue || 0}`} icon="📈" color="#38BDF8" index={1} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders || 0} icon="⏳" color="#F59E0B" index={2} />
        <StatCard label="Ready Pickup" value={stats?.readyOrders || 0} icon="🎉" color="#10B981" index={3} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Orders" value={stats?.todayOrders || 0} icon="📦" color="#8B5CF6" index={4} />
        <StatCard label="Month Orders" value={stats?.monthOrders || 0} icon="📅" color="#06B6D4" index={5} />
        <StatCard label="Delivered This Month" value={stats?.deliveredThisMonth || 0} icon="✅" color="#10B981" index={6} />
        <StatCard label="Total Customers" value={stats?.totalCustomers || 0} icon="👥" color="#EC4899" index={7} />
      </div>

      {/* Revenue Chart */}
      {stats?.revenueChart && (
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-5">Revenue – Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.revenueChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Garment stats + recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {stats?.garmentStats && (
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-4">Top Garments</h2>
            <div className="space-y-3">
              {stats.garmentStats.slice(0, 6).map((g, i) => (
                <div key={g._id} className="flex items-center gap-3">
                  <span className="text-white/30 text-xs w-4 font-mono">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 text-sm capitalize">{g._id}</span>
                      <span className="text-white/40 text-xs">{g.count} pcs</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(g.count / stats.garmentStats[0].count) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between">
            <h2 className="font-display font-semibold text-white">Recent Orders</h2>
            <button onClick={() => navigate('/dashboard?tab=orders')} className="text-sky-400 hover:text-sky-300 text-sm">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Tag ID', 'Customer', 'Status', 'Amount', 'Date', 'Payment'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order._id} order={order} onClick={() => navigate(`/dashboard/orders/${order._id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getOrders({ search: search || undefined, status: statusFilter || undefined, limit: 200 });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-field pl-10" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {orderStatuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button onClick={() => navigate('/dashboard/orders/create')} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> New Order
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center">
          <span className="text-white/40 text-sm">{orders.length} orders</span>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/5">
                {['Tag ID', 'Customer', 'Status', 'Amount', 'Date', 'Payment'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.map(order => <OrderRow key={order._id} order={order} onClick={() => navigate(`/dashboard/orders/${order._id}`)} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await customerAPI.getCustomers({ search: search || undefined }); setCustomers(data.customers); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await customerAPI.createCustomer(form);
      toast.success('Customer added!');
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-field pl-10" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      {showAdd && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleAdd}
          className="glass-card p-5 flex flex-col sm:flex-row gap-3">
          <input className="input-field flex-1" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field flex-1" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field flex-1" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <button type="submit" disabled={adding} className="btn-primary px-6 whitespace-nowrap">
            {adding ? <div className="w-4 h-4 spinner" /> : 'Add'}
          </button>
        </motion.form>
      )}

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5"><span className="text-white/40 text-sm">{customers.length} customers</span></div>
        {loading ? <LoadingSpinner /> : (
          <div className="divide-y divide-white/5">
            {customers.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400/30 to-cyan-400/30 flex items-center justify-center font-bold text-white/80 text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{c.name}</div>
                    <div className="text-white/40 text-xs">{c.phone} • {c.email}</div>
                  </div>
                </div>
                <div className="text-white/25 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'staff' });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await staffAPI.getStaff(); setStaff(data.staff); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setAdding(true);
    try {
      await staffAPI.createStaff(form);
      toast.success('Staff added! Default password is their phone number.');
      setShowAdd(false); setForm({ name: '', email: '', phone: '', role: 'staff' }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add staff'); }
    finally { setAdding(false); }
  };

  const toggleActive = async (s) => {
    try { await staffAPI.updateStaff(s._id, { isActive: !s.isActive }); load(); toast.success('Updated'); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-semibold text-white">Staff Members</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {showAdd && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleAdd}
          className="glass-card p-5 grid sm:grid-cols-5 gap-3">
          <input className="input-field" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" disabled={adding} className="btn-primary">{adding ? <div className="w-4 h-4 spinner mx-auto" /> : 'Add Staff'}</button>
        </motion.form>
      )}

      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="divide-y divide-white/5">
            {staff.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 flex items-center justify-center font-bold text-white/80 text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{s.name}</div>
                    <div className="text-white/40 text-xs">{s.email} • {s.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 capitalize">{s.role}</span>
                  <button onClick={() => toggleActive(s)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${s.isActive ? 'border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' : 'border-red-500/30 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(({ data }) => setStats(data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const chartTooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Month Revenue" value={`₹${stats?.monthRevenue || 0}`} icon="💰" color="#10B981" index={0} />
        <StatCard label="Month Orders" value={stats?.monthOrders || 0} icon="📦" color="#38BDF8" index={1} />
        <StatCard label="Delivered" value={stats?.deliveredThisMonth || 0} icon="✅" color="#8B5CF6" index={2} />
        <StatCard label="Total Customers" value={stats?.totalCustomers || 0} icon="👥" color="#F59E0B" index={3} />
      </div>

      {stats?.revenueChart && (
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-5">Revenue & Orders — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.revenueChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#38BDF8" strokeWidth={2} dot={{ fill: '#38BDF8', r: 4 }} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats?.garmentStats && (
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-5">Top Garment Types</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.garmentStats} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="_id" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={v => [v, 'Pieces']} />
              <Bar dataKey="count" fill="#38BDF8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
