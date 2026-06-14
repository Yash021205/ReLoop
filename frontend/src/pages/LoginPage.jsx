import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Leaf, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => { setEmail('admin@reloop.com'); setPassword('admin'); };
  const fillCustomer = () => { setEmail('customer@reloop.com'); setPassword('customer'); };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 'var(--space-md)' }}>
      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ color: 'var(--green-500)', marginBottom: 'var(--space-md)' }}><Leaf size={48} style={{ margin: '0 auto' }} /></div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Welcome Back</h1>
          <p className="text-muted">Sign in to Re:Loop</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
          <div className="text-muted" style={{ marginBottom: 'var(--space-sm)' }}>Demo Accounts:</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={fillCustomer}>Customer</button>
            <button className="btn btn-secondary btn-sm" onClick={fillAdmin}>Admin</button>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)' }}>
          <span className="text-muted text-sm">Don't have an account? </span>
          <Link to="/signup" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
