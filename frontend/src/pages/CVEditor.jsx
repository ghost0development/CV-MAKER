import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Download, Eye, Edit3, Plus, Trash2, GripVertical, Share2, Palette, Type, Layout, User, Briefcase, GraduationCap, Wrench, Globe, Award, FolderGit, Heart, Languages, Image, Bot } from 'lucide-react';
import { cvs, templates } from '../api/client';
import { t, detectLanguage, getRatingLabel } from '../i18n';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'blue', name: 'Niebieski', color: '#2563eb' },
  { id: 'green', name: 'Zielony', color: '#16a34a' },
  { id: 'purple', name: 'Fioletowy', color: '#9333ea' },
  { id: 'red', name: 'Czerwony', color: '#dc2626' },
  { id: 'orange', name: 'Pomarańczowy', color: '#ea580c' },
  { id: 'teal', name: 'Morski', color: '#0d9488' },
  { id: 'pink', name: 'Różowy', color: '#db2777' },
  { id: 'gray', name: 'Szary', color: '#4b5563' },
];

const FONTS = [
  { id: 'Inter', name: 'Inter' },
  { id: 'Arial', name: 'Arial' },
  { id: 'Georgia', name: 'Georgia' },
  { id: 'Times New Roman', name: 'Times New Roman' },
  { id: 'Courier New', name: 'Courier New' },
];

const DEFAULT_DATA = {
  photo: null,
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  hobbies: [],
  language: 'pl',
  aiSuggestions: {
    summary: '',
    experience: [],
    skills: []
  }
};

function SectionCard({ icon: Icon, label, children }) {
  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icon size={18} className="text-primary-600" />
        <h3 className="font-semibold text-gray-800">{label}</h3>
      </div>
      {children}
    </div>
  );
}

function EntryEditor({ entries, setEntries, fields }) {
  const add = () => {
    const empty = {};
    fields.forEach(f => { empty[f.key] = ''; });
    setEntries([...entries, empty]);
  };

  const update = (index, key, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [key]: value };
    setEntries(updated);
  };

  const remove = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1">
            <Trash2 size={14} />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
            {fields.map(f => (
              <div key={f.key} className={f.fullWidth ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-medium text-gray-500">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea className="input-field text-sm" rows={2} value={entry[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.placeholder} />
                ) : (
                  <input type="text" className="input-field text-sm" value={entry[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={add} className="btn-secondary text-sm flex items-center gap-1 w-full justify-center py-2">
        <Plus size={16} /> Dodaj
      </button>
    </div>
  );
}

export default function CVEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState(null);
  const [data, setData] = useState(DEFAULT_DATA);
  const [template, setTemplate] = useState('modern');
  const [theme, setTheme] = useState('blue');
  const [font, setFont] = useState('Inter');
  const [title, setTitle] = useState('Moje CV');
  const [saving, setSaving] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const previewRef = useRef(null);

  useEffect(() => {
    templates.list().then(setTemplateList).catch(() => {});
    cvs.get(id).then(cvData => {
      setCv(cvData);
      setTitle(cvData.title);
      setTemplate(cvData.template);
      setTheme(cvData.theme);
      setFont(cvData.font);
      const parsed = { ...DEFAULT_DATA, ...JSON.parse(cvData.data) };
    if (!parsed.language) parsed.language = detectLanguage(parsed);
    setData(parsed);
    }).catch(() => toast.error('Nie znaleziono CV'));
  }, [id]);

   const save = useCallback(async () => {
     setSaving(true);
     try {
       const updated = await cvs.update(id, { title, template, theme, font, data });
       setCv(updated);
       toast.success('Zapisano!');
     } catch {
       toast.error('Błąd zapisu');
     } finally {
       setSaving(false);
     }
   }, [id, title, template, theme, font, data]);

   const generateAISummary = useCallback(async () => {
     if (!data.firstName && !data.lastName && !data.title) {
       toast.error('Wypełnij najpierw podstawowe informacje');
       return;
     }
     
     try {
       // Prepare prompt for AI
       const prompt = `Wykonujesz rolę eksperta ds. kariery i rekrutacji. Na podstawie następujących informacji o użytkowniku:
       Imię: ${data.firstName || 'Nie podane'}
       Nazwisko: ${data.lastName || 'Nie podane'}
       Stanowisko: ${data.title || 'Nie podane'}
       
       Wygeneruj profesjonalne podsumowanie zawodowe (3-4 zdania) w języku ${data.language === 'pl' ? 'polskim' : 'angielskim'}, które:
       1. Podkreśla kluczowe kompetencje i doświadczenie
       2. Jest dostosowane do branży i stanowiska
       3. Zawiera mierzalne osiągnięcia jeśli są dostępne
       4. Brzmieć profesjonalnie i przekonująco
       
       Podsumowanie powinno być gotowe do umieszczenia w CV.`;
       
       const response = await fetch('https://voicenotesite-chat-proxy.onrender.com/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           model: 'llama-3.3-70b-versatile',
           messages: [
             {
               role: 'system',
               content: 'Jesteś ekspertem ds. kariery i rekrutacji specjalizującym się w tworzeniu profesjonalnych podsumowań zawodowych.'
             },
             {
               role: 'user',
               content: prompt
             }
           ],
           temperature: 0.7,
           max_tokens: 500
         })
       });
       
       if (!response.ok) {
         throw new Error('Błąd komunikacji z AI');
       }
       
       const result = await response.json();
       const aiSummary = result.choices[0]?.message?.content?.trim() || '';
       
       if (aiSummary) {
         setData(prev => ({
           ...prev,
           aiSuggestions: {
             ...prev.aiSuggestions,
             summary: aiSummary
           }
         }));
         toast.success('Wygenerowano sugestię AI!');
       } else {
         toast.error('Nie udało się wygenerować sugestii');
       }
     } catch (error) {
       console.error('AI Error:', error);
       toast.error('Błąd podczas generowania sugestii AI');
     }
   }, [data.firstName, data.lastName, data.title, data.language]);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const handleShare = async () => {
    try {
      const res = await cvs.share(id);
      const link = `${window.location.origin}/shared/${res.shareLink}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link skopiowany!');
    } catch {
      toast.error('Błąd udostępniania');
    }
  };

  const handleDownloadPDF = async () => {
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

  if (!cv) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const activeColor = currentTheme.color;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary p-2">
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-semibold text-lg bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-secondary text-sm flex items-center gap-1">
            <Share2 size={16} /> Udostępnij
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary text-sm flex items-center gap-1">
            <Download size={16} /> PDF
          </button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
            <Save size={16} /> {saving ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-[480px] overflow-y-auto border-r border-gray-200 bg-white p-4 flex-shrink-0">
          {/* Template & Style */}
          <SectionCard icon={Layout} label="Szablon i styl">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Język / Language</label>
                <div className="flex gap-2">
                  <button onClick={() => setData({...data, language: 'pl'})}
                    className={`flex-1 p-2 text-sm rounded-lg border-2 text-center transition-all ${data.language === 'pl' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    🇵🇱 Polski
                  </button>
                  <button onClick={() => setData({...data, language: 'en'})}
                    className={`flex-1 p-2 text-sm rounded-lg border-2 text-center transition-all ${data.language === 'en' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    🇬🇧 English
                  </button>
                  <button onClick={() => setData({...data, language: 'auto'})}
                    className={`flex-1 p-2 text-sm rounded-lg border-2 text-center transition-all ${data.language === 'auto' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    🔄 Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Szablon</label>
                <div className="grid grid-cols-5 gap-2">
                  {templateList.map(t => (
                    <button key={t.id} onClick={() => setTemplate(t.id)}
                      className={`p-2 text-xs rounded-lg border-2 text-center transition-all ${template === t.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Kolor</label>
                <div className="flex gap-2 flex-wrap">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${theme === t.id ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: t.color }} title={t.name} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Czcionka</label>
                <select value={font} onChange={e => setFont(e.target.value)} className="input-field text-sm">
                  {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Personal Info */}
          <SectionCard icon={User} label="Dane osobowe">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Imię</label>
                  <input className="input-field text-sm" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Nazwisko</label>
                  <input className="input-field text-sm" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Stanowisko / Tytuł</label>
                <input className="input-field text-sm" value={data.title} onChange={e => setData({...data, title: e.target.value})} placeholder="Senior Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <input className="input-field text-sm" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Telefon</label>
                  <input className="input-field text-sm" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Lokalizacja</label>
                <input className="input-field text-sm" value={data.location} onChange={e => setData({...data, location: e.target.value})} placeholder="Warszawa, Polska" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Strona WWW</label>
                  <input className="input-field text-sm" value={data.website} onChange={e => setData({...data, website: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">LinkedIn</label>
                  <input className="input-field text-sm" value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} />
                </div>
              </div>
            </div>
          </SectionCard>

           {/* Summary */}
           <SectionCard icon={Edit3} label="Podsumowanie">
             <div className="space-y-2">
               <textarea className="input-field text-sm" rows={3} value={data.summary} onChange={e => setData({...data, summary: e.target.value})} placeholder="Krótkie podsumowanie zawodowe..." />
               {data.aiSuggestions.summary && (
                 <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm">
                   <div className="flex items-start gap-2">
                     <Bot size={16} className="text-blue-400 mt-0.5" />
                     <div>
                       <p className="font-medium text-blue-800 mb-1">Sugestia AI:</p>
                       <p className="text-blue-700">{data.aiSuggestions.summary}</p>
                       <button onClick={() => setData({...data, summary: data.aiSuggestions.summary, aiSuggestions: {...data.aiSuggestions, summary: ''}})} 
                               className="btn-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded hover:bg-blue-200">
                         Użyj tej sugestii
                       </button>
                     </div>
                   </div>
                 </div>
               )}
               <button onClick={generateAISummary} disabled={!data.firstName && !data.lastName && !data.title} 
                       className="btn-secondary w-full text-sm flex items-center justify-start py-1 mt-2">
                 <Bot size={16} /> Wygeneruj podsumowanie z AI
               </button>
             </div>
           </SectionCard>

          {/* Experience */}
          <SectionCard icon={Briefcase} label="Doświadczenie">
            <EntryEditor
              entries={data.experience}
              setEntries={v => setData({...data, experience: v})}
              fields={[
                { key: 'position', label: 'Stanowisko', placeholder: 'Senior Developer' },
                { key: 'company', label: 'Firma', placeholder: 'Google' },
                { key: 'location', label: 'Lokalizacja', placeholder: 'Warszawa' },
                { key: 'startDate', label: 'Data rozpoczęcia', placeholder: '2020-01' },
                { key: 'endDate', label: 'Data zakończenia', placeholder: '2023-12 (lub "Obecnie")' },
                { key: 'description', label: 'Opis', placeholder: 'Opis obowiązków i osiągnięć...', type: 'textarea', fullWidth: true },
              ]}
            />
          </SectionCard>

          {/* Education */}
          <SectionCard icon={GraduationCap} label="Edukacja">
            <EntryEditor
              entries={data.education}
              setEntries={v => setData({...data, education: v})}
              fields={[
                { key: 'degree', label: 'Kierunek / Stopień', placeholder: 'Informatyka, mgr inż.' },
                { key: 'institution', label: 'Uczelnia', placeholder: 'Politechnika Warszawska' },
                { key: 'startDate', label: 'Data rozpoczęcia', placeholder: '2016-10' },
                { key: 'endDate', label: 'Data zakończenia', placeholder: '2020-06' },
                { key: 'description', label: 'Opis', placeholder: 'Specjalizacja, osiągnięcia...', type: 'textarea', fullWidth: true },
              ]}
            />
          </SectionCard>

          {/* Skills */}
          <SectionCard icon={Wrench} label="Umiejętności">
            <div className="space-y-3">
              {data.skills.map((skill, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <button onClick={() => setData({...data, skills: data.skills.filter((_, j) => j !== i)})} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 gap-2 pr-8">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Umiejętność</label>
                      <input className="input-field text-sm" value={skill.name || ''} onChange={e => {
                        const s = [...data.skills]; s[i] = {...s[i], name: e.target.value}; setData({...data, skills: s});
                      }} placeholder="React" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Ocena: {skill.level || 5}/10</label>
                      <input type="range" min="1" max="10" value={skill.level || 5} step="1" onChange={e => {
                        const s = [...data.skills]; s[i] = {...s[i], level: parseInt(e.target.value)}; setData({...data, skills: s});
                      }} className="w-full accent-primary-600" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1 - {getRatingLabel(data.language, 1)}</span>
                        <span>10 - {getRatingLabel(data.language, 10)}</span>
                      </div>
                      <div className="text-center text-sm font-medium mt-1">
                        {skill.level || 5}/10 · {getRatingLabel(data.language, skill.level || 5)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setData({...data, skills: [...data.skills, {name: '', level: 5}]})} className="btn-secondary text-sm flex items-center gap-1 w-full justify-center py-2">
                <Plus size={16} /> Dodaj umiejętność
              </button>
            </div>
          </SectionCard>

          {/* Languages */}
          <SectionCard icon={Globe} label="Języki">
            <EntryEditor
              entries={data.languages}
              setEntries={v => setData({...data, languages: v})}
              fields={[
                { key: 'name', label: 'Język', placeholder: 'Angielski' },
                { key: 'level', label: 'Poziom', placeholder: 'C2 - Biegły' },
              ]}
            />
          </SectionCard>

          {/* Certifications */}
          <SectionCard icon={Award} label="Certyfikaty">
            <EntryEditor
              entries={data.certifications}
              setEntries={v => setData({...data, certifications: v})}
              fields={[
                { key: 'name', label: 'Nazwa', placeholder: 'AWS Solutions Architect' },
                { key: 'issuer', label: 'Wydawca', placeholder: 'Amazon Web Services' },
                { key: 'date', label: 'Data', placeholder: '2023-03' },
                { key: 'url', label: 'Link', placeholder: 'https://...', fullWidth: true },
              ]}
            />
          </SectionCard>

          {/* Projects */}
          <SectionCard icon={FolderGit} label="Projekty">
            <EntryEditor
              entries={data.projects}
              setEntries={v => setData({...data, projects: v})}
              fields={[
                { key: 'name', label: 'Nazwa', placeholder: 'CV Maker' },
                { key: 'description', label: 'Opis', placeholder: 'Opis projektu...', type: 'textarea', fullWidth: true },
                { key: 'url', label: 'Link', placeholder: 'https://github.com/...', fullWidth: true },
              ]}
            />
          </SectionCard>

          {/* Hobbies */}
          <SectionCard icon={Heart} label="Zainteresowania">
            <EntryEditor
              entries={data.hobbies}
              setEntries={v => setData({...data, hobbies: v})}
              fields={[
                { key: 'name', label: 'Zainteresowanie', placeholder: 'Szachy, bieganie...' },
              ]}
            />
          </SectionCard>

          <div className="text-xs text-gray-400 text-center py-4">
            Wszystkie zmiany zapisuj ręcznie przyciskiem Zapisz
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
          <div className="cv-page" ref={previewRef} style={{ fontFamily: font }}>
            <CVPreviewContent data={data} theme={activeColor} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CVPreviewContent({ data, theme, template }) {
  const s = { borderColor: theme, color: theme };
  const lang = data.language === 'auto' ? detectLanguage(data) : (data.language || 'pl');

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${theme}` }} className="pb-4 mb-6">
        <h1 style={{ color: theme }} className="text-3xl font-bold mb-1">
          {data.firstName} {data.lastName}
        </h1>
        {data.title && <p className="text-lg text-gray-600 mb-2">{data.title}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.website && <span>{data.website}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-2">{t(lang, 'summary')}</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-3">{t(lang, 'experience')}</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{exp.position}</p>
                  <p className="text-sm text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {exp.startDate} - {exp.endDate || t(lang, 'present')}
                </p>
              </div>
              {exp.description && <p className="text-sm text-gray-700 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-3">{t(lang, 'education')}</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {edu.startDate} - {edu.endDate}
                </p>
              </div>
              {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-3">{t(lang, 'skills')}</h2>
          <div className="space-y-2">
            {data.skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <span style={{ color: theme }} className="font-semibold">{skill.level || 5}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div style={{ width: `${(skill.level || 5) * 10}%`, backgroundColor: theme }} className="h-2 rounded-full transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-3">{t(lang, 'languages')}</h2>
          <div className="space-y-2">
            {data.languages.map((lang_item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-800">{lang_item.name}</span>
                  {lang_item.level && <span className="text-gray-500">{lang_item.level}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-2">{t(lang, 'certifications')}</h2>
          {data.certifications.map((cert, i) => (
            <div key={i} className="mb-1 text-sm">
              <span className="font-medium">{cert.name}</span>
              {cert.issuer && <span className="text-gray-600"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div className="mb-6">
          <h2 style={s} className="text-lg font-bold mb-2">{t(lang, 'projects')}</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-gray-900">{proj.name}</p>
              {proj.description && <p className="text-sm text-gray-700">{proj.description}</p>}
              {proj.url && <p className="text-xs text-primary-600">{proj.url}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Hobbies */}
      {data.hobbies?.length > 0 && (
        <div>
          <h2 style={s} className="text-lg font-bold mb-2">{t(lang, 'interests')}</h2>
          <p className="text-sm text-gray-700">{data.hobbies.map(h => h.name || h).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
