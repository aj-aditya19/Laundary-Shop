import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Waves, Wind, Zap, CheckCircle, Bell, Truck, ArrowLeft } from 'lucide-react';
import { orderAPI } from '../services/api';
import { orderStatuses } from '../data';

const STAGES = [
  { key: 'received', label: 'Received', icon: Package, emoji: '📦' },
  { key: 'washing', label: 'Washing', icon: Waves, emoji: '🌊' },
  { key: 'dry_cleaning', label: 'Dry Cleaning', icon: Wind, emoji: '💨' },
  { key: 'ironing', label: 'Ironing', icon: Zap, emoji: '⚡' },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle, emoji: '🔍' },
  { key: 'ready', label: 'Ready', icon: Bell, emoji: '🎉' },
  { key: 'delivered', label: 'Delivered', icon: Truck, emoji: '✅' },
];

export default function TrackPage() {
  const { tagId: urlTagId } = useParams();
  const [tagId, setTagId] = useState(urlTagId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doTrack = async (id) => {
    if (!id?.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const { data } = await orderAPI.track(id.trim().toUpperCase());
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Double-check your Tag ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (urlTagId) doTrack(urlTagId); }, [urlTagId]);

  const handleSubmit = (e) => { e.preventDefault(); doTrack(tagId); };

  const currentIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;
  const statusInfo = order ? orderStatuses.find(s => s.key === order.status) : null;
  const progressPct = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-xs">✨</div>
            <span className="font-display font-bold text-white text-base">Sparkle DC</span>
          </div>
          <Link to="/login" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">Sign In</Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-white/50 text-sm">Real-time Order Tracking</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Track Your <span className="gradient-text">Order</span>
          </h1>
          <p className="text-white/40">Enter the Tag ID from your receipt or email</p>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={tagId}
              onChange={e => setTagId(e.target.value.toUpperCase())}
              placeholder="DC-2026-1203"
              className="input-field pl-12 font-mono text-lg h-14 tracking-widest"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-14 px-8 flex items-center gap-2 min-w-[130px] justify-center">
            {loading ? <div className="w-5 h-5 spinner" /> : <><Search size={18} /> Track</>}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card p-5 border-red-500/20 bg-red-500/5 text-center mb-6">
              <p className="text-red-400 font-medium">{error}</p>
              <p className="text-white/30 text-sm mt-1">Tag IDs look like: DC-2026-1203</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Header card */}
              <div className="glass-card p-6 mb-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <div>
                    <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Tag ID</div>
                    <div className="font-mono font-bold text-sky-400 text-3xl tracking-wider">{order.tagId}</div>
                    <div className="text-white/50 text-sm mt-1 flex items-center gap-2">
                      <span>{order.customerName}</span>
                      {statusInfo && <span className={`status-badge ${statusInfo.bg}`}>{statusInfo.label}</span>}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Amount</div>
                    <div className="font-display font-bold text-white text-2xl">₹{order.totalAmount}</div>
                    <div className={`text-sm mt-1 ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                    </div>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white/3 rounded-xl text-sm">
                  <div><span className="text-white/30 block text-xs">Service</span><span className="text-white/70">{order.serviceType === 'express' ? '⚡ Express' : '📦 Normal'}</span></div>
                  <div><span className="text-white/30 block text-xs">Expected Ready</span><span className="text-white/70">{new Date(order.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <div><span className="text-white/30 block text-xs">Order Date</span><span className="text-white/70">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                </div>
              </div>

              {/* Progress tracker */}
              <div className="glass-card p-6 mb-4">
                <h3 className="font-display font-semibold text-white mb-6">Order Progress</h3>

                {/* Bar */}
                <div className="relative mb-8">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-white/5 rounded-full" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full shadow-lg shadow-sky-400/50"
                  />
                  <div className="relative flex justify-between">
                    {STAGES.map((stage, i) => {
                      const Icon = stage.icon;
                      const done = i <= currentIndex;
                      const active = i === currentIndex;
                      return (
                        <div key={stage.key} className="flex flex-col items-center gap-2 relative z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.07 + 0.3, type: 'spring', stiffness: 200 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                              active ? 'border-sky-400 bg-sky-400/20 shadow-lg shadow-sky-400/40'
                              : done ? 'border-emerald-400 bg-emerald-400/15'
                              : 'border-white/10 bg-navy-950'
                            }`}
                          >
                            {active && (
                              <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-sky-400/20"
                              />
                            )}
                            {done && !active
                              ? <CheckCircle size={16} className="text-emerald-400" />
                              : <Icon size={15} className={active ? 'text-sky-400' : 'text-white/20'} />
                            }
                          </motion.div>
                          <span className={`text-[10px] text-center leading-tight w-14 hidden sm:block ${done ? 'text-white/60' : 'text-white/20'}`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active status highlight */}
                {currentIndex >= 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center py-5 rounded-xl"
                    style={{
                      background: `${statusInfo?.color}12`,
                      border: `1px solid ${statusInfo?.color}30`
                    }}
                  >
                    <div className="text-4xl mb-2">{STAGES[currentIndex].emoji}</div>
                    <div className="font-display font-bold text-white text-xl mb-1">{STAGES[currentIndex].label}</div>
                    {order.status === 'ready' && (
                      <p className="text-emerald-400 text-sm font-medium">🎉 Your clothes are ready! Visit the shop to collect.</p>
                    )}
                    {order.status === 'delivered' && (
                      <p className="text-emerald-300 text-sm">Order completed. Thank you for choosing Sparkle!</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Status history */}
              {order.statusHistory?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4">Activity Timeline</h3>
                  <div className="space-y-3">
                    {[...order.statusHistory].reverse().map((h, i) => {
                      const stage = STAGES.find(s => s.key === h.status);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-sm">
                            {stage?.emoji || '📌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/80 text-sm font-medium">{stage?.label || h.status}</span>
                              <span className="text-white/30 text-xs flex-shrink-0">{new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {h.notes && <p className="text-white/40 text-xs mt-0.5">{h.notes}</p>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help text */}
        {!order && !error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
            <div className="glass-card p-8 mb-6">
              <div className="text-4xl mb-3">🏷️</div>
              <h3 className="font-semibold text-white mb-2">Where is my Tag ID?</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Your Tag ID is printed on the physical tag attached to your garments and included in the email receipt sent when you dropped off your clothes.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 glass rounded-xl px-4 py-2">
                <span className="font-mono text-sky-400 text-sm font-bold">DC-2026-1203</span>
                <span className="text-white/30 text-xs">← Example format</span>
              </div>
            </div>
            <p className="text-white/30 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 transition-colors">Register to track orders from your dashboard</Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
