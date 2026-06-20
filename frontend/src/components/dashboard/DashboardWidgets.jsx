import { motion } from 'framer-motion';
import { orderStatuses } from '../../data';

export function StatCard({ label, value, icon, color = '#38BDF8', change, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 blur-xl"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}18` }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
    </motion.div>
  );
}

export function StatusBadge({ status }) {
  const info = orderStatuses.find(s => s.key === status) || { label: status, bg: 'bg-white/10 text-white/60' };
  return <span className={`status-badge ${info.bg}`}>{info.label}</span>;
}

export function OrderRow({ order, onClick }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3">
        <span className="font-mono text-sky-400 font-semibold text-sm">{order.tagId}</span>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-white/70 text-sm">{order.customerName}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-white/50 text-sm">₹{order.totalAmount}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
        </span>
      </td>
    </motion.tr>
  );
}

export function LoadingSpinner({ className = 'h-64' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 spinner" />
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-white/40 text-sm mb-6">{desc}</p>
      {action}
    </div>
  );
}
