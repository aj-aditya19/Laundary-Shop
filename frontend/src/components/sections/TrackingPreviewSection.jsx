import { useState } from 'react';
import { Search, Package, Waves, Wind, Zap, CheckCircle, Bell, Truck } from 'lucide-react';
import { orderAPI } from '../../services/api';

const STAGES = [
  { key: 'received',      label: 'Received',      icon: Package,     emoji: '📦' },
  { key: 'washing',       label: 'Washing',        icon: Waves,       emoji: '🌊' },
  { key: 'dry_cleaning',  label: 'Dry Cleaning',   icon: Wind,        emoji: '💨' },
  { key: 'ironing',       label: 'Ironing',        icon: Zap,         emoji: '⚡' },
  { key: 'quality_check', label: 'Quality Check',  icon: CheckCircle, emoji: '🔍' },
  { key: 'ready',         label: 'Ready',          icon: Bell,        emoji: '🎉' },
  { key: 'delivered',     label: 'Delivered',      icon: Truck,       emoji: '✅' },
];

export default function TrackingPreviewSection() {
  const [tagId, setTagId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!tagId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await orderAPI.track(tagId.trim().toUpperCase());
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your Tag ID.');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;
  const progressPct = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <section id="tracking" className="section tracking-section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="text-center">
          <span className="section-label">Live Tracking</span>
          <h2 className="section-title">Track Your <span>Order</span></h2>
          <p className="section-desc" style={{ margin: '0 auto 36px' }}>
            Enter your Tag ID to see real-time status of your garments.
          </p>
        </div>

        {/* Search form */}
        <form className="track-form-wrap" onSubmit={handleTrack}>
          <div className="track-input-wrap">
            <span className="track-input-icon"><Search size={18} /></span>
            <input
              className="track-input"
              value={tagId}
              onChange={e => setTagId(e.target.value)}
              placeholder="Enter Tag ID  e.g. DC-2026-1203"
            />
          </div>
          <button type="submit" className="track-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : <><Search size={17} /> Track</>}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Result */}
        {order && (
          <div className="track-result">
            {/* Header */}
            <div className="track-result-header">
              <div>
                <div className="track-result-tagid">{order.tagId}</div>
                <div className="track-result-name">{order.customerName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`track-result-service ${order.serviceType === 'express' ? 'express' : 'normal'}`}>
                  {order.serviceType === 'express' ? '⚡ Express' : '📦 Normal'}
                </span>
                <div className="track-result-expected">
                  Expected: {new Date(order.expectedCompletionDate).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Stages */}
            <div className="stages-wrap">
              <div className="stages-bar-outer" style={{ paddingBottom: 52 }}>
                <div className="stages-track" />
                <div className="stages-progress" style={{ width: `${progressPct}%` }} />
                <div className="stages-row">
                  {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    return (
                      <div key={stage.key} className="stage-item">
                        <div className={`stage-dot ${active ? 'active' : done ? 'done' : ''}`}>
                          {done && !active
                            ? <CheckCircle size={16} style={{ color: '#4caf50' }} />
                            : <Icon size={15} style={{ color: active ? 'var(--primary)' : done ? '#4caf50' : 'var(--border)' }} />
                          }
                        </div>
                        <span className={`stage-label ${active ? 'active' : done ? 'done' : ''}`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current status callout */}
            {currentIndex >= 0 && (
              <div
                className="track-status-callout"
                style={{
                  background: '#f9f5fa',
                  border: '1px solid #e0d4e3',
                  margin: '0 24px 24px',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <div className="track-status-callout-emoji">{STAGES[currentIndex].emoji}</div>
                <div className="track-status-callout-title">{STAGES[currentIndex].label}</div>
                {order.status === 'ready' && (
                  <div className="track-status-callout-sub">Your clothes are ready for pickup!</div>
                )}
                {order.status === 'delivered' && (
                  <div className="track-status-callout-sub">Order completed. Thank you!</div>
                )}
              </div>
            )}

            {/* History */}
            {order.statusHistory?.length > 0 && (
              <div className="track-history">
                <div className="track-history-title">Recent Updates</div>
                {[...order.statusHistory].reverse().slice(0, 3).map((h, i) => (
                  <div key={i} className="track-history-row">
                    <span className="track-history-status">
                      {STAGES.find(s => s.key === h.status)?.label || h.status}
                    </span>
                    <span className="track-history-time">
                      {new Date(h.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hint text */}
        {!order && !error && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 16 }}>
            Your Tag ID is printed on your receipt and sent via email when you drop off clothes.
          </p>
        )}
      </div>
    </section>
  );
}
