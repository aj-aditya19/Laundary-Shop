import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatCard, OrderRow, LoadingSpinner, EmptyState } from '../../components/dashboard/DashboardWidgets';
import { orderAPI, notificationAPI, invoiceAPI, analyticsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'home';
  const { user } = useAuth();

  const titleMap = {
    home:          `Welcome, ${user?.name?.split(' ')[0]}`,
    orders:        'My Orders',
    invoices:      'Invoices',
    notifications: 'Notifications',
    profile:       'Profile',
  };

  return (
    <DashboardLayout title={titleMap[tab] || 'Dashboard'}>
      {tab === 'home'          && <CustomerHome />}
      {tab === 'orders'        && <CustomerOrders />}
      {tab === 'invoices'      && <CustomerInvoices />}
      {tab === 'notifications' && <CustomerNotifications />}
      {tab === 'profile'       && <CustomerProfile />}
    </DashboardLayout>
  );
}

/* ---- Home Tab ---- */
function CustomerHome() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([analyticsAPI.getCustomerStats(), orderAPI.getOrders({ limit: 5 })])
      .then(([s, o]) => { setStats(s.data.stats); setOrders(o.data.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="stat-cards-row">
        <StatCard label="Total Orders"  value={stats?.totalOrders ?? 0}          icon="📦" color="#614668" index={0} />
        <StatCard label="Active Orders" value={stats?.activeOrders ?? 0}         icon="⚡" color="#f59e0b" index={1} />
        <StatCard label="Completed"     value={stats?.completedOrders ?? 0}      icon="✅" color="#4caf50" index={2} />
        <StatCard label="Total Spent"   value={`₹${stats?.totalSpent ?? 0}`}     icon="💳" color="#5D748E" index={3} />
      </div>

      <div className="data-table-wrap" style={{ marginBottom: 20 }}>
        <div className="data-table-header">
          <h2>Recent Orders</h2>
          <button onClick={() => navigate('/dashboard?tab=orders')}>View all →</button>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon="📭" title="No orders yet" desc="Visit our shop to drop off garments and get started" />
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
                  <OrderRow
                    key={order._id}
                    order={order}
                    onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="loyalty-card">
        <div>
          <h3 style={{ marginBottom: 4 }}>Loyalty Points</h3>
          <p style={{ fontSize: '0.85rem' }}>Earn 100 points for every ₹100 spent</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="loyalty-points">{stats?.loyaltyPoints ?? 0}</div>
          <div className="loyalty-label">points</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Orders Tab ---- */
function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const STATUS_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'received',      label: 'Received' },
    { value: 'washing',       label: 'Washing' },
    { value: 'dry_cleaning',  label: 'Dry Cleaning' },
    { value: 'ironing',       label: 'Ironing' },
    { value: 'quality_check', label: 'Quality Check' },
    { value: 'ready',         label: 'Ready' },
    { value: 'delivered',     label: 'Delivered' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getOrders({ status: statusFilter || undefined, limit: 50 });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="filter-pills">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-pill ${statusFilter === opt.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState icon="📭" title="No orders found" desc="No orders match the selected filter" />
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
                  <OrderRow
                    key={order._id}
                    order={order}
                    onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Invoices Tab ---- */
function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI.getInvoices()
      .then(({ data }) => setInvoices(data.invoices))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="data-table-wrap">
      <div className="data-table-header"><h2>My Invoices</h2></div>
      {loading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState icon="🧾" title="No invoices yet" desc="Invoices appear after orders are processed" />
      ) : (
        <div>
          {invoices.map(inv => (
            <div key={inv._id} className="invoice-row">
              <div>
                <div className="invoice-number">{inv.invoiceNumber}</div>
                <div className="invoice-meta">
                  {inv.tagId} • {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-amount">₹{inv.totalAmount}</div>
                <span className={`payment-badge ${inv.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                  {inv.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <a
                href={invoiceAPI.downloadUrl(inv._id)}
                target="_blank"
                rel="noreferrer"
                className="invoice-download"
              >
                <Download size={14} /> PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Notifications Tab ---- */
function CustomerNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getNotifications()
      .then(({ data }) => setNotifs(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAll = async () => {
    await notificationAPI.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="data-table-wrap">
      <div className="data-table-header">
        <h2>Notifications</h2>
        {notifs.some(n => !n.isRead) && (
          <button onClick={markAll}>Mark all read</button>
        )}
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : notifs.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" desc="Order updates will appear here" />
      ) : (
        <div>
          {notifs.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div className={`notif-dot ${!n.isRead ? 'unread' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <p className="notif-title">{n.title}</p>
                  <span className="notif-date">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="notif-msg">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Profile Tab ---- */
function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <span className="profile-role-badge">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 44 }}>
            {loading ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
