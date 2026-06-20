import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatCard, OrderRow, LoadingSpinner, EmptyState, StatusBadge } from '../../components/dashboard/DashboardWidgets';
import { orderAPI, customerAPI } from '../../services/api';
import { orderStatuses } from '../../data';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  return (
    <DashboardLayout title={tab === 'home' ? 'Staff Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}>
      {tab === 'home' && <StaffHome />}
      {tab === 'orders' && <StaffOrders />}
      {tab === 'customers' && <StaffCustomers />}
    </DashboardLayout>
  );
}

function StaffHome() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getOrders({ limit: 20 }).then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const readyOrders = orders.filter(o => o.status === 'ready');
  const activeOrders = orders.filter(o => !['delivered'].includes(o.status));
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Orders" value={activeOrders.length} icon="📦" color="#38BDF8" index={0} />
        <StatCard label="Ready for Pickup" value={readyOrders.length} icon="🎉" color="#10B981" index={1} />
        <StatCard label="Today's Orders" value={todayOrders.length} icon="📅" color="#F59E0B" index={2} />
        <StatCard label="Total Loaded" value={orders.length} icon="📊" color="#8B5CF6" index={3} />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/dashboard/orders/create')}
          className="glass-card p-5 flex items-center gap-4 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all duration-300 group text-left">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">➕</div>
          <div>
            <div className="font-semibold text-white">New Order</div>
            <div className="text-white/40 text-sm">Create order for a customer</div>
          </div>
        </button>
        <button onClick={() => navigate('/track')}
          className="glass-card p-5 flex items-center gap-4 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all duration-300 group text-left">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔍</div>
          <div>
            <div className="font-semibold text-white">Track Order</div>
            <div className="text-white/40 text-sm">Look up order by Tag ID</div>
          </div>
        </button>
      </div>

      {/* Ready for pickup */}
      {readyOrders.length > 0 && (
        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/3">
          <h2 className="font-display font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>🎉</span> Ready for Pickup ({readyOrders.length})
          </h2>
          <div className="space-y-2">
            {readyOrders.map(order => (
              <div key={order._id} onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-xl cursor-pointer hover:bg-emerald-500/10 transition-colors">
                <div>
                  <span className="font-mono text-sky-400 font-semibold text-sm">{order.tagId}</span>
                  <span className="text-white/50 text-sm ml-3">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">₹{order.totalAmount}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-display font-semibold text-white">All Orders</h2>
          <button onClick={() => navigate('/dashboard?tab=orders')} className="text-sky-400 hover:text-sky-300 text-sm">View all →</button>
        </div>
        {loading ? <LoadingSpinner /> : (
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
                {orders.slice(0, 10).map(order => (
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

function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getOrders({ search: search || undefined, status: statusFilter || undefined, limit: 100 });
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-field pl-10" placeholder="Search by tag ID, name, phone..." value={search} onChange={e => setSearch(e.target.value)} />
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
        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <EmptyState icon="📭" title="No orders found" desc="Try adjusting your search or filters" />
        ) : (
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
        )}
      </div>
    </div>
  );
}

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

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="input-field pl-10" placeholder="Search customers by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5">
          <span className="text-white/40 text-sm">{customers.length} customers</span>
        </div>
        {loading ? <LoadingSpinner /> : customers.length === 0 ? (
          <EmptyState icon="👥" title="No customers found" desc="Customers appear after they register or are created" />
        ) : (
          <div className="divide-y divide-white/5">
            {customers.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400/30 to-cyan-500/30 flex items-center justify-center font-bold text-white/80 text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{c.name}</div>
                    <div className="text-white/40 text-xs">{c.phone} • {c.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-white/25 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
