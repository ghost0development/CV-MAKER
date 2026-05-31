import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CVEditor from './pages/CVEditor';
import SharedCV from './pages/SharedCV';
import JobMatch from './pages/JobMatch';
import JobDashboard from './pages/JobDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  return user ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><CVEditor /></ProtectedRoute>} />
        <Route path="/job-match" element={<ProtectedRoute><JobMatch /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobDashboard /></ProtectedRoute>} />
        <Route path="/shared/:link" element={<SharedCV />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}
