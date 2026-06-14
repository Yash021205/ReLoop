import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { runTriage, reRunTriage, getTriagePathways } from '../api';

export default function TriagePage() {
  const { returnId } = useParams();
  const [triageResult, setTriageResult] = useState(null);
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExplain, setShowExplain] = useState(false);

  useEffect(() => {
    Promise.all([getTriagePathways(), runTriage(returnId)])
      .then(([pathwayRes, triageRes]) => {
        setPathways(pathwayRes.pathways || triageRes.pathways || []);
        setTriageResult(triageRes);
      })
      .catch(err => console.error("Triage failed:", err))
      .finally(() => setLoading(false));
  }, [returnId]);

  const handleRetriage = () => {
    setLoading(true);
    reRunTriage(returnId)
      .then(res => {
        setPathways(res.pathways || pathways);
        setTriageResult(res);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
        <div style={{ fontSize: 64, marginBottom: 'var(--space-lg)' }}>🧠</div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>AI Triage Engine Processing...</h2>
        <p className="text-muted">Evaluating all recovery pathways independently</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
          {pathways.map(p => (
            <div key={p.id} className="skeleton" style={{ width: 120, height: 120, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  const selected = pathways.find(p => p.id === triageResult.selectedPathway) || pathways[0];
  if (!selected) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={14} /> Back
      </Link>

      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>AI Triage Engine</h1>
      <p className="text-muted mb-lg">Multi-Pathway Decision System — Return: {returnId}</p>

      {triageResult.requiresExpert && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} /> <strong>Expert Technician Required:</strong> High value, low confidence, or critical defect detected.
        </div>
      )}

      {/* Selected Pathway Hero */}
      <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', border: `3px solid ${selected.borderColor}`, background: `linear-gradient(135deg, ${selected.bgColor}, white)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <div style={{ fontSize: 56 }}>{selected.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="badge badge-green" style={{ marginBottom: 'var(--space-sm)' }}>
              <Sparkles size={12} /> RECOMMENDED PATHWAY
            </div>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: selected.color }}>{selected.name}</h2>
            <p className="text-muted">{selected.desc}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="score-circle score-high" style={{ width: 90, height: 90, fontSize: 'var(--font-size-3xl)' }}>
              {triageResult.scores[selected.id].score}
            </div>
            <div className="text-sm text-muted mt-sm">Score</div>
          </div>
        </div>

        {/* Recovery Estimate */}
        <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-xl)' }}>
          <div>
            <div className="text-sm text-muted">Original Value</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>₹{triageResult.estimatedRecovery.original.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted">Estimated Recovery</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--green-700)' }}>₹{triageResult.estimatedRecovery.recovered.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted">Recovery Rate</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--green-700)' }}>
              <TrendingUp size={16} style={{ display: 'inline', marginRight: 4 }} />{triageResult.estimatedRecovery.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* All Pathways Comparison */}
      <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>All Pathway Scores</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {pathways.map(p => {
          const result = triageResult.scores[p.id];
          const isSelected = p.id === triageResult.selectedPathway;
          return (
            <div key={p.id} className="card" style={{
              padding: 'var(--space-md)', textAlign: 'center',
              border: isSelected ? `3px solid ${p.borderColor}` : '1px solid var(--gray-200)',
              opacity: result.eligible ? 1 : 0.5,
              background: isSelected ? p.bgColor : 'white',
            }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>{p.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>{p.name}</div>
              {result.eligible ? (
                <>
                  <div className={`score-circle ${result.score >= 80 ? 'score-high' : result.score >= 50 ? 'score-medium' : 'score-low'}`}
                    style={{ margin: '0 auto', width: 50, height: 50, fontSize: 'var(--font-size-md)' }}>
                    {result.score}
                  </div>
                  <div className="badge badge-green" style={{ marginTop: 'var(--space-sm)' }}>
                    <Check size={10} /> Eligible
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: 'var(--gray-400)', fontWeight: 700, fontSize: 'var(--font-size-2xl)', margin: 'var(--space-sm) 0' }}>—</div>
                  <div className="badge badge-red"><X size={10} /> Ineligible</div>
                  <div className="text-sm text-muted mt-sm" style={{ fontSize: 'var(--font-size-xs)' }}>{result.reason}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Explainability */}
      <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowExplain(!showExplain)} style={{ marginBottom: 'var(--space-md)' }}>
          {showExplain ? 'Hide' : 'Show'} Decision Reasoning
        </button>
        {showExplain && (
          <div className="fade-in">
            <div className="alert alert-success">
              <div><strong>AI Reasoning:</strong> {triageResult.reasoning}</div>
            </div>
            <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Scoring Breakdown — {selected.name}</h4>
            {Object.entries(triageResult.scores[selected.id].factors || {}).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
                  <span style={{ textTransform: 'capitalize' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}/100</span>
                </div>
                <div className="score-bar"><div className={`score-bar-fill ${v >= 80 ? 'high' : v >= 60 ? 'medium' : 'low'}`} style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <Link to="/marketplace" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          <ArrowRight size={16} /> View in Marketplace
        </Link>
        <button className="btn btn-secondary btn-lg" onClick={handleRetriage}>
          <RefreshCw size={16} /> Re-Triage
        </button>
      </div>
    </div>
  );
}
