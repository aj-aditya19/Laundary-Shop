import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Plus, Search, UserPlus } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatCard, OrderRow, LoadingSpinner, EmptyState } from '../../components/dashboard/DashboardWidgets';
import { analyticsAPI, orderAPI, customerAPI, staffAPI } from '../../services/api';
import { orderStatuses } from '../../data';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'home';
  const titles = {
    home:      'Admin Dashboard',
    orders:    'Order Management',
    customers: 'Customers',
    staff:     'Staff Management',
    analytics: 'Analytics',
  };

  return (
    <DashboardLayout title={titles[tab] || 'Dashboard'}>
      {tab === 'home'      && <AdminHome />}
      {tab === 'orders'    && <AdminOrders />}
      {tab === 'customers' && <AdminCustomers />}
      {tab === 'staff'     && <AdminStaff />}
      {tab === 'analytics' && <AdminAnalytics />}
    </DashboardLayout>
  );
}

/* ---- Home Tab ---- */
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

  const chartStyle = {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 12,
  };

  return (
    <div>
      <div className="stat-cards-row">
        <StatCard label="Today's Revenue" value={`₹${stats?.todayRevenue || 0}`}  icon="💰" color="#4caf50" index={0} />
        <StatCard label="Month Revenue"   value={`₹${stats?.monthRevenue || 0}`}  icon="📈" color="#614668" index={1} />
        <StatCard label="Pending Orders"  value={stats?.pendingOrders || 0}        icon="⏳" color="#f59e0b" index={2} />
        <StatCard label="Ready Pickup"    value={stats?.readyOrders || 0}          icon="🎉" color="#4caf50" index={3} />
      </div>

      <div className="stat-cards-row" style={{ marginBottom: 24 }}>
        <StatCard label="Today's Orders"      value={stats?.todayOrders || 0}        icon="📦" color="#5D748E" index={4} />
        <StatCard label="Month Orders"        value={stats?.monthOrders || 0}        icon="📅" color="#5D748E" index={5} />
        <StatCard label="Delivered This Month" value={stats?.deliveredThisMonth || 0} icon="✅" color="#4caf50" index={6} />
        <StatCard label="Total Customers"     value={stats?.totalCustomers || 0}    icon="👥" color="#614668" index={7} />
      </div>

      {/* Revenue Chart */}
      {stats?.revenueChart && (
        <div className="chart-card">
          <h2>Revenue – Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.revenueChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={chartStyle} formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Garment stats + orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {stats?.garmentStats && (
          <div className="card">
            <h2 style={{ marginBottom: 16, fontSize: '1rem' }}>Top Garments</h2>
            {stats.garmentStats.slice(0, 6).map((g, i) => (
              <div key={g._id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)', textTransform: 'capitalize' }}>
                    {i + 1}. {g._id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{g.count} pcs</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(g.count / stats.garmentStats[0].count) * 100}%`,
                    background: 'var(--primary)',
                    borderRadius: 99,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="data-table-wrap">
          <div className="data-table-header">
            <h2>Recent Orders</h2>
            <button onClick={() => navigate('/dashboard?tab=orders')}>View all →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Tag ID', 'Customer', 'Status', 'Amount', 'Date', 'Payment'].map(h => (
                    <th key={h}>{h}</th>
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

/* ---- Orders Tab ---- */
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

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="field-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon"><Search size={16} /></span>
          <input
            className="input-field pl-11"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {orderStatuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/orders/create')}>
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{orders.length} orders</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Tag ID', 'Customer', 'Status', 'Amount', 'Date', 'Payment'].map(h => (
                    <th key={h}>{h}</th>
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
        )}
      </div>
    </div>
  );
}

/* ---- Customers Tab ---- */
function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerAPI.getCustomers({ search: search || undefined });
      setCustomers(data.customers);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

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
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="field-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon"><Search size={16} /></span>
          <input
            className="input-field pl-11"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}
        >
          <input
            className="input-field"
            style={{ flex: 1, minWidth: 140 }}
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input-field"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input-field"
            style={{ flex: 1, minWidth: 130 }}
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={adding} style={{ minWidth: 72 }}>
            {adding ? <span className="spinner" /> : 'Add'}
          </button>
        </form>
      )}

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customers.length} customers</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div>
            {customers.map(c => (
              <div
                key={c._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#f5eef6', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: 'var(--primary)',
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.phone} • {c.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Staff Tab ---- */
function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'staff' });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await staffAPI.getStaff();
      setStaff(data.staff);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await staffAPI.createStaff(form);
      toast.success('Staff added! Default password is their phone number.');
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', role: 'staff' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await staffAPI.updateStaff(s._id, { isActive: !s.isActive });
      load();
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Staff Members</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}
        >
          <input className="input-field" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <select className="select-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" className="btn btn-primary" disabled={adding}>
            {adding ? <span className="spinner" /> : 'Add Staff'}
          </button>
        </form>
      )}

      <div className="data-table-wrap">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div>
            {staff.map(s => (
              <div
                key={s._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#f5eef6', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: 'var(--primary)',
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email} • {s.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{s.role}</span>
                  <button
                    onClick={() => toggleActive(s)}
                    className="btn btn-sm btn-ghost"
                    style={{
                      color: s.isActive ? '#2e7d32' : '#c62828',
                      borderColor: s.isActive ? '#c3e6cb' : '#f5c6c6',
                    }}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Analytics Tab ---- */
function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const chartStyle = { background: '#fff', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 12 };

  return (
    <div>
      <div className="stat-cards-row" style={{ marginBottom: 24 }}>
        <StatCard label="Month Revenue"   value={`₹${stats?.monthRevenue || 0}`}    icon="💰" color="#4caf50" index={0} />
        <StatCard label="Month Orders"    value={stats?.monthOrders || 0}            icon="📦" color="#614668" index={1} />
        <StatCard label="Delivered"       value={stats?.deliveredThisMonth || 0}     icon="✅" color="#5D748E" index={2} />
        <StatCard label="Total Customers" value={stats?.totalCustomers || 0}         icon="👥" color="#f59e0b" index={3} />
      </div>

      {stats?.revenueChart && (
        <div className="chart-card">
          <h2>Revenue &amp; Orders — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.revenueChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartStyle} />
              <Line yAxisId="left"  type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders"  stroke="#4caf50"      strokeWidth={2} dot={{ fill: '#4caf50', r: 4 }}      name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats?.garmentStats && (
        <div className="chart-card">
          <h2>Top Garment Types</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.garmentStats} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 70 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="_id" tick={{ fill: 'var(--text)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartStyle} formatter={v => [v, 'Pieces']} />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
