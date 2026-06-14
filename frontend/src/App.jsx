import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import OrdersPage from './pages/OrdersPage';
import ReturnPage from './pages/ReturnPage';
import ReturnHistoryPage from './pages/ReturnHistoryPage';
import InspectionPage from './pages/InspectionPage';
import TriagePage from './pages/TriagePage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceProductPage from './pages/MarketplaceProductPage';
import GreenCreditsPage from './pages/GreenCreditsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/returns" element={<ProtectedRoute><ReturnHistoryPage /></ProtectedRoute>} />
                <Route path="/return/:orderId" element={<ProtectedRoute><ReturnPage /></ProtectedRoute>} />
                <Route path="/inspection/:returnId" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
                <Route path="/triage/:returnId" element={<ProtectedRoute requireAdmin={true}><TriagePage /></ProtectedRoute>} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/marketplace/:id" element={<MarketplaceProductPage />} />
                <Route path="/green-credits" element={<ProtectedRoute><GreenCreditsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
