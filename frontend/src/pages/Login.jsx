import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Zalogowano!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-600/20 rounded-2xl glow">
              <FileText size={40} className="text-primary-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">CV Maker</h1>
          <p className="text-gray-400 mt-2">Zaloguj się, aby kontynuować</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hasło</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input-field pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Nie masz konta? <Link to="/register" className="text-primary-400 font-medium hover:underline">Zarejestruj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
