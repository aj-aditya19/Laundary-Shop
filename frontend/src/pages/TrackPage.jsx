import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Package, Waves, Wind, Zap, CheckCircle, Bell, Truck, ArrowLeft } from 'lucide-react';
import { orderAPI } from '../services/api';
import { orderStatuses } from '../data';

const STAGES = [
  { key: 'received',      label: 'Received',     icon: Package,     emoji: '📦' },
  { key: 'washing',       label: 'Washing',       icon: Waves,       emoji: '🌊' },
  { key: 'dry_cleaning',  label: 'Dry Cleaning',  icon: Wind,        emoji: '💨' },
  { key: 'ironing',       label: 'Ironing',       icon: Zap,         emoji: '⚡' },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle, emoji: '🔍' },
  { key: 'ready',         label: 'Ready',         icon: Bell,        emoji: '🎉' },
  { key: 'delivered',     label: 'Delivered',     icon: Truck,       emoji: '✅' },
];

export default function TrackPage() {
  const { tagId: urlTagId } = useParams();
  const [tagId, setTagId] = useState(urlTagId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doTrack = async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await orderAPI.track(id.trim().toUpperCase());
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Double-check your Tag ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlTagId) doTrack(urlTagId);
  }, [urlTagId]);

  const handleSubmit = (e) => { e.preventDefault(); doTrack(tagId); };

  const currentIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;
  const statusInfo  = order ? orderStatuses.find(s => s.key === order.status) : null;
  const progressPct = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="track-page">
      {/* Top bar */}
      <div className="track-page-topbar">
        <Link to="/" className="track-page-topbar-logo">
          <div className="track-page-topbar-logo-icon">✨</div>
          <span className="track-page-topbar-logo-text">Sparkle DC</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to Home
        </Link>
        <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>
          Sign In
        </Link>
      </div>

      <div className="track-page-body">
        {/* Heading */}
        <div className="track-page-heading">
          <div className="track-page-eyebrow">
            <span className="track-page-eyebrow-dot" />
            Real-time Order Tracking
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            Track Your <span style={{ color: 'var(--primary)' }}>Order</span>
          </h1>
          <p>Enter the Tag ID from your receipt or email</p>
        </div>

        {/* Search form */}
        <form className="track-form-wrap" onSubmit={handleSubmit}>
          <div className="track-input-wrap">
            <span className="track-input-icon"><Search size={18} /></span>
            <input
              className="track-input"
              value={tagId}
              onChange={e => setTagId(e.target.value.toUpperCase())}
              placeholder="DC-2026-1203"
              style={{ letterSpacing: '0.05em' }}
            />
          </div>
          <button type="submit" className="track-submit-btn" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : <><Search size={17} /> Track</>
            }
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="card" style={{ borderColor: '#f5c6c6', backgroundColor: '#fdecea', marginBottom: 20, textAlign: 'center' }}>
            <p style={{ color: '#c62828', fontWeight: 600, marginBottom: 4 }}>{error}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tag IDs look like: DC-2026-1203</p>
          </div>
        )}

        {/* Result */}
        {order && (
          <div>
            {/* Header card */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Tag ID
                  </div>
                  <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)', lineHeight: 1 }}>
                    {order.tagId}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{order.customerName}</span>
                    {statusInfo && (
                      <span className={`status-badge status-${order.status}`}>{statusInfo.label}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Amount
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                    ₹{order.totalAmount}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: 4, color: order.paymentStatus === 'paid' ? '#2e7d32' : '#f57f17', fontWeight: 600 }}>
                    {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 14, backgroundColor: 'var(--bg)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>Service</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {order.serviceType === 'express' ? '⚡ Express' : '📦 Normal'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>Expected Ready</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {new Date(order.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>Order Date</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress tracker card */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 28 }}>Order Progress</h3>

              <div style={{ position: 'relative', paddingBottom: 40 }}>
                {/* Track bar */}
                <div className="stages-track" />
                <div className="stages-progress" style={{ width: `${progressPct}%` }} />
                <div className="stages-row">
                  {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const done   = i <= currentIndex;
                    const active = i === currentIndex;
                    return (
                      <div key={stage.key} className="stage-item">
                        <div className={`stage-dot ${active ? 'active' : done ? 'done' : ''}`}>
                          {done && !active
                            ? <CheckCircle size={15} style={{ color: '#4caf50' }} />
                            : <Icon size={14} style={{ color: active ? 'var(--primary)' : done ? '#4caf50' : 'var(--border)' }} />
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

              {/* Active status callout */}
              {currentIndex >= 0 && (
                <div style={{
                  background: '#f9f5fa',
                  border: '1px solid #e0d4e3',
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>{STAGES[currentIndex].emoji}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                    {STAGES[currentIndex].label}
                  </div>
                  {order.status === 'ready' && (
                    <p style={{ color: '#2e7d32', fontWeight: 600, marginTop: 4, fontSize: '0.9rem' }}>
                      🎉 Your clothes are ready! Visit the shop to collect.
                    </p>
                  )}
                  {order.status === 'delivered' && (
                    <p style={{ color: '#2e7d32', marginTop: 4, fontSize: '0.9rem' }}>
                      Order completed. Thank you for choosing Sparkle!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Timeline history */}
            {order.statusHistory?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>Activity Timeline</h3>
                {[...order.statusHistory].reverse().map((h, i) => {
                  const stage = STAGES.find(s => s.key === h.status);
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                      }}>
                        {stage?.emoji || '📌'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                            {stage?.label || h.status}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {h.notes && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{h.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Help card when empty */}
        {!order && !error && !loading && (
          <div className="track-hint">
            <div className="track-hint-emoji">🏷️</div>
            <h3>Where is my Tag ID?</h3>
            <p>
              Your Tag ID is printed on the physical tag attached to your garments and included
              in the email receipt sent when you dropped off your clothes.
            </p>
            <div className="track-hint-example">
              <span className="track-hint-tagid">DC-2026-1203</span>
              <span className="track-hint-note">← Example format</span>
            </div>
            <p style={{ marginTop: 16, fontSize: '0.85rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register to track orders from your dashboard
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
