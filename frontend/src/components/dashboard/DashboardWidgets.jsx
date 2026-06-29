import { orderStatuses } from '../../data';

/* ---- Stat Card ---- */
export function StatCard({ label, value, icon, color = 'var(--primary)', change, index = 0 }) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-icon-wrap"
        style={{ backgroundColor: `${color}18` }}
      >
        {icon}
      </div>
      {change !== undefined && (
        <span className={`stat-card-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

/* ---- Status Badge ---- */
export function StatusBadge({ status }) {
  const statusClassMap = {
    received:      'status-received',
    washing:       'status-washing',
    dry_cleaning:  'status-dry_cleaning',
    ironing:       'status-ironing',
    quality_check: 'status-quality_check',
    ready:         'status-ready',
    delivered:     'status-delivered',
  };

  const info = orderStatuses.find(s => s.key === status);
  const label = info?.label || status;
  const cls = statusClassMap[status] || '';

  return <span className={`status-badge ${cls}`}>{label}</span>;
}

/* ---- Order Row (table row) ---- */
export function OrderRow({ order, onClick }) {
  return (
    <tr className="data-table-row" onClick={onClick}>
      <td><span className="td-tagid">{order.tagId}</span></td>
      <td className="hide-sm"><span className="td-name">{order.customerName}</span></td>
      <td><StatusBadge status={order.status} /></td>
      <td className="hide-md"><span className="td-amount">₹{order.totalAmount}</span></td>
      <td className="hide-lg">
        <span className="td-date">
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      </td>
      <td>
        <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
        </span>
      </td>
    </tr>
  );
}

/* ---- Loading Spinner ---- */
export function LoadingSpinner({ minHeight = '200px' }) {
  return (
    <div className="loading-area" style={{ minHeight }}>
      <div className="spinner spinner-lg" />
      <p>Loading...</p>
    </div>
  );
}

/* ---- Empty State ---- */
export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-emoji">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action}
    </div>
  );
}
