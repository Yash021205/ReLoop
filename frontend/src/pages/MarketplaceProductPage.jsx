import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ShoppingCart, Leaf, Eye, Clock, Award } from 'lucide-react';
import { getMarketplaceListing, buyMarketplaceListing } from '../api';
import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';

export default function MarketplaceProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    getMarketplaceListing(id)
      .then(data => setProduct(data.listing || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading product details...</div>;
  }

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      await buyMarketplaceListing(id);
      toast.success('Purchase successful! You earned +15 Green Credits.');
      navigate('/green-credits');
    } catch (err) {
      toast.error('Failed to complete purchase.');
      console.error(err);
    } finally {
      setIsBuying(false);
    }
  };

  const savings = product.originalPrice - product.reloopPrice;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={14} /> Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <div>
          <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
            <div className="label-verified-new" style={{ display: 'inline-block', marginBottom: 'var(--space-md)' }}>✅ {product.label}</div>
            <div style={{ fontSize: 140, lineHeight: 1 }}>{product.emoji}</div>
          </div>

          {/* Condition Report */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Eye size={18} color="var(--green-600)" /> AI Condition Report
            </h3>
            {Object.entries(product.report).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--gray-100)', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{k}</span>
                <span style={{ color: 'var(--green-700)' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>
              <Clock size={12} /> Inspected on {product.inspectionDate}
            </div>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, lineHeight: 1.3, marginBottom: 'var(--space-md)' }}>
            {product.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <span className="badge badge-green"><Shield size={12} /> Grade {product.grade}</span>
            <span className="badge badge-teal"><Award size={12} /> AI Verified</span>
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)', padding: 'var(--space-md) 0', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
              <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--green-700)' }}>₹{product.reloopPrice.toLocaleString()}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--gray-500)' }}>₹{product.originalPrice.toLocaleString()}</span>
              <span style={{ color: 'var(--error)', fontWeight: 600 }}>Save ₹{savings.toLocaleString()}</span>
            </div>
            <div className="text-sm text-muted">Re:Loop certified price</div>
          </div>

          {/* Scores */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-md)' }}>Inspection Scores</h3>
            {[
              { label: 'Overall Condition', value: product.conditionScore },
              { label: 'Visual Quality', value: product.visualScore },
              { label: 'Functionality', value: product.functionalityScore },
              { label: 'Accessories', value: product.accessoryScore },
              { label: 'AI Confidence', value: product.confidence },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
                  <span>{s.label}</span><span style={{ fontWeight: 600, color: s.value >= 90 ? 'var(--green-700)' : 'var(--gray-700)' }}>{s.value}%</span>
                </div>
                <div className="score-bar"><div className={`score-bar-fill ${s.value >= 80 ? 'high' : 'medium'}`} style={{ width: `${s.value}%` }} /></div>
              </div>
            ))}
          </div>

          <button className="btn btn-amazon btn-full btn-lg" style={{ marginBottom: 'var(--space-sm)' }}>
            <ShoppingCart size={18} /> Add to Cart
          </button>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={isBuying}>
            {isBuying ? 'Processing...' : 'Buy Now'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
            <span className="badge badge-green"><Leaf size={12} /> Earn +15 Green Credits with this purchase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
