import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, Search, ArrowLeft, UserPlus } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { orderAPI, customerAPI } from '../../services/api';
import { garmentTypes } from '../../data';
import toast from 'react-hot-toast';

const SERVICE_TYPES = [
  { value: 'wash', label: 'Wash Only' },
  { value: 'dry_clean', label: 'Dry Clean' },
  { value: 'iron', label: 'Iron Only' },
  { value: 'wash_iron', label: 'Wash + Iron' },
  { value: 'dry_clean_iron', label: 'Dry Clean + Iron' },
];

const SERVICE_MULTIPLIERS = { wash: 1, dry_clean: 1.5, iron: 0.5, wash_iron: 1.3, dry_clean_iron: 1.8 };

export default function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Customer
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // Garments
  const [garments, setGarments] = useState([
    { type: 'shirt', category: 'men', quantity: 1, serviceType: 'dry_clean', unitPrice: 40, specialInstructions: '', condition: {} }
  ]);

  // Order settings
  const [serviceType, setServiceType] = useState('normal');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchCustomers = useCallback(async (q) => {
    if (!q.trim()) { setCustomers([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await customerAPI.getCustomers({ search: q });
      setCustomers(data.customers);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    setCustomerSearch(e.target.value);
    const t = setTimeout(() => searchCustomers(e.target.value), 400);
    return () => clearTimeout(t);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreatingCustomer(true);
    try {
      const { data } = await customerAPI.createCustomer(newCustomer);
      setSelectedCustomer(data.customer);
      setShowNewCustomer(false);
      setCustomers([]);
      setCustomerSearch(data.customer.name);
      toast.success('Customer created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const addGarment = () => {
    setGarments([...garments, {
      type: 'shirt', category: 'men', quantity: 1,
      serviceType: 'dry_clean', unitPrice: 40, specialInstructions: '', condition: {}
    }]);
  };

  const removeGarment = (i) => {
    if (garments.length === 1) return toast.error('At least one garment required');
    setGarments(garments.filter((_, idx) => idx !== i));
  };

  const updateGarment = (i, field, value) => {
    const updated = [...garments];
    updated[i] = { ...updated[i], [field]: value };

    // Recalculate price when type or service changes
    if (field === 'type') {
      const found = garmentTypes.find(g => g.value === value);
      if (found) {
        updated[i].category = found.category;
        updated[i].unitPrice = Math.round(found.basePrice * (SERVICE_MULTIPLIERS[updated[i].serviceType] || 1));
      }
    }
    if (field === 'serviceType') {
      const found = garmentTypes.find(g => g.value === updated[i].type);
      if (found) {
        updated[i].unitPrice = Math.round(found.basePrice * (SERVICE_MULTIPLIERS[value] || 1));
      }
    }
    setGarments(updated);
  };

  const subtotal = garments.reduce((s, g) => s + g.unitPrice * g.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (garments.some(g => !g.type || g.quantity < 1)) return toast.error('Check garment details');

    setSubmitting(true);
    try {
      const { data } = await orderAPI.createOrder({
        customerId: selectedCustomer._id,
        garments: garments.map(g => ({
          type: garmentTypes.find(gt => gt.value === g.type)?.label || g.type,
          category: g.category,
          quantity: g.quantity,
          unitPrice: g.unitPrice,
          serviceType: g.serviceType,
          specialInstructions: g.specialInstructions,
          condition: g.condition,
        })),
        serviceType,
        notes,
      });
      toast.success(`Order created! Tag ID: ${data.order.tagId}`);
      navigate(`/dashboard/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create New Order">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-5 text-sm transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { n: 1, label: 'Customer' },
            { n: 2, label: 'Garments' },
            { n: 3, label: 'Review' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= n ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/30'
              }`}>{n}</div>
              <span className={`text-sm font-medium ${step >= n ? 'text-white/80' : 'text-white/30'}`}>{label}</span>
              {n < 3 && <div className={`h-px w-8 ${step > n ? 'bg-sky-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-white mb-4">Select Customer</h2>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center font-bold text-sky-400">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{selectedCustomer.name}</div>
                        <div className="text-white/40 text-sm">{selectedCustomer.phone} • {selectedCustomer.email}</div>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="text-white/40 hover:text-white text-sm transition-colors">Change</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        value={customerSearch}
                        onChange={handleSearchChange}
                        placeholder="Search by name, phone, or email..."
                        className="input-field pl-11"
                      />
                      {searchLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 spinner" />}
                    </div>

                    {customers.length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        {customers.map((c, i) => (
                          <button key={c._id} onClick={() => { setSelectedCustomer(c); setCustomers([]); }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center font-bold text-sky-400 text-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{c.name}</div>
                              <div className="text-white/40 text-xs">{c.phone} • {c.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/30 text-xs">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <button onClick={() => setShowNewCustomer(!showNewCustomer)}
                      className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                      <UserPlus size={15} /> Create New Customer
                    </button>

                    <AnimatePresence>
                      {showNewCustomer && (
                        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          onSubmit={handleCreateCustomer} className="glass rounded-xl p-4 space-y-3">
                          <input className="input-field text-sm" placeholder="Full Name*" required value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                          <input className="input-field text-sm" placeholder="Phone*" required value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                          <input className="input-field text-sm" type="email" placeholder="Email (optional)" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                          <button type="submit" disabled={creatingCustomer} className="btn-primary w-full text-sm h-10 flex items-center justify-center gap-2">
                            {creatingCustomer ? <div className="w-4 h-4 spinner" /> : 'Create & Select'}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 text-sm">Order Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs block mb-2">Service Type</label>
                    <div className="flex gap-2">
                      {[{ v: 'normal', l: '📦 Normal (3-5 days)' }, { v: 'express', l: '⚡ Express (1-2 days)' }].map(({ v, l }) => (
                        <button key={v} onClick={() => setServiceType(v)}
                          className={`flex-1 text-xs px-3 py-2 rounded-lg border transition-all ${serviceType === v ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-2">Order Notes</label>
                    <input className="input-field text-sm" placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => { if (!selectedCustomer) return toast.error('Please select a customer'); setStep(2); }}
                  className="btn-primary">
                  Next: Add Garments →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Garments */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-semibold text-white">Add Garments</h2>
                  <button onClick={addGarment} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm transition-colors">
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {garments.map((g, i) => {
                    const typeInfo = garmentTypes.find(gt => gt.value === g.type);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/50 text-xs uppercase tracking-wider">Item {i + 1}</span>
                          <button onClick={() => removeGarment(i)} className="text-white/25 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-white/40 text-xs block mb-1.5">Garment Type</label>
                            <select className="input-field text-sm" value={g.type} onChange={e => updateGarment(i, 'type', e.target.value)}>
                              {['men', 'women', 'household'].map(cat => (
                                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                                  {garmentTypes.filter(gt => gt.category === cat).map(gt => (
                                    <option key={gt.value} value={gt.value}>{gt.label}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-white/40 text-xs block mb-1.5">Service</label>
                            <select className="input-field text-sm" value={g.serviceType} onChange={e => updateGarment(i, 'serviceType', e.target.value)}>
                              {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-white/40 text-xs block mb-1.5">Quantity</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => g.quantity > 1 && updateGarment(i, 'quantity', g.quantity - 1)}
                                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <Minus size={14} />
                              </button>
                              <span className="flex-1 text-center font-bold text-white">{g.quantity}</span>
                              <button onClick={() => updateGarment(i, 'quantity', g.quantity + 1)}
                                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-white/40 text-xs block mb-1.5">Unit Price (₹)</label>
                            <input type="number" className="input-field text-sm" value={g.unitPrice}
                              onChange={e => updateGarment(i, 'unitPrice', Number(e.target.value))} min="0" />
                          </div>
                          <div>
                            <label className="text-white/40 text-xs block mb-1.5">Special Instructions</label>
                            <input className="input-field text-sm" placeholder="e.g. Handle with care" value={g.specialInstructions}
                              onChange={e => updateGarment(i, 'specialInstructions', e.target.value)} />
                          </div>
                        </div>

                        {/* Condition checkboxes */}
                        <div>
                          <label className="text-white/40 text-xs block mb-1.5">Pre-existing Condition</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { f: 'hasStain', l: 'Stain' },
                              { f: 'hasTear', l: 'Tear' },
                              { f: 'hasColorFade', l: 'Color Fade' },
                              { f: 'looseStitching', l: 'Loose Stitching' },
                              { f: 'missingButton', l: 'Missing Button' },
                            ].map(({ f, l }) => (
                              <label key={f} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all border ${
                                g.condition?.[f] ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'border-white/10 text-white/40 hover:border-white/20'
                              }`}>
                                <input type="checkbox" className="sr-only" checked={g.condition?.[f] || false}
                                  onChange={e => updateGarment(i, 'condition', { ...g.condition, [f]: e.target.checked })} />
                                {g.condition?.[f] ? '✓' : '○'} {l}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-white/5">
                          <span className="text-white/40 text-sm">Item Total</span>
                          <span className="text-sky-400 font-bold">₹{g.unitPrice * g.quantity}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-4 flex justify-between items-center">
                <div className="text-white/50 text-sm">{garments.reduce((s, g) => s + g.quantity, 0)} pieces</div>
                <div className="text-right">
                  <div className="text-white/40 text-xs">Order Total</div>
                  <div className="font-display font-bold text-white text-xl">₹{subtotal}</div>
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Review Order →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-white mb-5">Review Order</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-5 p-4 bg-white/3 rounded-xl">
                  <div>
                    <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Customer</div>
                    <div className="text-white font-medium">{selectedCustomer?.name}</div>
                    <div className="text-white/50 text-sm">{selectedCustomer?.phone}</div>
                  </div>
                  <div>
                    <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Service</div>
                    <div className="text-white font-medium capitalize">{serviceType === 'express' ? '⚡ Express' : '📦 Normal'}</div>
                    <div className="text-white/50 text-sm">{serviceType === 'express' ? '1-2 days' : '3-5 days'}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Garments</div>
                  {garments.map((g, i) => {
                    const typeInfo = garmentTypes.find(gt => gt.value === g.type);
                    const serviceInfo = SERVICE_TYPES.find(s => s.value === g.serviceType);
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                        <div>
                          <span className="text-white/80">{typeInfo?.label || g.type}</span>
                          <span className="text-white/40 ml-2">× {g.quantity}</span>
                          <span className="text-white/30 ml-2">({serviceInfo?.label})</span>
                          {Object.values(g.condition || {}).some(Boolean) && (
                            <span className="ml-2 text-xs text-amber-400">⚠ Condition noted</span>
                          )}
                        </div>
                        <span className="text-sky-400 font-medium">₹{g.unitPrice * g.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-white/40 text-sm">Total Amount</div>
                    {notes && <div className="text-white/30 text-xs mt-1">Note: {notes}</div>}
                  </div>
                  <div className="font-display font-bold text-sky-400 text-3xl">₹{subtotal}</div>
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost">← Edit Garments</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 px-8">
                  {submitting ? <div className="w-5 h-5 spinner" /> : '✅ Confirm & Create Order'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
