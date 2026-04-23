import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';

import NewsPage from './pages/NewsPage';

import BattlePage from './pages/BattlePage';
import HighlightsPage from './pages/HighlightsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white transition-colors duration-300 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[rgba(255,255,255,0.05)] via-transparent to-transparent pointer-events-none" />
          <Navbar />
          <main className="container mx-auto px-4 py-8 relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/battle" element={<ProtectedRoute><BattlePage /></ProtectedRoute>} />
              <Route path="/highlights" element={<ProtectedRoute><HighlightsPage /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
