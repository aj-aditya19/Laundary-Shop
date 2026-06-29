import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatCard, OrderRow, LoadingSpinner, EmptyState } from '../../components/dashboard/DashboardWidgets';
import { orderAPI, customerAPI } from '../../services/api';
import { orderStatuses } from '../../data';

export default function StaffDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  const titleMap = {
    home:      'Staff Dashboard',
    orders:    'Orders',
    customers: 'Customers',
  };

  return (
    <DashboardLayout title={titleMap[tab] || 'Dashboard'}>
      {tab === 'home'      && <StaffHome />}
      {tab === 'orders'    && <StaffOrders />}
      {tab === 'customers' && <StaffCustomers />}
    </DashboardLayout>
  );
}

/* ---- Home Tab ---- */
function StaffHome() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getOrders({ limit: 20 })
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const readyOrders  = orders.filter(o => o.status === 'ready');
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const todayOrders  = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());

  return (
    <div>
      {/* Stat cards */}
      <div className="stat-cards-row">
        <StatCard label="Active Orders"    value={activeOrders.length} icon="📦" color="#614668" index={0} />
        <StatCard label="Ready for Pickup" value={readyOrders.length}  icon="🎉" color="#4caf50" index={1} />
        <StatCard label="Today's Orders"   value={todayOrders.length}  icon="📅" color="#f59e0b" index={2} />
        <StatCard label="Total Loaded"     value={orders.length}       icon="📊" color="#5D748E" index={3} />
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <button
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
          onClick={() => navigate('/dashboard/orders/create')}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#f5eef6', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
          }}>
            ➕
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>New Order</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Create order for a customer</div>
          </div>
        </button>

        <button
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
          onClick={() => navigate('/track')}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#eaf0f5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
          }}>
            🔍
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Track Order</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Look up order by Tag ID</div>
          </div>
        </button>
      </div>

      {/* Ready for pickup banner */}
      {readyOrders.length > 0 && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: '#c3e6cb', backgroundColor: '#f0faf2' }}
        >
          <h3 style={{ color: '#2e7d32', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎉</span> Ready for Pickup ({readyOrders.length})
          </h3>
          {readyOrders.map(order => (
            <div
              key={order._id}
              onClick={() => navigate(`/dashboard/orders/${order._id}`)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 6,
                backgroundColor: '#e8f5e9', border: '1px solid #c3e6cb',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                  {order.tagId}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.customerName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>₹{order.totalAmount}</span>
                <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent orders table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h2>All Orders</h2>
          <button onClick={() => navigate('/dashboard?tab=orders')}>View all →</button>
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
                {orders.slice(0, 10).map(order => (
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

/* ---- Orders Tab ---- */
function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 100,
      });
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
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="field-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon"><Search size={16} /></span>
          <input
            className="input-field pl-11"
            placeholder="Search by tag ID, name, phone..."
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
          {orderStatuses.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/orders/create')}
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="data-table-wrap">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState icon="📭" title="No orders found" desc="Try adjusting your search or filters" />
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

/* ---- Customers Tab ---- */
function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <div>
      <div className="field-icon-wrap" style={{ marginBottom: 16 }}>
        <span className="icon"><Search size={16} /></span>
        <input
          className="input-field pl-11"
          placeholder="Search customers by name, phone, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customers.length} customers</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <EmptyState icon="👥" title="No customers found" desc="Customers appear after they register or are created" />
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
                    justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem',
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.phone} • {c.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: c.isActive ? '#e8f5e9' : '#fdecea',
                      color: c.isActive ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
