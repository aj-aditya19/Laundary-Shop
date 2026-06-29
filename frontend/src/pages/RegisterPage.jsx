import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
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

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">
          <Link to="/" className="auth-logo-link">
            <div className="auth-logo-icon">✨</div>
            <span className="auth-logo-text">Sparkle DC</span>
          </Link>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Track orders and manage your garments</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="auth-form-label">Full Name</label>
            <div className="field-icon-wrap">
              <span className="icon"><User size={16} /></span>
              <input
                type="text"
                className="input-field pl-11"
                value={form.name}
                onChange={set('name')}
                placeholder="Aditya Kumar"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="auth-form-label">Email Address</label>
            <div className="field-icon-wrap">
              <span className="icon"><Mail size={16} /></span>
              <input
                type="email"
                className="input-field pl-11"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="auth-form-label">Phone Number</label>
            <div className="field-icon-wrap">
              <span className="icon"><Phone size={16} /></span>
              <input
                type="tel"
                className="input-field pl-11"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="auth-form-label">Password</label>
            <div className="field-icon-wrap">
              <span className="icon"><Lock size={16} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-11 pr-11"
                value={form.password}
                onChange={set('password')}
                placeholder="Min 6 characters"
              />
              <button type="button" className="icon-right" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="auth-form-label">Confirm Password</label>
            <div className="field-icon-wrap">
              <span className="icon"><Lock size={16} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-11"
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ height: 46, marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider" />

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>

      <Link to="/" className="auth-back-link">← Back to Home</Link>
    </div>
  );
}
