import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Hasła nie są zgodne');
    if (password.length < 6) return toast.error('Hasło musi mieć min. 6 znaków');
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Konto utworzone!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-2xl">
              <FileText size={40} className="text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Rejestracja</h1>
          <p className="text-gray-500 mt-2">Stwórz darmowe konto</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Jan Kowalski" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input-field pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 znaków" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdź hasło</label>
            <input type="password" className="input-field" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Powtórz hasło" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Masz już konto? <Link to="/login" className="text-primary-600 font-medium hover:underline">Zaloguj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
