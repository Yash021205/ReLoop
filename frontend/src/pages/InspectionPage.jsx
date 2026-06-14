import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Camera, Check, X, MessageCircle, ArrowRight, ArrowLeft, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import { uploadImages, validateImage, runVisionInspection, getFollowUpQuestions, submitAnswers as submitAnswersApi, verifyClaim, getProductProfile, getInspectionRequirements } from '../api';

export default function InspectionPage() {
  const { returnId } = useParams();
  const [phase, setPhase] = useState('capture');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [visionResult, setVisionResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [claimResult, setClaimResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [angles, setAngles] = useState([]);

  useEffect(() => {
    getInspectionRequirements(returnId)
      .then(res => setAngles(res.angles || []))
      .catch(err => console.error("Failed to load inspection requirements:", err));
  }, [returnId]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(f => ({ name: f.name, url: URL.createObjectURL(f), status: 'validating' }));
    setUploadedImages(prev => [...prev, ...newImages]);
    
    try {
      await uploadImages(returnId, files);
      const validatedImages = await Promise.all(newImages.map(async img => {
        const res = await validateImage(returnId, img.url);
        return { ...img, status: res.valid ? 'pass' : 'fail', feedback: res.feedback };
      }));
      setUploadedImages(prev => [...prev.filter(p => !newImages.find(n => n.name === p.name)), ...validatedImages]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const runVision = async () => {
    setProcessing(true);
    try {
      const res = await runVisionInspection(returnId);
      setVisionResult(res);
      setPhase('vision');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await getFollowUpQuestions(returnId);
      setQuestions(res.questions);
      setPhase('questions');
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswers = async () => {
    setProcessing(true);
    try {
      await submitAnswersApi(returnId, answers);
      setPhase('success');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const phases = [
    { id: 'capture', label: 'Upload Images', num: 1 },
    { id: 'questions', label: 'Details', num: 2 },
    { id: 'success', label: 'Complete', num: 3 },
  ];

  const currentPhaseIdx = phases.findIndex(p => p.id === phase);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
        AI Inspection & Verification
      </h1>
      <p className="text-muted mb-lg">Return: {returnId} — Module 3</p>

      {/* Phase Steps */}
      <div className="steps" style={{ marginBottom: 'var(--space-2xl)' }}>
        {phases.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div className={`step ${phase === p.id ? 'active' : currentPhaseIdx > i ? 'completed' : ''}`}>
              <div className="step-number">{currentPhaseIdx > i ? '✓' : p.num}</div>
              <span className="step-label">{p.label}</span>
            </div>
            {i < phases.length - 1 && <div style={{ flex: 1, height: 2, background: currentPhaseIdx > i ? 'var(--green-500)' : 'var(--gray-300)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      {/* Phase A: Smart Capture */}
      {phase === 'capture' && (
        <div className="fade-in">
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <Camera size={24} color="var(--green-600)" />
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Smart Capture Assistant</h2>
                <p className="text-sm text-muted">AI guides you to provide high-quality inspection images</p>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>Required Views:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {angles.map((angle, i) => (
                  <div key={angle} style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    border: `1px solid ${uploadedImages.length > i ? 'var(--green-400)' : 'var(--gray-300)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    background: uploadedImages.length > i ? 'var(--green-50)' : 'white',
                    color: uploadedImages.length > i ? 'var(--green-700)' : 'var(--gray-600)',
                  }}>
                    {uploadedImages.length > i ? <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> : null}
                    {angle}
                  </div>
                ))}
              </div>
            </div>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed var(--green-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2xl)',
              cursor: 'pointer', background: 'var(--green-50)', transition: 'all var(--transition-fast)',
            }}>
              <Upload size={32} color="var(--green-500)" />
              <div style={{ fontWeight: 600, marginTop: 'var(--space-sm)' }}>Upload Product Images</div>
              <div className="text-sm text-muted">Drag & drop or click to browse</div>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>

            {uploadedImages.length > 0 && (
              <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-sm)' }}>
                {uploadedImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative', border: `2px solid ${img.status === 'pass' ? 'var(--green-400)' : img.status === 'fail' ? 'var(--error)' : 'var(--gray-300)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button 
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                    <div style={{ padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--font-size-xs)', background: img.status === 'pass' ? 'var(--green-50)' : img.status === 'fail' ? '#FFEBEE' : 'var(--gray-50)' }}>
                      {img.status === 'validating' ? '⏳ Validating...' : img.feedback}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-lg" disabled={uploadedImages.filter(i => i.status === 'pass').length < 2} onClick={loadQuestions}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Phase B: Adaptive Questions */}
      {phase === 'questions' && (
        <div className="fade-in">
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <MessageCircle size={22} color="var(--green-600)" /> Adaptive Information Collection
            </h2>
            <p className="text-sm text-muted mb-lg">AI has identified information gaps that images alone cannot reveal.</p>

            {questions.map(q => (
              <div key={q.id} style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{q.text}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  {q.options.map(opt => (
                    <button key={opt} className={`btn ${answers[q.id] === opt ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-md)' }}
            disabled={Object.keys(answers).length < questions.length} onClick={submitAnswers}>
            {processing ? '⏳ Submitting...' : <><Check size={16} /> Submit Return Details</>}
          </button>
        </div>
      )}

      {/* Phase C: Success */}
      {phase === 'success' && (
        <div className="fade-in card text-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--space-md)' }}>✅</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
            Return Details Submitted
          </h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
            We've received your images and details. We will notify you once the return is fully processed.
          </p>
          <Link to="/returns" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            Go to Return History
          </Link>
        </div>
      )}
    </div>
  );
}
