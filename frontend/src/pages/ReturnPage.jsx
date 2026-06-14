import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle, RefreshCw, Package, Heart, Zap } from 'lucide-react';
import { initiateReturn, classifyReturn, decideReturn, fetchReturnReasons } from '../api';

export default function ReturnPage() {
  const { orderId } = useParams();
  const [returnReasons, setReturnReasons] = useState([]);
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [classification, setClassification] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [decision, setDecision] = useState(null);
  const [returnDoc, setReturnDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturnReasons()
      .then(res => setReturnReasons(res.reasons || []))
      .catch(err => console.error("Failed to load return reasons:", err));
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const initRes = await initiateReturn(orderId, { reason, explanation });
      setReturnDoc(initRes);
      const clsRes = await classifyReturn(initRes.returnId);
      setClassification(clsRes);
      setStep(3);
    } catch (err) {
      console.error("Failed to analyze:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDecision = async (dec) => {
    try {
      await decideReturn(returnDoc.returnId, dec);
      setDecision(dec);
      if (dec === 'exchange') {
        navigate(`/product/${returnDoc.productId}`);
      } else {
        setStep(4);
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
    }
  };

  const steps = [
    { num: 1, label: 'Reason' },
    { num: 2, label: 'Explain' },
    { num: 3, label: 'Options' },
    { num: 4, label: 'Confirmation' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Return Request — {orderId}
      </h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
        Powered by Re:Loop AI Return Intelligence
      </p>

      {/* Steps */}
      <div className="steps" style={{ marginBottom: 'var(--space-2xl)' }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div className={`step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
              <div className="step-number">{step > s.num ? '✓' : s.num}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-connector" style={{ flex: 1, height: 2, background: step > s.num ? 'var(--green-500)' : 'var(--gray-300)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Reason */}
      {step === 1 && (
        <div className="card fade-in" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
            Why are you returning this product?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {returnReasons.map(r => (
              <label key={r} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                border: `2px solid ${reason === r ? 'var(--green-500)' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: reason === r ? 'var(--green-50)' : 'white',
                transition: 'all var(--transition-fast)',
              }}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)}
                  style={{ accentColor: 'var(--green-600)', width: 18, height: 18 }} />
                <span style={{ fontWeight: reason === r ? 600 : 400 }}>{r}</span>
              </label>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-xl)' }} disabled={!reason} onClick={() => setStep(2)}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Explanation */}
      {step === 2 && (
        <div className="card fade-in" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            Tell us more
          </h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
            Help us understand your experience so we can find the best solution.
          </p>
          <div style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
            <span className="badge badge-green" style={{ marginBottom: 'var(--space-sm)' }}>Selected Reason</span>
            <div style={{ fontWeight: 600 }}>{reason}</div>
          </div>
          <textarea
            className="form-input form-textarea"
            placeholder="Please describe your experience in detail... (e.g., 'Battery drains too fast', 'Expected stronger bass', 'The product works fine but I don't need it anymore')"
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={5}
          />
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn btn-primary btn-lg" disabled={!explanation.trim()} onClick={handleAnalyze}>
              {analyzing ? (
                <>
                  <RefreshCw size={16} className="spinning" /> Submitting...
                </>
              ) : (
                <>
                  <MessageCircle size={16} /> Submit Return Request
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Intervention Options (Classification details hidden) */}
      {step === 3 && classification && (
        <div className="fade-in">
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Based on your request, here are your options:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {classification.action !== 'continue' && (
                <button className="btn btn-secondary btn-lg" onClick={() => handleDecision('exchange')} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                  <RefreshCw size={20} color="var(--info)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Exchange for a Different Variant</div>
                    <div className="text-sm text-muted">Get the right product delivered to you</div>
                  </div>
                </button>
              )}

              {(classification.action === 'keep' || classification.action === 'guidance') && (
                <button className="btn btn-secondary btn-lg" onClick={() => handleDecision('keep')} style={{ justifyContent: 'flex-start', textAlign: 'left', border: '2px solid var(--green-300)' }}>
                  <Heart size={20} color="var(--green-600)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--green-700)' }}>Keep the Product</div>
                    <div className="text-sm text-muted">
                      Earn <strong style={{ color: 'var(--green-700)' }}>+25 Green Credits</strong> 🌱
                    </div>
                  </div>
                </button>
              )}

              <button className="btn btn-secondary btn-lg" onClick={() => handleDecision('return')} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                <Package size={20} color="var(--gray-600)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Continue with Return</div>
                  <div className="text-sm text-muted">Proceed to AI inspection</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Decision Confirmation */}
      {step === 4 && (
        <div className="card fade-in" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          {decision === 'keep' ? (
            <>
              <div style={{ fontSize: 64, marginBottom: 'var(--space-md)' }}>🌱</div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--green-700)', marginBottom: 'var(--space-md)' }}>
                Thank You for Keeping Your Product!
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-lg)', maxWidth: 500, margin: '0 auto var(--space-lg)' }}>
                You've earned <strong style={{ color: 'var(--green-700)' }}>+25 Green Credits</strong>! Your decision helps reduce waste and supports sustainability.
              </p>
              <div className="green-wallet" style={{ display: 'inline-block', marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8 }}>Credits Earned</div>
                <div className="green-wallet-balance">+25 🌱</div>
              </div>
              <div><Link to="/green-credits" className="btn btn-primary">View Green Wallet</Link></div>
            </>
          ) : decision === 'exchange' ? null : (
            <>
              <div style={{ fontSize: 64, marginBottom: 'var(--space-md)' }}>📦</div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Return Confirmed
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                Let's inspect your product to process your return.
              </p>
              <Link to={`/inspection/${returnDoc.returnId}`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                <Zap size={18} /> Start Inspection
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
