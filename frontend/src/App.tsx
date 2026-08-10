import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';

// Route guards
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoryListPage from './pages/StoryListPage';
import StoryDetailPage from './pages/StoryDetailPage';
import ChapterReadPage from './pages/ChapterReadPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ═══════ Public routes with MainLayout ═══════ */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stories" element={<StoryListPage />} />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
            <Route path="/chapters/:id" element={<ChapterReadPage />} />
          </Route>

          {/* ═══════ Auth routes (no layout) ═══════ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ═══════ Protected routes (requires auth) ═══════ */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Future protected user pages go here */}
            </Route>
          </Route>

          {/* ═══════ Admin routes (requires ADMIN role) ═══════ */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Future admin pages: /admin/stories, /admin/chapters, etc. */}
            </Route>
          </Route>
        </Routes>
      </Router>

      {/* Global toast notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2d2a3e',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
