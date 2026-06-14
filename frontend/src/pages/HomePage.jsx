import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Leaf, Zap } from 'lucide-react';
import { fetchProductCategories, fetchProducts } from '../api';

function StarRating({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card" style={{ textDecoration: 'none' }}>
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-md)',
        fontSize: '64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span>{product.emoji || '📦'}</span>
        {product.returnRisk === 'high' && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#FFF3E0',
            color: '#E65100',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
          }}>
            ⚠ High Return Rate
          </div>
        )}
      </div>
      <div className="product-card-title">{product.name}</div>
      <div className="product-card-rating">
        <StarRating rating={product.rating} />
        <span className="rating-count">({product.reviewCount?.toLocaleString()})</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
        <span className="product-card-price">
          <span className="currency">₹</span>{product.price?.toLocaleString()}
        </span>
        {product.originalPrice && (
          <span className="product-card-original-price">₹{product.originalPrice?.toLocaleString()}</span>
        )}
        {discount > 0 && (
          <span style={{ color: 'var(--error)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            ({discount}% off)
          </span>
        )}
      </div>
      {product.reloopAvailable && (
        <div className="badge badge-green" style={{ marginTop: 'var(--space-sm)', width: 'fit-content' }}>
          <Leaf size={12} /> Re:Loop Available
        </div>
      )}
    </Link>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductCategories()
      .then(data => setCategories(data.categories || ['All']))
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory === 'All' ? '' : activeCategory)
      .then(data => setProducts(data.products || data))
      .catch(err => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-900), var(--teal-700), var(--green-800))',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3xl) var(--space-2xl)',
        color: 'var(--white)',
        marginBottom: 'var(--space-2xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -60,
          right: -30,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -40,
          right: 100,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{ position: 'relative', maxWidth: 700 }}>
          <div className="badge badge-green" style={{ marginBottom: 'var(--space-md)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#A5D6A7' }}>
            <Leaf size={12} /> Powered by AI
          </div>
          <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>
            Amazon Re:Loop 🌱
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
            AI-Powered Return Intelligence & Second-Life Commerce.
            Every returned product deserves its highest-value next life.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn btn-amazon btn-lg" style={{ textDecoration: 'none' }}>
              <Store size={18} /> Explore Re:Loop Marketplace
            </Link>
            <Link to="/green-credits" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              <Leaf size={18} /> Green Credits
            </Link>
          </div>
        </div>
      </div>

      {/* Value Props Removed */}

      {/* Category Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', overflowX: 'auto' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
        {activeCategory === 'All' ? 'All Products' : activeCategory}
      </h2>

      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card" style={{ padding: 'var(--space-md)' }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '1', marginBottom: 'var(--space-md)' }} />
              <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 'var(--space-sm)' }} />
              <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 'var(--space-sm)' }} />
              <div className="skeleton" style={{ height: 20, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

function Store({ size }) {
  return <span style={{ fontSize: size }}>🏪</span>;
}
