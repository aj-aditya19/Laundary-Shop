import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Waves, Wind, Zap, CheckCircle, Bell, Truck } from 'lucide-react';
import { orderAPI } from '../../services/api';

const STAGES = [
  { key: 'received', label: 'Received', icon: Package, color: '#38BDF8' },
  { key: 'washing', label: 'Washing', icon: Waves, color: '#8B5CF6' },
  { key: 'dry_cleaning', label: 'Dry Cleaning', icon: Wind, color: '#06B6D4' },
  { key: 'ironing', label: 'Ironing', icon: Zap, color: '#F59E0B' },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle, color: '#EC4899' },
  { key: 'ready', label: 'Ready', icon: Bell, color: '#10B981' },
  { key: 'delivered', label: 'Delivered', icon: Truck, color: '#6EE7B7' },
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

  const currentStageIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;

  return (
    <section id="tracking" className="py-24 bg-navy-900/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Live Tracking</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Track Your <span className="gradient-text">Order</span>
          </h2>
          <p className="text-white/40 text-lg">Enter your Tag ID to see real-time status of your garments.</p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="flex gap-3 mb-10"
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={tagId}
              onChange={e => setTagId(e.target.value)}
              placeholder="Enter Tag ID  e.g. DC-2026-1203"
              className="input-field pl-12 font-mono text-lg h-14"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-14 px-8 flex items-center gap-2 min-w-[120px] justify-center"
          >
            {loading ? <div className="w-5 h-5 spinner" /> : <><Search size={18} /> Track</>}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 glass-card p-4 border-red-500/20 bg-red-500/5 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8"
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <div>
                  <div className="text-white/40 text-xs mb-1">Tag ID</div>
                  <div className="font-mono font-bold text-sky-400 text-2xl">{order.tagId}</div>
                  <div className="text-white/50 text-sm mt-1">{order.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-xs mb-1">Service</div>
                  <div className={`status-badge ${order.serviceType === 'express' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>
                    {order.serviceType === 'express' ? '⚡ Express' : '📦 Normal'}
                  </div>
                  <div className="text-white/40 text-xs mt-2">Expected: {new Date(order.expectedCompletionDate).toLocaleDateString('en-IN')}</div>
                </div>
              </div>

              {/* Progress stages */}
              <div className="relative mb-8">
                {/* Progress bar */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-sky-400 to-cyan-400"
                />

                <div className="relative flex justify-between">
                  {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const done = i <= currentStageIndex;
                    const active = i === currentStageIndex;
                    return (
                      <div key={stage.key} className="flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.08, type: 'spring' }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 ${
                            active
                              ? 'border-sky-400 bg-sky-400/20 shadow-lg shadow-sky-400/30'
                              : done
                              ? 'border-emerald-400 bg-emerald-400/20'
                              : 'border-white/10 bg-navy-950'
                          }`}
                        >
                          {active && (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full border border-sky-400/50"
                            />
                          )}
                          <Icon size={16} style={{ color: done ? (active ? stage.color : '#10B981') : 'rgba(255,255,255,0.2)' }} />
                        </motion.div>
                        <span className={`text-[10px] text-center leading-tight max-w-[60px] hidden sm:block ${done ? 'text-white/70' : 'text-white/25'}`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current status callout */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl p-4 text-center mb-6"
                style={{ background: `${STAGES[currentStageIndex]?.color}15`, border: `1px solid ${STAGES[currentStageIndex]?.color}30` }}
              >
                <div className="text-2xl mb-1">{['📦', '🌊', '💨', '⚡', '🔍', '🎉', '✅'][currentStageIndex]}</div>
                <div className="font-display font-bold text-white text-xl">
                  {STAGES[currentStageIndex]?.label}
                </div>
                {order.status === 'ready' && (
                  <p className="text-emerald-400 text-sm mt-1">Your clothes are ready for pickup!</p>
                )}
              </motion.div>

              {/* Recent history */}
              {order.statusHistory?.length > 0 && (
                <div>
                  <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Recent Updates</div>
                  <div className="space-y-2">
                    {[...order.statusHistory].reverse().slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                        <span className="text-white/60">{STAGES.find(s => s.key === h.status)?.label || h.status}</span>
                        <span className="text-white/30 text-xs">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo hint */}
        {!order && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/25 text-sm mt-4"
          >
            Your Tag ID is printed on your receipt and sent via email when you drop off clothes.
          </motion.p>
        )}
      </div>
    </section>
  );
}
