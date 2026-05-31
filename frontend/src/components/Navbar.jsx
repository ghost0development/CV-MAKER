import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary-600">
            <FileText size={28} />
            CV Maker
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 transition-colors">
              <Briefcase size={16} /> JobBoard
            </Link>
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <User size={16} /> {user.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
              <LogOut size={16} /> Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
