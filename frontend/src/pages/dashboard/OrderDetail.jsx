import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, CheckCircle, Download,
  ChevronDown, Package, Waves, Wind, Zap,
  Bell, Truck, RefreshCw, Upload
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { StatusBadge, LoadingSpinner } from '../../components/dashboard/DashboardWidgets';
import { orderAPI, garmentAPI, invoiceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { orderStatuses } from '../../data';
import toast from 'react-hot-toast';

const STAGES = [
  { key: 'received',      label: 'Received',     icon: Package,     emoji: '📦' },
  { key: 'washing',       label: 'Washing',       icon: Waves,       emoji: '🌊' },
  { key: 'dry_cleaning',  label: 'Dry Cleaning',  icon: Wind,        emoji: '💨' },
  { key: 'ironing',       label: 'Ironing',       icon: Zap,         emoji: '⚡' },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle, emoji: '🔍' },
  { key: 'ready',         label: 'Ready',         icon: Bell,        emoji: '🎉' },
  { key: 'delivered',     label: 'Delivered',     icon: Truck,       emoji: '✅' },
];

const CONDITIONS = [
  { field: 'hasStain',       label: 'Stain' },
  { field: 'hasTear',        label: 'Tear' },
  { field: 'hasColorFade',   label: 'Color Fade' },
  { field: 'looseStitching', label: 'Loose Stitching' },
  { field: 'missingButton',  label: 'Missing Button' },
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
  const statusInfo   = orderStatuses.find(s => s.key === order.status);
  const progressPct  = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <DashboardLayout title={`Order ${order.tagId}`}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-muted)', display: 'flex' }}
          >
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
            {order.tagId}
          </span>
          <StatusBadge status={order.status} />
          <span
            className="badge"
            style={{
              backgroundColor: order.paymentStatus === 'paid' ? '#e8f5e9' : '#fff8e1',
              color: order.paymentStatus === 'paid' ? '#2e7d32' : '#f57f17',
            }}
          >
            {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {isStaff && !order.invoiceGenerated && (
              <button className="btn btn-ghost btn-sm" onClick={handleGenerateInvoice} disabled={generatingInvoice}>
                {generatingInvoice ? <span className="spinner" /> : '🧾'} Generate Invoice
              </button>
            )}
            {order.invoiceGenerated && invoice && (
              <a href={invoiceAPI.downloadUrl(invoice._id)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <Download size={14} /> Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', paddingBottom: 48, marginBottom: 16 }}>
            {/* Track */}
            <div style={{
              position: 'absolute', top: 20, left: 0, right: 0,
              height: 3, background: 'var(--border)', borderRadius: 99,
            }} />
            {/* Progress fill */}
            <div style={{
              position: 'absolute', top: 20, left: 0,
              height: 3, width: `${progressPct}%`,
              background: 'var(--primary)', borderRadius: 99,
            }} />
            {/* Stage dots */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              {STAGES.map((stage, i) => {
                const Icon = stage.icon;
                const done   = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className={`stage-dot ${active ? 'active' : done ? 'done' : ''}`}>
                      {done && !active
                        ? <CheckCircle size={15} style={{ color: '#4caf50' }} />
                        : <Icon size={14} style={{ color: active ? 'var(--primary)' : done ? '#4caf50' : 'var(--border)' }} />
                      }
                    </div>
                    <span
                      className={`stage-label ${active ? 'active' : done ? 'done' : ''}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status callout */}
          <div style={{
            textAlign: 'center', padding: '16px',
            background: `${statusInfo?.color || 'var(--bg)'}18`,
            border: `1px solid ${statusInfo?.color || 'var(--border)'}30`,
            borderRadius: 12,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>{STAGES[currentIndex]?.emoji}</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{STAGES[currentIndex]?.label}</div>
            {order.status === 'ready' && (
              <p style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.88rem', marginTop: 4 }}>
                Ready for collection!
              </p>
            )}
          </div>
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Order info */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 16 }}>Order Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Customer',      value: order.customerName },
                  { label: 'Phone',         value: order.customerPhone },
                  { label: 'Email',         value: order.customerEmail || '—' },
                  { label: 'Service Type',  value: order.serviceType === 'express' ? '⚡ Express' : '📦 Normal' },
                  { label: 'Order Date',    value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Expected Ready',value: new Date(order.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Total Amount',  value: `₹${order.totalAmount}` },
                  { label: 'Payment',       value: order.paymentStatus },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)', textTransform: 'capitalize' }}>{value}</div>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Notes
                  </div>
                  <p style={{ fontSize: '0.88rem' }}>{order.notes}</p>
                </div>
              )}
            </div>

            {/* Garments */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 16 }}>Garments ({order.garments.length})</h3>
              <div>
                {order.garments.map((garment, i) => (
                  <div
                    key={i}
                    style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}
                  >
                    {/* Garment header row */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', cursor: 'pointer', backgroundColor: 'var(--surface)',
                      }}
                      onClick={() => setActiveGarment(activeGarment === i ? null : i)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, background: '#f5eef6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                        }}>
                          👔
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{garment.type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {garment.category} • {garment.serviceType?.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>₹{garment.totalPrice}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>×{garment.quantity} @ ₹{garment.unitPrice}</div>
                        </div>
                        <ChevronDown
                          size={16}
                          style={{
                            color: 'var(--text-muted)',
                            transform: activeGarment === i ? 'rotate(180deg)' : 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded garment detail */}
                    {activeGarment === i && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
                        {/* Condition */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Condition Report
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {CONDITIONS.map(({ field, label }) => (
                              <label
                                key={field}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '5px 12px', borderRadius: 8, fontSize: '0.8rem',
                                  cursor: isStaff ? 'pointer' : 'default',
                                  border: `1px solid ${garment.condition?.[field] ? '#f5c6c6' : 'var(--border)'}`,
                                  backgroundColor: garment.condition?.[field] ? '#fdecea' : 'var(--surface)',
                                  color: garment.condition?.[field] ? '#c62828' : 'var(--text-muted)',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  style={{ display: 'none' }}
                                  checked={garment.condition?.[field] || false}
                                  disabled={!isStaff}
                                  onChange={e => isStaff && handleConditionUpdate(i, field, e.target.checked)}
                                />
                                {garment.condition?.[field] ? '✓' : '○'} {label}
                              </label>
                            ))}
                          </div>
                          {garment.condition?.otherIssues && (
                            <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Other: {garment.condition.otherIssues}
                            </p>
                          )}
                        </div>

                        {/* Photos */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                              Photos ({garment.photos?.length || 0})
                            </div>
                            {isStaff && (
                              <>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  multiple
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={e => handlePhotoUpload(e, i)}
                                />
                                <button
                                  onClick={() => { setActiveGarment(i); fileInputRef.current?.click(); }}
                                  disabled={uploadingPhotos}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600,
                                  }}
                                >
                                  {uploadingPhotos ? <span className="spinner" /> : <Camera size={13} />}
                                  Add Photos
                                </button>
                              </>
                            )}
                          </div>
                          {garment.photos?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                              {garment.photos.map((photo, pi) => (
                                <div key={pi} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--bg)' }}>
                                  <img src={photo.url} alt={`Garment photo ${pi + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No photos uploaded yet</p>
                          )}
                        </div>

                        {garment.specialInstructions && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                              Special Instructions
                            </div>
                            <p style={{ fontSize: '0.88rem' }}>{garment.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)' }}>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Activity timeline */}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                          {stage?.label || h.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.updatedByName && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {h.updatedByName}</p>
                      )}
                      {h.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>"{h.notes}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Update Status — staff only */}
            {isStaff && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 14 }}>Update Status</h3>
                <div className="form-group">
                  <select
                    className="select-field"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    className="input-field"
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={2}
                    style={{ resize: 'none', fontSize: '0.88rem' }}
                  />
                </div>
                <button
                  className="btn btn-primary btn-full"
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.status}
                  style={{ height: 42 }}
                >
                  {updating ? <span className="spinner" /> : <><RefreshCw size={15} /> Update Status</>}
                </button>
              </div>
            )}

            {/* Payment */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14 }}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Due</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{order.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontWeight: 600, color: order.paymentStatus === 'paid' ? '#2e7d32' : '#f57f17' }}>
                  {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>

              {order.paymentStatus !== 'paid' && (
                <>
                  {/* Simple QR placeholder */}
                  <div style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
                    padding: '16px', textAlign: 'center', marginBottom: 10,
                  }}>
                    <div style={{
                      width: 76, height: 76, background: '#fff',
                      borderRadius: 8, margin: '0 auto 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid var(--border)',
                    }}>
                      {/* Static QR-like grid */}
                      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="24" height="24" rx="2" fill="none" stroke="#614668" strokeWidth="3"/>
                        <rect x="6" y="6" width="12" height="12" rx="1" fill="#614668"/>
                        <rect x="36" y="0" width="24" height="24" rx="2" fill="none" stroke="#614668" strokeWidth="3"/>
                        <rect x="42" y="6" width="12" height="12" rx="1" fill="#614668"/>
                        <rect x="0" y="36" width="24" height="24" rx="2" fill="none" stroke="#614668" strokeWidth="3"/>
                        <rect x="6" y="42" width="12" height="12" rx="1" fill="#614668"/>
                        <rect x="36" y="36" width="6" height="6" fill="#614668"/>
                        <rect x="44" y="36" width="6" height="6" fill="#614668"/>
                        <rect x="36" y="44" width="6" height="6" fill="#614668"/>
                        <rect x="44" y="44" width="6" height="6" fill="#614668"/>
                        <rect x="28" y="0" width="6" height="6" fill="#614668"/>
                        <rect x="28" y="8" width="6" height="6" fill="#614668"/>
                        <rect x="0" y="28" width="6" height="6" fill="#614668"/>
                        <rect x="8" y="28" width="6" height="6" fill="#614668"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan to pay via UPI / Google Pay</p>
                  </div>

                  {/* Upload proof — customer */}
                  {!isStaff && (
                    <div>
                      <input
                        ref={paymentInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => setPaymentProofFile(e.target.files[0])}
                      />
                      <button
                        className="btn btn-ghost btn-full btn-sm"
                        onClick={() => paymentInputRef.current?.click()}
                        style={{ marginBottom: 8 }}
                      >
                        <Upload size={14} /> Upload Payment Screenshot
                      </button>
                      {paymentProofFile && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px',
                        }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {paymentProofFile.name}
                          </span>
                          <button
                            onClick={handlePaymentProof}
                            disabled={uploadingPayment}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0, marginLeft: 8 }}
                          >
                            {uploadingPayment ? <span className="spinner" /> : 'Submit'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verify — staff */}
                  {isStaff && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {order.paymentProof?.url && (
                        <a href={order.paymentProof.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm btn-full">
                          <Camera size={14} /> View Payment Proof
                        </a>
                      )}
                      <button className="btn btn-primary btn-full btn-sm" onClick={handleVerifyPayment}>
                        <CheckCircle size={14} /> Mark as Paid
                      </button>
                    </div>
                  )}
                </>
              )}

              {order.paymentStatus === 'paid' && order.paymentMethod && (
                <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  via {order.paymentMethod}
                </p>
              )}
            </div>

            {/* Invoice */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Invoice</h3>
              {order.invoiceGenerated ? (
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#2e7d32', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} /> Invoice generated
                  </p>
                  {invoice && (
                    <a href={invoiceAPI.downloadUrl(invoice._id)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm btn-full">
                      <Download size={14} /> Download PDF
                    </a>
                  )}
                  {!invoice && isStaff && (
                    <button className="btn btn-ghost btn-sm btn-full" onClick={handleGenerateInvoice} disabled={generatingInvoice}>
                      {generatingInvoice ? <span className="spinner" /> : <><Download size={14} /> Load Invoice</>}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>No invoice generated yet</p>
                  {isStaff && (
                    <button className="btn btn-primary btn-sm btn-full" onClick={handleGenerateInvoice} disabled={generatingInvoice}>
                      {generatingInvoice ? <span className="spinner" /> : '🧾 Generate Invoice'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
              <div className="order-summary-row">
                <span>Garments</span>
                <span>{order.garments.reduce((s, g) => s + g.quantity, 0)} pieces</span>
              </div>
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="order-summary-row">
                  <span>Tax</span>
                  <span>₹{order.taxAmount}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="order-summary-row">
                  <span>Discount</span>
                  <span style={{ color: '#2e7d32' }}>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="order-summary-row total">
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
