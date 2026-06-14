import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, RotateCcw, Leaf, Shield } from 'lucide-react';
import { getAdminDashboard, getAdminReturns } from '../api';


const STATUS_COLORS = { Triaged: 'badge-green', Inspecting: 'badge-blue', Intercepted: 'badge-orange', Pending: 'badge-red' };
const PATHWAY_COLORS = { 'Verified Like-New': '#2E7D32', 'Open Box': '#E65100', 'Certified Refurbished': '#1565C0', Donation: '#7B1FA2', Recycling: '#616161', Exchange: '#0097A7' };
const DEFAULT_STATS = {
  totalReturns: 0, processedToday: 0, avgConditionScore: 0, recoveryRate: 0,
  pathwayDistribution: { 'Verified Like-New': 0, 'Open Box': 0, 'Certified Refurbished': 0, 'Donation': 0, 'Recycling': 0 },
  returnClassification: { 'Genuine Defect': 0, 'Wrong Variant': 0, 'Preference Mismatch': 0, 'Impulse Regret': 0, 'External Circumstance': 0 },
  valueRecovered: 0, valueSaved: 0, returnsPrevented: 0, greenCreditsIssued: 0,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentReturns, setRecentReturns] = useState([]);

  useEffect(() => {
    getAdminDashboard().then(res => setStats({
      ...DEFAULT_STATS,
      ...res,
      pathwayDistribution: { ...DEFAULT_STATS.pathwayDistribution, ...(res.pathwayDistribution || {}) },
      returnClassification: { ...DEFAULT_STATS.returnClassification, ...(res.returnClassification || {}) },
    })).catch(console.error);

    getAdminReturns().then(res => setRecentReturns(res.returns || [])).catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Admin Dashboard</h1>
      <p className="text-muted mb-lg">Re:Loop Operations & Analytics</p>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {[
          { label: 'Total Returns', value: stats.totalReturns, icon: <RotateCcw size={20} />, color: 'var(--info)', sub: `${stats.processedToday} today` },
          { label: 'Value Recovered', value: `₹${(stats.valueRecovered / 100000).toFixed(1)}L`, icon: <TrendingUp size={20} />, color: 'var(--green-700)', sub: `${stats.recoveryRate}% recovery rate` },
          { label: 'Returns Prevented', value: stats.returnsPrevented, icon: <Shield size={20} />, color: 'var(--amazon-orange)', sub: `₹${(stats.valueSaved / 1000).toFixed(0)}K saved` },
          { label: 'Green Credits Issued', value: stats.greenCreditsIssued.toLocaleString(), icon: <Leaf size={20} />, color: 'var(--green-500)', sub: 'Across all users' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <span className="text-sm text-muted">{kpi.label}</span>
              <div style={{ color: kpi.color }}>{kpi.icon}</div>
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: kpi.color }} className="count-up">{kpi.value}</div>
            <div className="text-sm text-muted">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="admin-charts-grid">
        {/* Pathway Distribution */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Recovery Pathway Distribution</h3>
          {Object.entries(stats.pathwayDistribution).map(([path, pct]) => (
            <div key={path} style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                <span>{path}</span><span style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: PATHWAY_COLORS[path], borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Return Classification */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Return Classification Breakdown</h3>
          {Object.entries(stats.returnClassification).map(([cls, pct]) => (
            <div key={cls} style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                <span>{cls}</span><span style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--teal-500)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Returns Table */}
      <div className="card admin-table-container">
        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
          Recent Returns
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)' }}>
              {['Return ID', 'Product', 'Category', 'Status', 'Pathway', 'Score', 'Date'].map(h => (
                <th key={h} style={{ padding: 'var(--space-sm) var(--space-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, borderBottom: '1px solid var(--gray-200)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentReturns.length === 0 ? <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem'}}>No returns yet.</td></tr> : recentReturns.map(r => (
              <tr key={r.id} className="admin-table-row" onClick={() => navigate(r.status === 'Triaged' ? '/marketplace' : `/triage/${r.id}`)}>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--teal-700)' }}>{r.id}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)' }}>{r.product}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)' }}>{r.category}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                  <span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  {r.triageResult?.requiresExpert && (
                    <span className="badge badge-red" style={{ marginLeft: 'var(--space-xs)', fontSize: '10px' }}>
                      <Shield size={10} style={{marginRight: 2}}/> Expert Reqd
                    </span>
                  )}
                </td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: PATHWAY_COLORS[r.pathway] || 'var(--gray-600)' }}>{r.pathway || '—'}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{r.score || '—'}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
