import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Camera, CheckCircle, Download, ChevronDown,
  Package, Waves, Wind, Zap, Bell, Truck, RefreshCw, Upload
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatusBadge, LoadingSpinner } from '../../components/dashboard/DashboardWidgets';
import { orderAPI, garmentAPI, invoiceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { orderStatuses } from '../../data';
import toast from 'react-hot-toast';

const STAGES = [
  { key: 'received', label: 'Received', icon: Package, emoji: '📦' },
  { key: 'washing', label: 'Washing', icon: Waves, emoji: '🌊' },
  { key: 'dry_cleaning', label: 'Dry Cleaning', icon: Wind, emoji: '💨' },
  { key: 'ironing', label: 'Ironing', icon: Zap, emoji: '⚡' },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle, emoji: '🔍' },
  { key: 'ready', label: 'Ready', icon: Bell, emoji: '🎉' },
  { key: 'delivered', label: 'Delivered', icon: Truck, emoji: '✅' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [activeGarment, setActiveGarment] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const fileInputRef = useRef(null);
  const paymentInputRef = useRef(null);

  const isStaff = ['staff', 'manager', 'admin'].includes(user?.role);

  const load = async () => {
    try {
      const { data } = await orderAPI.getOrder(id);
      setOrder(data.order);
      setNewStatus(data.order.status);
    } catch {
      toast.error('Order not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return toast.error('Select a different status');
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, { status: newStatus, notes: statusNotes });
      toast.success(`Status updated to "${STAGES.find(s => s.key === newStatus)?.label}"`);
      setStatusNotes('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const { data } = await invoiceAPI.generate(id);
      setInvoice(data.invoice);
      toast.success('Invoice generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handlePhotoUpload = async (e, garmentIndex) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('photos', f));
      await garmentAPI.uploadPhotos(id, garmentIndex, formData);
      toast.success(`${files.length} photo(s) uploaded`);
      load();
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleConditionUpdate = async (garmentIndex, field, value) => {
    try {
      const garment = order.garments[garmentIndex];
      const updatedCondition = { ...garment.condition, [field]: value };
      await garmentAPI.updateCondition(id, garmentIndex, updatedCondition);
      toast.success('Condition updated');
      load();
    } catch {
      toast.error('Failed to update condition');
    }
  };

  const handlePaymentProof = async () => {
    if (!paymentProofFile) return;
    setUploadingPayment(true);
    try {
      const formData = new FormData();
      formData.append('proof', paymentProofFile);
      await orderAPI.uploadPaymentProof(id, formData);
      toast.success('Payment proof uploaded. Staff will verify shortly.');
      setPaymentProofFile(null);
      load();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      await orderAPI.verifyPayment(id, { paymentMethod: 'qr' });
      toast.success('Payment verified!');
      load();
    } catch {
      toast.error('Verification failed');
    }
  };

  if (loading) return (
    <DashboardLayout title="Order Detail">
      <LoadingSpinner />
    </DashboardLayout>
  );

  if (!order) return null;

  const currentIndex = STAGES.findIndex(s => s.key === order.status);
  const statusInfo = orderStatuses.find(s => s.key === order.status);
  const progressPct = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <DashboardLayout title={`Order ${order.tagId}`}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <h2 className="font-mono font-bold text-sky-400 text-xl">{order.tagId}</h2>
            <StatusBadge status={order.status} />
            <span className={`status-badge ${order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
            </span>
          </div>
          {isStaff && !order.invoiceGenerated && (
            <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
              className="btn-ghost text-sm flex items-center gap-2">
              {generatingInvoice ? <div className="w-4 h-4 spinner" /> : '🧾'} Generate Invoice
            </button>
          )}
          {order.invoiceGenerated && invoice && (
            <a href={invoiceAPI.downloadUrl(invoice._id)} target="_blank" rel="noreferrer"
              className="btn-ghost text-sm flex items-center gap-2">
              <Download size={14} /> Download PDF
            </a>
          )}
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-6">
          <div className="relative mb-6">
            <div className="absolute top-5 left-0 right-0 h-1 bg-white/5 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full shadow-lg shadow-sky-400/30"
            />
            <div className="relative flex justify-between">
              {STAGES.map((stage, i) => {
                const Icon = stage.icon;
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.07, type: 'spring' }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 relative transition-all ${
                        active ? 'border-sky-400 bg-sky-400/20 shadow-lg shadow-sky-400/40'
                        : done ? 'border-emerald-400 bg-emerald-400/15'
                        : 'border-white/10 bg-navy-950'
                      }`}
                    >
                      {active && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border border-sky-400/50"
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

          {/* Current status */}
          <div className="text-center py-4 rounded-xl" style={{ background: `${statusInfo?.color}12`, border: `1px solid ${statusInfo?.color}25` }}>
            <div className="text-3xl mb-1">{STAGES[currentIndex]?.emoji}</div>
            <div className="font-display font-bold text-white">{STAGES[currentIndex]?.label}</div>
            {order.status === 'ready' && <p className="text-emerald-400 text-sm mt-1">Ready for collection!</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order info */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4">Order Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Customer', value: order.customerName },
                  { label: 'Phone', value: order.customerPhone },
                  { label: 'Email', value: order.customerEmail || '—' },
                  { label: 'Service Type', value: order.serviceType === 'express' ? '⚡ Express' : '📦 Normal' },
                  { label: 'Order Date', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Expected Ready', value: new Date(order.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Total Amount', value: `₹${order.totalAmount}` },
                  { label: 'Payment Status', value: order.paymentStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
                    <span className="text-white/80 capitalize">{value}</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Notes</span>
                  <p className="text-white/60 text-sm">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Garments */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4">Garments ({order.garments.length})</h3>
              <div className="space-y-3">
                {order.garments.map((garment, i) => (
                  <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/3 transition-colors"
                      onClick={() => setActiveGarment(activeGarment === i ? null : i)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sm">👔</div>
                        <div>
                          <div className="font-medium text-white text-sm">{garment.type}</div>
                          <div className="text-white/40 text-xs">{garment.category} • {garment.serviceType?.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-white/70 text-sm">₹{garment.totalPrice}</div>
                          <div className="text-white/30 text-xs">×{garment.quantity} @ ₹{garment.unitPrice}</div>
                        </div>
                        <motion.div animate={{ rotate: activeGarment === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={16} className="text-white/40" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {activeGarment === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5"
                        >
                          <div className="p-4 space-y-4">
                            {/* Condition */}
                            <div>
                              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Condition Report</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { field: 'hasStain', label: 'Stain' },
                                  { field: 'hasTear', label: 'Tear' },
                                  { field: 'hasColorFade', label: 'Color Fade' },
                                  { field: 'looseStitching', label: 'Loose Stitching' },
                                  { field: 'missingButton', label: 'Missing Button' },
                                ].map(({ field, label }) => (
                                  <label key={field} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                                    garment.condition?.[field]
                                      ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                                      : 'bg-white/3 border border-white/10 text-white/40'
                                  } ${isStaff ? 'cursor-pointer hover:border-white/20' : 'cursor-default'}`}>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={garment.condition?.[field] || false}
                                      disabled={!isStaff}
                                      onChange={e => isStaff && handleConditionUpdate(i, field, e.target.checked)}
                                    />
                                    <span className={garment.condition?.[field] ? '✓' : '○'} />
                                    {label}
                                  </label>
                                ))}
                              </div>
                              {garment.condition?.otherIssues && (
                                <p className="mt-2 text-white/50 text-xs">Other: {garment.condition.otherIssues}</p>
                              )}
                            </div>

                            {/* Photos */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white/50 text-xs uppercase tracking-wider">Photos ({garment.photos?.length || 0})</h4>
                                {isStaff && (
                                  <>
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      multiple
                                      accept="image/*"
                                      className="hidden"
                                      onChange={e => handlePhotoUpload(e, i)}
                                    />
                                    <button
                                      onClick={() => { setActiveGarment(i); fileInputRef.current?.click(); }}
                                      disabled={uploadingPhotos}
                                      className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs transition-colors"
                                    >
                                      {uploadingPhotos ? <div className="w-3 h-3 spinner" /> : <Camera size={13} />}
                                      Add Photos
                                    </button>
                                  </>
                                )}
                              </div>
                              {garment.photos?.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                  {garment.photos.map((photo, pi) => (
                                    <div key={pi} className="aspect-square rounded-lg overflow-hidden bg-white/5 relative group">
                                      <img src={photo.url} alt={`Garment ${i} photo ${pi}`} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-white/25 text-xs">No photos uploaded yet</p>
                              )}
                            </div>

                            {garment.specialInstructions && (
                              <div>
                                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-1">Special Instructions</h4>
                                <p className="text-white/60 text-sm">{garment.specialInstructions}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-white/40">Total</span>
                <span className="font-display font-bold text-white text-xl">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Status History */}
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
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                        {stage?.emoji || '📌'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm font-medium">{stage?.label || h.status}</span>
                          <span className="text-white/25 text-xs">{new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {h.updatedByName && <p className="text-white/30 text-xs">by {h.updatedByName}</p>}
                        {h.notes && <p className="text-white/50 text-xs mt-0.5 italic">"{h.notes}"</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Update Status (staff only) */}
            {isStaff && (
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-white mb-4">Update Status</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="input-field"
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="input-field resize-none text-sm"
                    rows={2}
                  />
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating || newStatus === order.status}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {updating ? <div className="w-4 h-4 spinner" /> : <RefreshCw size={15} />}
                    Update Status
                  </button>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4">Payment</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Amount Due</span>
                  <span className="font-bold text-white">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Status</span>
                  <span className={order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                    {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>

                {order.paymentStatus !== 'paid' && (
                  <>
                    {/* QR placeholder */}
                    <div className="bg-white/3 border border-white/10 rounded-xl p-4 text-center">
                      <div className="w-20 h-20 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-0.5">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-[1px]`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/40 text-xs">Scan to pay via UPI / Google Pay</p>
                    </div>

                    {/* Upload proof (customer) */}
                    {!isStaff && (
                      <div>
                        <input ref={paymentInputRef} type="file" accept="image/*" className="hidden"
                          onChange={e => setPaymentProofFile(e.target.files[0])} />
                        <button onClick={() => paymentInputRef.current?.click()} className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                          <Upload size={15} /> Upload Payment Screenshot
                        </button>
                        {paymentProofFile && (
                          <div className="mt-2 flex items-center justify-between glass rounded-lg p-3">
                            <span className="text-white/60 text-xs truncate">{paymentProofFile.name}</span>
                            <button onClick={handlePaymentProof} disabled={uploadingPayment} className="text-sky-400 text-xs ml-2">
                              {uploadingPayment ? <div className="w-3 h-3 spinner" /> : 'Submit'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verify payment (staff) */}
                    {isStaff && (
                      <div className="space-y-2">
                        {order.paymentProof?.url && (
                          <a href={order.paymentProof.url} target="_blank" rel="noreferrer"
                            className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                            <Camera size={15} /> View Payment Proof
                          </a>
                        )}
                        <button onClick={handleVerifyPayment} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                          <CheckCircle size={15} /> Mark as Paid
                        </button>
                      </div>
                    )}
                  </>
                )}

                {order.paymentStatus === 'paid' && order.paymentMethod && (
                  <div className="text-center text-white/30 text-xs">via {order.paymentMethod}</div>
                )}
              </div>
            </div>

            {/* Invoice */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-3">Invoice</h3>
              {order.invoiceGenerated ? (
                <div className="space-y-2">
                  <p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle size={14} /> Invoice generated</p>
                  {invoice && (
                    <a href={invoiceAPI.downloadUrl(invoice._id)} target="_blank" rel="noreferrer"
                      className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                      <Download size={14} /> Download PDF
                    </a>
                  )}
                  {!invoice && isStaff && (
                    <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
                      className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                      {generatingInvoice ? <div className="w-4 h-4 spinner" /> : <><Download size={14} /> Load Invoice</>}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-white/40 text-sm mb-3">No invoice generated yet</p>
                  {isStaff && (
                    <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                      {generatingInvoice ? <div className="w-4 h-4 spinner" /> : '🧾 Generate Invoice'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/40">Garments</span><span className="text-white/70">{order.garments.reduce((s, g) => s + g.quantity, 0)} pieces</span></div>
                <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span className="text-white/70">₹{order.subtotal}</span></div>
                {order.taxAmount > 0 && <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white/70">₹{order.taxAmount}</span></div>}
                {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-white/40">Discount</span><span className="text-emerald-400">-₹{order.discountAmount}</span></div>}
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-sky-400">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
