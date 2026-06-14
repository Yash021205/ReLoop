import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Leaf } from 'lucide-react';

import { getMarketplaceFilters, getMarketplaceListings } from '../api';

const LABEL_STYLES = {
  'Verified Like-New': { bg: 'linear-gradient(135deg, var(--green-50), #E0F2F1)', color: 'var(--green-800)', border: 'var(--green-300)', icon: '✅' },
  'Open Box': { bg: 'linear-gradient(135deg, #FFF8E1, #FFF3E0)', color: '#E65100', border: '#FFE0B2', icon: '📦' },
  'Certified Refurbished': { bg: 'linear-gradient(135deg, #E3F2FD, #E8EAF6)', color: '#1565C0', border: '#BBDEFB', icon: '🔧' },
};

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [filters, setFilters] = useState(['All']);

  useEffect(() => {
    getMarketplaceFilters()
      .then(res => setFilters(res.filters || ['All']))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    getMarketplaceListings(filter !== 'All' ? { label: filter } : {})
      .then(res => setListings(res.listings || res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      {/* Marketplace Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-800), var(--teal-700))',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-2xl)',
        color: 'white',
        marginBottom: 'var(--space-xl)',
      }}>
        <div className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#A5D6A7', border: 'none', marginBottom: 'var(--space-sm)' }}>
          <Leaf size={12} /> Sustainable Commerce
        </div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Re:Loop Marketplace</h1>
        <p style={{ opacity: 0.9 }}>AI-Verified Second-Life Products — Every product inspected, scored, and certified by AI.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f)}>
            {f !== 'All' && LABEL_STYLES[f]?.icon} {f}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="product-grid">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="product-card skeleton" style={{ height: 350 }} />
          ))
        ) : listings.map(item => {
          const style = LABEL_STYLES[item.label] || LABEL_STYLES['Verified Like-New'];
          const savings = item.originalPrice - item.reloopPrice;
          const savingsPct = Math.round((savings / item.originalPrice) * 100);
          return (
            <Link to={`/marketplace/${item.id}`} key={item.id} className="product-card" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '100%', aspectRatio: '1', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, marginBottom: 'var(--space-md)' }}>
                  {item.emoji}
                </div>
                <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: style.bg, color: style.color, border: `1px solid ${style.border}`, fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                  {style.icon} {item.label}
                </div>
              </div>
              <div className="product-card-title">{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                <span className="badge badge-green" style={{ fontSize: '10px' }}>
                  <Shield size={10} /> Grade {item.grade}
                </span>
                <span className="text-sm text-muted">Score: {item.conditionScore}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                <span className="product-card-price"><span className="currency">₹</span>{item.reloopPrice.toLocaleString()}</span>
                <span className="product-card-original-price">₹{item.originalPrice.toLocaleString()}</span>
              </div>
              <div style={{ color: 'var(--green-700)', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginTop: 'var(--space-xs)' }}>
                Save ₹{savings.toLocaleString()} ({savingsPct}%)
              </div>
              <div className="badge badge-teal" style={{ marginTop: 'var(--space-sm)', width: 'fit-content', fontSize: '10px' }}>
                <Leaf size={10} /> Earn +15 Green Credits
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
