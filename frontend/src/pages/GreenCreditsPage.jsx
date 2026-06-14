import { useState, useEffect } from 'react';
import { getGreenWallet, getBadges, getCreditRewards, redeemCredits } from '../api';

export default function GreenCreditsPage() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [wallet, setWallet] = useState({ balance: 0, tier: 'New', sustainabilityScore: 0, history: [] });
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [creditRules, setCreditRules] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGreenWallet().then(setWallet),
      getBadges().then(res => setBadges(res.badges)),
      getCreditRewards().then(res => {
        setRewards(res.rewards || []);
        setCreditRules(res.rules || {});
      })
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    try {
      const updatedWallet = await redeemCredits(reward.cost, reward.id);
      setWallet(updatedWallet);
      setBadges(updatedWallet.badges || badges);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCredits = wallet.balance || 0;
  const sustainabilityScore = wallet.sustainabilityScore || 0;
  const tier = wallet.tier || 'New';
  const history = wallet.history || [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Wallet Hero */}
      {loading ? (
        <div className="green-wallet skeleton" style={{ height: 200, marginBottom: 'var(--space-xl)' }} />
      ) : (
        <div className="green-wallet" style={{ marginBottom: 'var(--space-xl)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-xl)', padding: 'var(--space-2xl)' }}>
          <div>
            <div className="green-wallet-label">Total Green Credits</div>
            <div className="green-wallet-balance">🌱 {totalCredits}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8, marginTop: 'var(--space-xs)' }}>≈ ₹{totalCredits} redeemable value</div>
          </div>
          <div>
            <div className="green-wallet-label">Sustainability Score</div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{sustainabilityScore}/100</div>
            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8, marginTop: 'var(--space-xs)' }}>Above average!</div>
          </div>
          <div>
            <div className="green-wallet-label">Your Tier</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>🛡️ {tier}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8, marginTop: 'var(--space-xs)' }}>250 more to Eco Champion</div>
          </div>
        </div>
      )}

      {/* Earning Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        {Object.entries(creditRules).map(([key, rule]) => (
          <div key={key} className="card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{rule.icon}</div>
            <div style={{ fontWeight: 700, color: 'var(--green-700)', marginTop: 'var(--space-xs)' }}>+{rule.credits}</div>
            <div className="text-sm text-muted">{rule.action}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--gray-200)', paddingBottom: 'var(--space-sm)' }}>
        {['wallet', 'badges', 'redeem'].map(t => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t === 'wallet' ? '📊 History' : t === 'badges' ? '🏆 Badges' : '🎁 Redeem'}</button>
        ))}
      </div>

      {/* History */}
      {activeTab === 'wallet' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {history.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No history yet.</div> : history.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', borderBottom: i < history.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
              <div style={{ fontSize: 24 }}>{h.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{h.action}</div>
                <div className="text-sm text-muted">{h.date}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--green-700)', fontSize: 'var(--font-size-lg)' }}>+{h.credits}</div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
          {badges.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>No badges yet.</div> : badges.map(b => (
            <div key={b.id} className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', opacity: b.earned ? 1 : 0.6 }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--space-sm)' }}>{b.emoji}</div>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-xs)' }}>{b.name}</div>
              <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-sm)' }}>{b.desc}</div>
              {b.earned ? (
                <span className="badge badge-green">✓ Earned</span>
              ) : (
                <div>
                  <div className="score-bar" style={{ marginBottom: 4 }}>
                    <div className="score-bar-fill high" style={{ width: `${(b.progress / b.target) * 100}%` }} />
                  </div>
                  <div className="text-sm text-muted">{b.progress}/{b.target}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Redeem */}
      {activeTab === 'redeem' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
          {rewards.map(r => (
            <div key={r.id} className="card" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <div style={{ fontSize: 40 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div className="text-sm text-muted">{r.cost} Green Credits</div>
              </div>
              <button className="btn btn-primary btn-sm" disabled={totalCredits < r.cost} onClick={() => handleRedeem(r)}>
                {totalCredits >= r.cost ? 'Redeem' : 'Need More'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
