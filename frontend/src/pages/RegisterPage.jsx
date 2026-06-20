import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, User, Phone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success(`Welcome to Sparkle, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Aditya Kumar' },
    { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '+91 9876543210' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">Sparkle DC</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-white/40">Track orders and manage your garments</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="text-white/60 text-sm font-medium block mb-2">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    className="input-field pl-11"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-white/60 text-sm font-medium block mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 6 characters"
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repeat password"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <div className="w-5 h-5 spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6 pt-6 border-t border-white/5">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/30 hover:text-white/50 text-sm transition-colors">← Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
