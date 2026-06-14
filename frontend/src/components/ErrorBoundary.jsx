import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--space-lg)' }}>⚠️</div>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            marginBottom: 'var(--space-md)',
            color: 'var(--gray-900)',
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: 'var(--gray-600)',
            maxWidth: 500,
            marginBottom: 'var(--space-xl)',
            lineHeight: 1.6,
          }}>
            An unexpected error occurred. Please try refreshing the page or go back to the homepage.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Page
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              🏠 Go Home
            </button>
          </div>
          {this.state.error && (
            <details style={{
              marginTop: 'var(--space-xl)',
              padding: 'var(--space-md)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)',
              maxWidth: 600,
              textAlign: 'left',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--gray-600)',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                Technical Details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
