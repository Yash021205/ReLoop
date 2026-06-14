import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, RefreshCcw, Eye, ShieldCheck, Tag } from 'lucide-react';
import { getUserReturns } from '../api';

const STATUS_ICONS = {
  'Initiated': <Package size={18} />,
  'Classified': <RefreshCcw size={18} />,
  'Inspecting': <Eye size={18} />,
  'Vision Complete': <Eye size={18} />,
  'Answers Submitted': <CheckCircle size={18} />,
  'Triaged': <ShieldCheck size={18} />,
  'Resold': <Tag size={18} />
};

export default function ReturnHistoryPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserReturns()
      .then(res => setReturns(res.returns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getTimelineSteps = (ret) => {
    const steps = [
      { label: 'Initiated', active: true },
      { label: 'Inspecting', active: ['Inspecting', 'Vision Complete', 'Answers Submitted', 'Triaged', 'Resold'].includes(ret.status) },
      { label: 'Triaged', active: ['Triaged', 'Resold'].includes(ret.status) },
      { label: 'Marketplace', active: ret.status === 'Resold' }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--space-xl)' }}>Return History</h1>
        {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 160, marginBottom: 'var(--space-md)' }} />)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>Your Return History</h1>
      
      {returns.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Package size={48} style={{ color: 'var(--gray-400)', margin: '0 auto var(--space-md)' }} />
          <h3>No Returns Yet</h3>
          <p className="text-muted">You haven't initiated any returns with Re:Loop.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {returns.map(ret => {
            const steps = getTimelineSteps(ret);
            return (
              <div key={ret.id} className="card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="text-sm text-muted" style={{ marginBottom: 4 }}>{ret.date} • {ret.id}</div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{ret.emoji} {ret.productName}</h3>
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                      <span className="badge badge-gray">{ret.reason}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-green" style={{ fontSize: 'var(--font-size-sm)', padding: '4px 10px' }}>
                      {STATUS_ICONS[ret.status] || <RefreshCcw size={14} />} <span style={{ marginLeft: 6 }}>{ret.status}</span>
                    </div>
                    {ret.status === 'Triaged' && (
                      <div style={{ marginTop: 'var(--space-sm)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/marketplace')}>View in Marketplace</button>
                      </div>
                    )}
                    {ret.status !== 'Triaged' && ret.status !== 'Resold' && (
                      <div style={{ marginTop: 'var(--space-sm)' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/triage/${ret.id}`)}>Continue</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 'var(--space-md)' }}>
                  <div style={{ position: 'absolute', top: 12, left: '12%', right: '12%', height: 2, background: 'var(--gray-200)', zIndex: 0 }} />
                  {steps.map((step, idx) => (
                    <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                      <div style={{ 
                        width: 26, height: 26, borderRadius: '50%', 
                        background: step.active ? 'var(--green-500)' : 'var(--gray-200)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all var(--transition-normal)'
                      }}>
                        {step.active ? <CheckCircle size={14} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gray-400)' }} />}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 'var(--font-size-sm)', fontWeight: step.active ? 600 : 400, color: step.active ? 'var(--gray-900)' : 'var(--gray-500)' }}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
