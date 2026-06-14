import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Leaf, Store, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getGreenWallet, fetchProducts } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, logout } = useAuth();

  // Simulated notifications
  const notifications = [
    { id: 1, text: "Your returned iPhone 13 was certified 'Like-New'!", time: "2m ago", unread: true },
    { id: 2, text: "You earned 20 Green Credits for sustainable recycling.", time: "1h ago", unread: true },
    { id: 3, text: "Your refund for Order #ORD-1234 has been processed.", time: "1d ago", unread: false }
  ];

  // Fetch real credits from API
  useEffect(() => {
    getGreenWallet()
      .then(data => setCredits(data.balance ?? data.totalCredits ?? 0))
      .catch(() => setCredits(0));
  }, [path]); // refetch on every page navigation to stay in sync

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
    setShowNotifications(false);
  }, [path]);

  // Live search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetchProducts()
        .then(data => {
          const products = data.products || data;
          const q = searchQuery.toLowerCase();
          const filtered = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
          );
          setSearchResults(filtered.slice(0, 6));
          setShowSearch(true);
        })
        .catch(() => setSearchResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (productId) => {
    setSearchQuery('');
    setShowSearch(false);
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0].id);
    }
  };

  const subLinks = user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Admin Dashboard' },
        { to: '/marketplace', label: 'Re:Loop Marketplace' },
        { to: '/', label: 'All Products' },
      ]
    : [
        { to: '/', label: 'All Products' },
        { to: '/orders', label: 'My Orders' },
        { to: '/returns', label: 'Return History' },
        { to: '/marketplace', label: 'Re:Loop Marketplace' },
        { to: '/green-credits', label: '🌱 Green Credits' },
      ];

  return (
    <div className="app-container">
      {/* Main Header */}
      <header className="header">
        <div className="header-main">
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="header-logo">
            <div className="header-logo-icon">♻</div>
            <div className="header-logo-text">
              Re<span>:</span>Loop
            </div>
          </Link>

          <form className="header-search" onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search products, categories, or brands..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            <button className="header-search-btn" type="submit" aria-label="Search">
              <Search size={18} />
            </button>

            {/* Search Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    className="search-dropdown-item"
                    onMouseDown={() => handleSearchSelect(p.id)}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 500,
                        fontSize: 'var(--font-size-sm)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>{p.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                        {p.category} • ₹{p.price?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          <nav className="header-nav" style={{ position: 'relative' }}>
            <button className="header-nav-item" onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Bell size={20} color="var(--gray-300)" />
                <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--amazon-orange)', width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--amazon-dark)' }} />
              </div>
            </button>
            
            {showNotifications && (
              <div className="search-dropdown" style={{ right: 0, left: 'auto', width: 320 }}>
                <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>Notifications</div>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--gray-100)', background: n.unread ? 'var(--blue-50)' : 'white' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>{n.text}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/green-credits" className="header-nav-item">
              <span className="header-nav-label">Your</span>
              <span className="header-nav-value" style={{ color: '#66BB6A' }}>
                <Leaf size={14} style={{ display: 'inline', marginRight: 4 }} />
                {credits !== null ? `${credits} Credits` : '...'}
              </span>
            </Link>
            <Link to="/returns" className="header-nav-item">
              <span className="header-nav-label">Your</span>
              <span className="header-nav-value">Returns</span>
            </Link>
            <Link to="/marketplace" className="header-nav-item">
              <span className="header-nav-label">Re:Loop</span>
              <span className="header-nav-value">
                <Store size={14} style={{ display: 'inline', marginRight: 4 }} />
                Marketplace
              </span>
            </Link>

            {user ? (
              <div className="header-nav-item" onClick={logout} style={{ cursor: 'pointer' }}>
                <span className="header-nav-label">Hello, {user.name.split(' ')[0]}</span>
                <span className="header-nav-value">Log Out</span>
              </div>
            ) : (
              <Link to="/login" className="header-nav-item">
                <span className="header-nav-label">Account</span>
                <span className="header-nav-value">Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Sub Header */}
      <div className="subheader">
        <div className="subheader-inner">
          {subLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`subheader-link ${path === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                ♻ Re<span style={{ color: 'var(--green-400)' }}>:</span>Loop
              </span>
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-menu-credits">
              <Leaf size={16} />
              <span>{credits !== null ? `${credits} Green Credits` : 'Loading...'}</span>
            </div>
            {subLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-menu-link ${path === link.to ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Page Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--amazon-dark)',
        color: 'var(--gray-400)',
        textAlign: 'center',
        padding: 'var(--space-lg)',
        fontSize: 'var(--font-size-sm)',
        marginTop: 'auto'
      }}>
        <div style={{ marginBottom: 'var(--space-sm)' }}>
          <span style={{ color: 'var(--green-400)', fontWeight: 700, fontSize: 'var(--font-size-md)' }}>
            Re<span style={{ color: 'var(--green-300)' }}>:</span>Loop
          </span>
          {' '}— AI-Powered Return Intelligence & Second-Life Commerce
        </div>
        <div>
          Built for HackOn with Amazon Season 6.0 &bull; Powered by AWS & Google Gemini
        </div>
      </footer>
    </div>
  );
}
