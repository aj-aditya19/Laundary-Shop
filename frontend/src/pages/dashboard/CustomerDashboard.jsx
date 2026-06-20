import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  StatCard,
  OrderRow,
  LoadingSpinner,
  EmptyState,
} from "../../components/dashboard/DashboardWidgets";
import {
  orderAPI,
  notificationAPI,
  invoiceAPI,
  analyticsAPI,
  authAPI,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function CustomerDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "home";
  const { user } = useAuth();
  const titleMap = {
    home: `Welcome, ${user?.name?.split(" ")[0]}`,
    orders: "My Orders",
    invoices: "Invoices",
    notifications: "Notifications",
    profile: "Profile",
  };

  return (
    <DashboardLayout title={titleMap[tab] || "Dashboard"}>
      {tab === "home" && <CustomerHome />}
      {tab === "orders" && <CustomerOrders />}
      {tab === "invoices" && <CustomerInvoices />}
      {tab === "notifications" && <CustomerNotifications />}
      {tab === "profile" && <CustomerProfile />}
    </DashboardLayout>
  );
}

function CustomerHome() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      analyticsAPI.getCustomerStats(),
      orderAPI.getOrders({ limit: 5 }),
    ])
      .then(([s, o]) => {
        setStats(s.data.stats);
        setOrders(o.data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon="📦"
          color="#38BDF8"
          index={0}
        />
        <StatCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          icon="⚡"
          color="#F59E0B"
          index={1}
        />
        <StatCard
          label="Completed"
          value={stats?.completedOrders ?? 0}
          icon="✅"
          color="#10B981"
          index={2}
        />
        <StatCard
          label="Total Spent"
          value={`₹${stats?.totalSpent ?? 0}`}
          icon="💳"
          color="#8B5CF6"
          index={3}
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-white text-lg">
            Recent Orders
          </h2>
          <button
            onClick={() => navigate("/dashboard?tab=orders")}
            className="text-sky-400 hover:text-sky-300 text-sm transition-colors"
          >
            View all →
          </button>
        </div>
        {orders.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders yet"
            desc="Visit our shop to drop off garments and get started"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Tag ID",
                    "Customer",
                    "Status",
                    "Amount",
                    "Date",
                    "Payment",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
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

      <div className="glass-card p-6 bg-gradient-to-br from-sky-500/5 to-cyan-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white mb-1">Loyalty Points</h3>
            <p className="text-white/40 text-sm">
              Earn 100 point for every ₹100 spent
            </p>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-3xl gradient-text">
              {stats?.loyaltyPoints ?? 0}
            </div>
            <div className="text-white/30 text-xs">points</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getOrders({
        status: statusFilter || undefined,
        limit: 50,
      });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "received", label: "Received" },
    { value: "washing", label: "Washing" },
    { value: "dry_cleaning", label: "Dry Cleaning" },
    { value: "ironing", label: "Ironing" },
    { value: "quality_check", label: "Quality Check" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`flex-shrink-0 text-xs px-4 py-2 rounded-full border transition-all ${statusFilter === opt.value ? "bg-sky-500/20 border-sky-500/40 text-sky-300" : "border-white/10 text-white/40 hover:border-white/20"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders found"
            desc="No orders match the selected filter"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Tag ID",
                    "Customer",
                    "Status",
                    "Amount",
                    "Date",
                    "Payment",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
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

function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI
      .getInvoices()
      .then(({ data }) => setInvoices(data.invoices))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="font-display font-semibold text-white">My Invoices</h2>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No invoices yet"
          desc="Invoices appear after orders are processed"
        />
      ) : (
        <div className="divide-y divide-white/5">
          {invoices.map((inv, i) => (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors"
            >
              <div>
                <div className="font-mono text-sky-400 text-sm font-semibold">
                  {inv.invoiceNumber}
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  {inv.tagId} •{" "}
                  {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  ₹{inv.totalAmount}
                </div>
                <span
                  className={`text-xs ${inv.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {inv.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
                </span>
              </div>
              <a
                href={invoiceAPI.downloadUrl(inv._id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm glass px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} /> PDF
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI
      .getNotifications()
      .then(({ data }) => setNotifs(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifs((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAll = async () => {
    await notificationAPI.markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="font-display font-semibold text-white">Notifications</h2>
        {notifs.some((n) => !n.isRead) && (
          <button
            onClick={markAll}
            className="text-sky-400 hover:text-sky-300 text-sm"
          >
            Mark all read
          </button>
        )}
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          desc="Order updates will appear here"
        />
      ) : (
        <div className="divide-y divide-white/5">
          {notifs.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`px-6 py-4 flex gap-3 cursor-pointer hover:bg-white/3 transition-colors ${!n.isRead ? "bg-sky-500/3" : ""}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? "bg-white/10" : "bg-sky-400"}`}
              />
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${n.isRead ? "text-white/60" : "text-white"}`}
                  >
                    {n.title}
                  </p>
                  <span className="text-white/25 text-xs flex-shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-1">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center font-bold text-white text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-xl">
              {user?.name}
            </h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <span className="text-xs px-2 py-0.5 bg-sky-500/15 text-sky-400 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Full Name
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Phone
            </label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Address
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-11 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 spinner" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
