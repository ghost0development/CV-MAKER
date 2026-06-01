import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy, Trash2, Share2, Download, Eye } from 'lucide-react';
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
      const cvData = await cvs.get(id);
      const data = JSON.parse(cvData.data);
      const lang = data.language === 'auto' ? 'pl' : (data.language || 'pl');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<!DOCTYPE html>
<html><head>
<title>CV - ${cvData.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: '${cvData.font || 'Inter'}', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cv-page { width: 210mm; min-height: 297mm; padding: 20mm 15mm; background: white; margin: 0; }
  @media print { body { margin: 0; } }
</style>
</head><body><div class="cv-page" style="font-family:'${cvData.font || 'Inter'}'">
<div style="border-bottom:3px solid ${cvData.theme === 'purple' ? '#9333ea' : '#2563eb'};padding-bottom:16px;margin-bottom:24px">
<h1 style="font-size:24px;font-weight:700;color:${cvData.theme === 'purple' ? '#9333ea' : '#2563eb'};margin-bottom:4px">${data.firstName||''} ${data.lastName||''}</h1>
${data.title ? `<p style="font-size:14px;color:#64748b;margin-bottom:8px">${data.title}</p>` : ''}
<p style="font-size:13px;color:#64748b">${[data.email,data.phone,data.location,data.website,data.linkedin].filter(Boolean).join(' · ')}</p>
</div>
${data.summary ? `<div style="margin-bottom:20px"><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:6px">PODSUMOWANIE</h2><p style="font-size:12px;color:#374151;line-height:1.6">${data.summary}</p></div>` : ''}
${data.experience?.length ? `<div style="margin-bottom:20px"><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:8px">DOŚWIADCZENIE</h2>${data.experience.map(e=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><div><p style="font-weight:600;font-size:13px">${e.position||''}</p><p style="font-size:12px;color:#64748b">${e.company||''}${e.location?', '+e.location:''}</p></div><p style="font-size:11px;color:#64748b;white-space:nowrap">${e.startDate||''} - ${e.endDate||'Obecnie'}</p></div>${e.description?`<p style="font-size:12px;color:#374151;margin-top:4px">${e.description}</p>`:''}</div>`).join('')}</div>` : ''}
${data.skills?.length ? `<div style="margin-bottom:20px"><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:8px">UMIEJĘTNOŚCI</h2>${data.skills.map(s=>`<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span style="font-weight:500">${s.name||''}</span><span style="color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};font-weight:600">${s.level||5}/10</span></div><div style="width:100%;background:#e5e7eb;border-radius:9999px;height:6px"><div style="width:${(s.level||5)*10}%;background:${cvData.theme==='purple'?'#9333ea':'#2563eb'};height:6px;border-radius:9999px"></div></div></div>`).join('')}</div>` : ''}
${data.languages?.length ? `<div style="margin-bottom:20px"><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:6px">JĘZYKI</h2>${data.languages.map(l=>`<p style="font-size:12px;color:#374151">${l.name||''}${l.level?' - '+l.level:''}</p>`).join('')}</div>` : ''}
${data.projects?.length ? `<div style="margin-bottom:20px"><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:6px">PROJEKTY</h2>${data.projects.map(p=>`<div style="margin-bottom:6px"><p style="font-weight:500;font-size:12px">${p.name||''}</p>${p.description?`<p style="font-size:12px;color:#374151">${p.description}</p>`:''}${p.url?`<p style="font-size:11px;color:#2563eb">${p.url}</p>`:''}</div>`).join('')}</div>` : ''}
${data.hobbies?.length ? `<div><h2 style="font-size:14px;font-weight:700;color:${cvData.theme==='purple'?'#9333ea':'#2563eb'};margin-bottom:6px">ZAINTERESOWANIA</h2><p style="font-size:12px;color:#374151">${data.hobbies.map(h=>h.name||h).join(', ')}</p></div>` : ''}
</div></body></html>`);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); };
      toast.success('PDF gotowy do druku');
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
          <h1 className="text-3xl font-bold text-gray-100">Moje CV</h1>
          <p className="text-gray-400 mt-1">Zarządzaj swoimi dokumentami</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 py-3 px-6">
          <Plus size={20} /> Nowe CV
        </button>
      </div>

      {cvList.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Brak CV</h2>
          <p className="text-gray-500 mb-6">Stwórz swoje pierwsze CV</p>
          <button onClick={handleCreate} className="btn-primary">Utwórz CV</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvList.map(cv => (
            <div key={cv.id} className="card glow-hover transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-600/20 rounded-lg">
                    <FileText size={24} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{cv.title}</h3>
                    <p className="text-xs text-gray-500">Szablon: {cv.template}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
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
                <button onClick={() => handleDelete(cv.id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all text-xs">
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
