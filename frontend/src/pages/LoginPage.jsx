import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="auth-form-label">Email Address</label>
            <div className="field-icon-wrap">
              <span className="icon"><Mail size={16} /></span>
              <input
                type="email"
                className="input-field pl-11"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
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
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="icon-right" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ height: 46, marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" />

        {/* Demo credentials */}
        <div className="auth-demo-box">
          <div className="auth-demo-box-label">Demo Accounts</div>
          <div className="auth-demo-row">
            <span className="auth-demo-role">Admin:</span>
            <span className="auth-demo-creds">admin@sparkle.com / Admin@1234</span>
          </div>
          <div className="auth-demo-row">
            <span className="auth-demo-role">Staff:</span>
            <span className="auth-demo-creds">staff@sparkle.com / Staff@1234</span>
          </div>
          <div className="auth-demo-row">
            <span className="auth-demo-role">Customer:</span>
            <span className="auth-demo-creds">customer@example.com / Customer@1234</span>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>

      <Link to="/" className="auth-back-link">← Back to Home</Link>
    </div>
  );
}
