import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 'var(--space-md)' }}>
      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ color: 'var(--green-500)', marginBottom: 'var(--space-md)' }}><Leaf size={48} style={{ margin: '0 auto' }} /></div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Create Account</h1>
          <p className="text-muted">Join Re:Loop for sustainable shopping</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>
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
            <UserPlus size={18} /> {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)' }}>
          <span className="text-muted text-sm">Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
