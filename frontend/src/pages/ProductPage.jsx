import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Zap, Leaf, Shield, AlertTriangle, Check, HelpCircle, ArrowLeft } from 'lucide-react';
import { fetchProduct, fetchGuidance } from '../api';


function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#ff9900' : 'none'} color={i <= rating ? '#ff9900' : '#ccc'} />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchProduct(id)
      .then(data => setProduct(data))
      .catch(err => console.error("Failed to load product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGetGuidance = () => {
    setShowGuidance(true);
    setIsAnalyzing(true);
    // Simulate AI thinking delay for realism
    setTimeout(() => {
      fetchGuidance(id, { useCase })
        .then(data => setGuidance(data))
        .catch(err => console.error("Failed to fetch guidance:", err))
        .finally(() => setIsAnalyzing(false));
    }, 1500);
  };

  if (loading || !product) {
    return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>Loading product...</div>;
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Product Image */}
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 160, lineHeight: 1 }}>{product.emoji}</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width: 60, height: 60, background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: i===1 ? '2px solid var(--green-500)' : '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {product.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-xs)' }}>
            {product.brand} &bull; {product.category}
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, lineHeight: 1.3, marginBottom: 'var(--space-md)' }}>
            {product.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <StarRating rating={product.rating} />
            <span style={{ color: 'var(--teal-700)', fontSize: 'var(--font-size-sm)' }}>
              {product.reviewCount?.toLocaleString()} ratings
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)', padding: 'var(--space-md) 0', marginBottom: 'var(--space-md)' }}>
            {discount > 0 && (
              <span className="badge badge-red" style={{ marginBottom: 'var(--space-sm)', display: 'inline-block' }}>
                {discount}% OFF
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
              <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--gray-500)', fontSize: 'var(--font-size-md)' }}>
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-sm text-muted" style={{ marginTop: 'var(--space-xs)' }}>Inclusive of all taxes</div>
          </div>

          <p style={{ lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>{product.description}</p>

          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Key Features</h3>
          <ul style={{ marginBottom: 'var(--space-lg)' }}>
            {product.features?.map((f, i) => (
              <li key={i} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <Check size={14} color="var(--green-600)" /> {f}
              </li>
            ))}
          </ul>

          {product.specs && (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Specifications</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-lg)' }}>
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '8px 12px', background: 'var(--gray-50)', fontWeight: 500, fontSize: 'var(--font-size-sm)', width: '40%', border: '1px solid var(--gray-200)' }}>{k}</td>
                      <td style={{ padding: '8px 12px', fontSize: 'var(--font-size-sm)', border: '1px solid var(--gray-200)' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Buy Box + Smart Guidance */}
        <div>
          {/* Buy Box */}
          <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
              ₹{product.price?.toLocaleString()}
            </div>
            <div style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
              🟢 In Stock
            </div>
            <button className="btn btn-amazon btn-full" style={{ marginBottom: 'var(--space-sm)' }}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button className="btn btn-primary btn-full">
              <Zap size={16} /> Buy Now
            </button>
          </div>

          {/* Re:Loop Smart Guidance Panel */}
          <div className="card" style={{ border: '2px solid var(--green-300)', overflow: 'visible' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--green-700), var(--teal-700))',
              color: 'white',
              padding: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}>
              <Leaf size={18} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Re:Loop Smart Guidance</div>
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>AI-Powered Purchase Intelligence</div>
              </div>
            </div>
            <div style={{ padding: 'var(--space-md)' }}>
              {/* Return Risk Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)', background: product.returnRate > 10 ? '#FFF3E0' : 'var(--green-50)', borderRadius: 'var(--radius-sm)' }}>
                {product.returnRate > 10 ? <AlertTriangle size={16} color="#E65100" /> : <Shield size={16} color="var(--green-700)" />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    {product.returnRate > 10 ? 'Elevated Return Rate' : product.returnRate > 7 ? 'Moderate Return Rate' : 'Low Return Rate'}
                  </div>
                  <div className="text-sm text-muted">{product.returnRate}% of purchases returned</div>
                </div>
              </div>

              {/* Use Case Matching */}
              <div className="form-group">
                <label className="form-label">What will you use this for?</label>
                <select className="form-input form-select" value={useCase} onChange={e => setUseCase(e.target.value)}>
                  <option value="">Select your use case...</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Travel">Travel</option>
                  <option value="Work">Office / Work</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Music">Music Production</option>
                  <option value="Casual">Casual / Everyday</option>
                </select>
              </div>

              <button className="btn btn-primary btn-sm btn-full" onClick={handleGetGuidance}>
                <HelpCircle size={14} /> Get AI Recommendation
              </button>

              {/* Guidance Results */}
              {showGuidance && isAnalyzing && (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-lg)', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto var(--space-sm)' }} />
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--teal-700)' }}>Processing...</div>
                  <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>Checking reviews and common return reasons</div>
                </div>
              )}

              {showGuidance && !isAnalyzing && guidance && (
                <div className="fade-in" style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                    
                    {/* Fit Confidence Meter */}
                    <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>AI Fit Confidence</span>
                        <span style={{ fontWeight: 700, color: guidance.useCaseMatch ? 'var(--green-600)' : 'var(--amazon-orange)' }}>
                          {guidance.useCaseMatch ? '92%' : '65%'}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: guidance.useCaseMatch ? '92%' : '65%', height: '100%', background: guidance.useCaseMatch ? 'var(--green-500)' : 'var(--amazon-orange)', borderRadius: 3, transition: 'width 1s ease-out' }} />
                      </div>
                    </div>
                    {guidance.recommendation && (
                      <div className="alert alert-info" style={{ fontSize: 'var(--font-size-sm)' }}>
                        <div>{guidance.recommendation}</div>
                      </div>
                    )}
                    {guidance.useCaseMatch && (
                      <div style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Use-Case Match:</strong> {guidance.useCaseMatch}
                      </div>
                    )}
                    {guidance.sizeRecommendation && (
                      <div style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Size Tip:</strong> {guidance.sizeRecommendation}
                      </div>
                    )}
                    {guidance.relevantReviews && (
                      <div style={{ marginTop: 'var(--space-sm)' }}>
                        <strong>Relevant Reviews:</strong>
                        {guidance.relevantReviews.map((r, i) => (
                          <div key={i} style={{ background: 'var(--gray-50)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-xs)' }}>
                            <StarRating rating={r.rating} size={10} />
                            <div style={{ marginTop: 2 }}>"{r.text}"</div>
                            <div className="text-muted" style={{ marginTop: 2 }}>— {r.author}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {product.commonReturnReasons?.length > 0 && (
                <div style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                  <strong>Common concerns:</strong>
                  <ul style={{ marginTop: 4 }}>
                    {product.commonReturnReasons.map((r, i) => (
                      <li key={i} style={{ padding: '2px 0' }}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
