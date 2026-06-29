import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Search, ArrowLeft, UserPlus } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { orderAPI, customerAPI } from '../../services/api';
import { garmentTypes } from '../../data';
import toast from 'react-hot-toast';

const SERVICE_TYPES = [
  { value: 'wash',           label: 'Wash Only' },
  { value: 'dry_clean',      label: 'Dry Clean' },
  { value: 'iron',           label: 'Iron Only' },
  { value: 'wash_iron',      label: 'Wash + Iron' },
  { value: 'dry_clean_iron', label: 'Dry Clean + Iron' },
];

const SERVICE_MULTIPLIERS = {
  wash: 1, dry_clean: 1.5, iron: 0.5, wash_iron: 1.3, dry_clean_iron: 1.8,
};

const CONDITIONS = [
  { f: 'hasStain',       l: 'Stain' },
  { f: 'hasTear',        l: 'Tear' },
  { f: 'hasColorFade',   l: 'Color Fade' },
  { f: 'looseStitching', l: 'Loose Stitching' },
  { f: 'missingButton',  l: 'Missing Button' },
];

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
    { type: 'shirt', category: 'men', quantity: 1, serviceType: 'dry_clean', unitPrice: 40, specialInstructions: '', condition: {} },
  ]);

  // Order settings
  const [serviceType, setServiceType] = useState('normal');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search timer ref replacement
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
    const val = e.target.value;
    setCustomerSearch(val);
    const t = setTimeout(() => searchCustomers(val), 400);
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
      serviceType: 'dry_clean', unitPrice: 40, specialInstructions: '', condition: {},
    }]);
  };

  const removeGarment = (i) => {
    if (garments.length === 1) return toast.error('At least one garment required');
    setGarments(garments.filter((_, idx) => idx !== i));
  };

  const updateGarment = (i, field, value) => {
    const updated = [...garments];
    updated[i] = { ...updated[i], [field]: value };

    if (field === 'type') {
      const found = garmentTypes.find(g => g.value === value);
      if (found) {
        updated[i].category  = found.category;
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
          type:               garmentTypes.find(gt => gt.value === g.type)?.label || g.type,
          category:           g.category,
          quantity:           g.quantity,
          unitPrice:          g.unitPrice,
          serviceType:        g.serviceType,
          specialInstructions: g.specialInstructions,
          condition:          g.condition,
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
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20,
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          {[
            { n: 1, label: 'Customer' },
            { n: 2, label: 'Garments' },
            { n: 3, label: 'Review' },
          ].map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700,
                backgroundColor: step >= n ? 'var(--primary)' : 'var(--bg)',
                color: step >= n ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${step >= n ? 'var(--primary)' : 'var(--border)'}`,
              }}>
                {n}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: step >= n ? 'var(--text)' : 'var(--text-muted)' }}>
                {label}
              </span>
              {n < 3 && (
                <div style={{ width: 32, height: 2, backgroundColor: step > n ? 'var(--primary)' : 'var(--border)', borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>

        {/* ---- STEP 1: Customer ---- */}
        {step === 1 && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ marginBottom: 16 }}>Select Customer</h2>

              {selectedCustomer ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10,
                  background: '#f5eef6', border: '1px solid #e0d4e3',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem',
                    }}>
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedCustomer.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {selectedCustomer.phone} • {selectedCustomer.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  {/* Search input */}
                  <div className="field-icon-wrap" style={{ marginBottom: 10 }}>
                    <span className="icon"><Search size={16} /></span>
                    <input
                      className="input-field pl-11"
                      value={customerSearch}
                      onChange={handleSearchChange}
                      placeholder="Search by name, phone, or email..."
                    />
                    {searchLoading && (
                      <span className="icon-right"><span className="spinner" /></span>
                    )}
                  </div>

                  {/* Dropdown results */}
                  {customers.length > 0 && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                      {customers.map((c, i) => (
                        <button
                          key={c._id}
                          onClick={() => { setSelectedCustomer(c); setCustomers([]); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none',
                            cursor: 'pointer', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#f5eef6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem',
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{c.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone} • {c.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>or</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
                  </div>

                  <button
                    className="btn btn-ghost btn-full"
                    onClick={() => setShowNewCustomer(!showNewCustomer)}
                  >
                    <UserPlus size={15} /> Create New Customer
                  </button>

                  {/* New customer form */}
                  {showNewCustomer && (
                    <form
                      onSubmit={handleCreateCustomer}
                      style={{
                        marginTop: 12, padding: 16,
                        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
                        display: 'flex', flexDirection: 'column', gap: 10,
                      }}
                    >
                      <input
                        className="input-field"
                        placeholder="Full Name*"
                        required
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      />
                      <input
                        className="input-field"
                        placeholder="Phone*"
                        required
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      />
                      <input
                        className="input-field"
                        type="email"
                        placeholder="Email (optional)"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={creatingCustomer}
                        style={{ height: 42 }}
                      >
                        {creatingCustomer ? <span className="spinner" /> : 'Create & Select'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Order settings */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14 }}>Order Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Service Type
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { v: 'normal',  l: '📦 Normal (3-5 days)' },
                      { v: 'express', l: '⚡ Express (1-2 days)' },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setServiceType(v)}
                        style={{
                          flex: 1, fontSize: '0.8rem', padding: '8px 6px', borderRadius: 8,
                          border: `1.5px solid ${serviceType === v ? 'var(--primary)' : 'var(--border)'}`,
                          background: serviceType === v ? '#f5eef6' : 'var(--surface)',
                          color: serviceType === v ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer', fontWeight: serviceType === v ? 600 : 400,
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Order Notes
                  </label>
                  <input
                    className="input-field"
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => { if (!selectedCustomer) return toast.error('Please select a customer'); setStep(2); }}
              >
                Next: Add Garments →
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 2: Garments ---- */}
        {step === 2 && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Add Garments</h2>
                <button
                  onClick={addGarment}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              {garments.map((g, i) => (
                <div
                  key={i}
                  style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 12 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Item {i + 1}
                    </span>
                    <button
                      onClick={() => removeGarment(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseOver={e => { e.currentTarget.style.color = '#c62828'; e.currentTarget.style.background = '#fdecea'; }}
                      onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Garment Type</label>
                      <select className="select-field" value={g.type} onChange={e => updateGarment(i, 'type', e.target.value)}>
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
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Service</label>
                      <select className="select-field" value={g.serviceType} onChange={e => updateGarment(i, 'serviceType', e.target.value)}>
                        {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Quantity</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => g.quantity > 1 && updateGarment(i, 'quantity', g.quantity - 1)}
                          style={{
                            width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 8,
                            background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>{g.quantity}</span>
                        <button
                          onClick={() => updateGarment(i, 'quantity', g.quantity + 1)}
                          style={{
                            width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 8,
                            background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Unit Price (₹)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={g.unitPrice}
                        onChange={e => updateGarment(i, 'unitPrice', Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Special Instructions</label>
                      <input
                        className="input-field"
                        placeholder="e.g. Handle with care"
                        value={g.specialInstructions}
                        onChange={e => updateGarment(i, 'specialInstructions', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Condition checkboxes */}
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 7 }}>Pre-existing Condition</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {CONDITIONS.map(({ f, l }) => (
                        <label
                          key={f}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 11px', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer',
                            border: `1px solid ${g.condition?.[f] ? '#f5c6c6' : 'var(--border)'}`,
                            backgroundColor: g.condition?.[f] ? '#fdecea' : 'var(--surface)',
                            color: g.condition?.[f] ? '#c62828' : 'var(--text-muted)',
                          }}
                        >
                          <input
                            type="checkbox"
                            style={{ display: 'none' }}
                            checked={g.condition?.[f] || false}
                            onChange={e => updateGarment(i, 'condition', { ...g.condition, [f]: e.target.checked })}
                          />
                          {g.condition?.[f] ? '✓' : '○'} {l}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{g.unitPrice * g.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals bar */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {garments.reduce((s, g) => s + g.quantity, 0)} pieces
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order Total</div>
                <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.4rem' }}>₹{subtotal}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order →</button>
            </div>
          </div>
        )}

        {/* ---- STEP 3: Review ---- */}
        {step === 3 && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ marginBottom: 20 }}>Review Order</h2>

              {/* Customer + service */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Customer
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedCustomer?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedCustomer?.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Service
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {serviceType === 'express' ? '⚡ Express' : '📦 Normal'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {serviceType === 'express' ? '1-2 days' : '3-5 days'}
                  </div>
                </div>
              </div>

              {/* Garments list */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Garments
                </div>
                {garments.map((g, i) => {
                  const typeInfo    = garmentTypes.find(gt => gt.value === g.type);
                  const serviceInfo = SERVICE_TYPES.find(s => s.value === g.serviceType);
                  const hasCondition = Object.values(g.condition || {}).some(Boolean);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 0', borderBottom: '1px solid var(--border)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{typeInfo?.label || g.type}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>× {g.quantity}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 6 }}>({serviceInfo?.label})</span>
                        {hasCondition && (
                          <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#f57f17' }}>⚠ Condition noted</span>
                        )}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{g.unitPrice * g.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total box */}
              <div style={{
                padding: '16px 20px', background: '#f5eef6', border: '1px solid #e0d4e3',
                borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount</div>
                  {notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Note: {notes}</div>}
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '2rem', lineHeight: 1 }}>₹{subtotal}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Edit Garments</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '12px 32px' }}
              >
                {submitting ? <span className="spinner" /> : '✅ Confirm & Create Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
