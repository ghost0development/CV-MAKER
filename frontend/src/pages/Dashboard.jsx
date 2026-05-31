import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy, Trash2, Share2, Download, Eye, MoreVertical } from 'lucide-react';
import { cvs } from '../api/client';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await cvs.list();
      setCvList(data);
    } catch {
      toast.error('Nie udało się załadować CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      const cv = await cvs.create({ title: 'Moje CV' });
      navigate(`/editor/${cv.id}`);
    } catch {
      toast.error('Nie udało się utworzyć CV');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Na pewno usunąć to CV?')) return;
    try {
      await cvs.delete(id);
      setCvList(prev => prev.filter(c => c.id !== id));
      toast.success('CV usunięte');
    } catch {
      toast.error('Błąd usuwania');
    }
  };

  const handleClone = async (id) => {
    try {
      const cloned = await cvs.clone(id);
      setCvList(prev => [...prev, cloned]);
      toast.success('CV skopiowane');
    } catch {
      toast.error('Błąd kopiowania');
    }
  };

  const handleShare = async (id) => {
    try {
      const res = await cvs.share(id);
      const link = `${window.location.origin}/shared/${res.shareLink}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link skopiowany do schowka!');
    } catch {
      toast.error('Błąd udostępniania');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const blob = await cvs.downloadPDF(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cv-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF pobrany');
    } catch {
      toast.error('Błąd generowania PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje CV</h1>
          <p className="text-gray-500 mt-1">Zarządzaj swoimi dokumentami</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 py-3 px-6">
          <Plus size={20} /> Nowe CV
        </button>
      </div>

      {cvList.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Brak CV</h2>
          <p className="text-gray-400 mb-6">Stwórz swoje pierwsze CV</p>
          <button onClick={handleCreate} className="btn-primary">Utwórz CV</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvList.map(cv => (
            <div key={cv.id} className="card hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FileText size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cv.title}</h3>
                    <p className="text-xs text-gray-400">Szablon: {cv.template}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Ostatnia zmiana: {new Date(cv.updated_at).toLocaleString('pl-PL')}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate(`/editor/${cv.id}`)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Eye size={14} /> Edytuj
                </button>
                <button onClick={() => handleClone(cv.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Copy size={14} /> Kopiuj
                </button>
                <button onClick={() => handleShare(cv.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Share2 size={14} /> Udostępnij
                </button>
                <button onClick={() => handleDownloadPDF(cv.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Download size={14} /> PDF
                </button>
                <button onClick={() => handleDelete(cv.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all text-xs">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
