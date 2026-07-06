import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage    from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Layout       from './components/Layout/Layout';
import './styles/globals.css';

// Lazy-load dashboard pages so the initial bundle only ships what's needed for auth screens
const Overview      = lazy(() => import('./components/Dashboard/Overview'));
const PreviewPage   = lazy(() => import('./components/Dashboard/PreviewPage'));
const ProfilePage   = lazy(() => import('./components/Profile/ProfilePage'));
const SkillsPage    = lazy(() => import('./components/Skills/SkillsPage'));
const ProjectsPage  = lazy(() => import('./components/Projects/ProjectsPage'));
const CategoriesPage = lazy(() => import('./components/Categories/CategoriesPage'));
const PublicPortfolioPage = lazy(() => import('./components/Public/PublicPortfolioPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
);

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};
const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<Public><LoginPage /></Public>} />
      <Route path="/register" element={<Public><RegisterPage /></Public>} />
      <Route path="/portfolio/:userId" element={<Suspense fallback={<PageLoader />}><PublicPortfolioPage /></Suspense>} />
      <Route path="/dashboard" element={<Private><Layout /></Private>}>
        <Route index             element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
        <Route path="profile"   element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="skills"    element={<Suspense fallback={<PageLoader />}><SkillsPage /></Suspense>} />
        <Route path="projects"  element={<Suspense fallback={<PageLoader />}><ProjectsPage /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>} />
        <Route path="preview"   element={<Suspense fallback={<PageLoader />}><PreviewPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#fff', color: '#1e2235', border: '1px solid #e6e8f1', fontSize: '13.5px', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(79,70,229,0.08)' },
            success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#b91c1c', secondary: '#fff' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
