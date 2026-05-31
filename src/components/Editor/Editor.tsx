import { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Eye,
  PenLine,
  FileText,
  Palette,
} from 'lucide-react';
import type { Resume } from '../../hooks/useResumes';
import { useResumes } from '../../hooks/useResumes';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsSection, CertificationsSection } from './ProjectsSection';
import { ResumePreview } from './ResumePreview';
import { DesignSection } from './DesignSection';

interface EditorProps {
  resume: Resume;
  onBack: () => void;
}

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'design', label: 'Design', icon: Palette },
] as const;

type TabId = (typeof TABS)[number]['id'];

const EDITOR_SAVE_KEY = 'cvcraft_editor_resume';

export function Editor({ resume: initialResume, onBack }: EditorProps) {
  const { saveResume } = useResumes();
  const [resume, setResume] = useState<Resume>(() => {
    try {
      const saved = localStorage.getItem(EDITOR_SAVE_KEY);
      if (saved) return JSON.parse(saved) as Resume;
    } catch {}
    return initialResume;
  });
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  const handleChange = useCallback(
    (data: Partial<Resume>) => {
      const updated = { ...resume, ...data };
      setResume(updated);

      try {
        localStorage.setItem(EDITOR_SAVE_KEY, JSON.stringify(updated));
      } catch {}

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        try {
          await saveResume(updated);
          setLastSaved(new Date());
        } catch (e) {
          console.error('Save failed', e);
        }
        setSaving(false);
      }, 1000);
    },
    [resume, saveResume]
  );

  const handleBack = () => {
    try { localStorage.removeItem(EDITOR_SAVE_KEY); } catch {}
    onBack();
  };

  const handleManualSave = async () => {
    setSaving(true);
    try {
      await saveResume(resume);
      setLastSaved(new Date());
    } catch (e) {
      console.error('Save failed', e);
    }
    setSaving(false);
  };

  const handleExportPDF = () => {
    const el = previewRef.current;
    if (!el) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          if (sheet.cssRules) {
            return Array.from(sheet.cssRules).map((r) => r.cssText).join('');
          }
        } catch {}
        return '';
      })
      .join('');

    const googleFonts = document.querySelector('link[href*="fonts.googleapis"]')
      ?.outerHTML || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resume.personal_info.fullName || 'Resume'} - CV</title>
        ${googleFonts}
        <style>
          @page { margin: 0; size: A4; }
          body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ${styles}
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="w-px h-5 bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-gray-950" />
              </div>
              <input
                value={resume.title}
                onChange={(e) => handleChange({ title: e.target.value })}
                className="bg-transparent text-sm font-semibold focus:outline-none border-b border-transparent focus:border-emerald-500 transition-colors w-32 sm:w-40"
              />
            </div>
            <span className="text-xs text-gray-600 hidden sm:inline">
              {saving ? (
                <span className="text-emerald-400">Saving...</span>
              ) : lastSaved ? (
                `Saved ${lastSaved.toLocaleTimeString()}`
              ) : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex bg-gray-800/80 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'edit' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            <button
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-800/80 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
        {viewMode === 'edit' && (
          <div className="w-full lg:w-[440px] xl:w-[480px] border-b lg:border-b-0 lg:border-r border-gray-800/50 flex flex-col overflow-hidden shrink-0">
            <div className="flex overflow-x-auto border-b border-gray-800/50 px-2 scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {activeTab === 'personal' && <PersonalInfoSection resume={resume} onChange={handleChange} />}
              {activeTab === 'experience' && <ExperienceSection resume={resume} onChange={handleChange} />}
              {activeTab === 'education' && <EducationSection resume={resume} onChange={handleChange} />}
              {activeTab === 'skills' && <SkillsSection resume={resume} onChange={handleChange} />}
              {activeTab === 'projects' && <ProjectsSection resume={resume} onChange={handleChange} />}
              {activeTab === 'certifications' && <CertificationsSection resume={resume} onChange={handleChange} />}
              {activeTab === 'design' && <DesignSection resume={resume} onChange={handleChange} />}
            </div>
          </div>
        )}

        <div className="flex-1 bg-gray-900/30 overflow-y-auto p-4 sm:p-8 lg:p-10 flex items-start justify-center">
          <div className="w-full max-w-[210mm]">
            <div
              ref={previewRef}
              className="bg-white text-gray-900 w-full shadow-2xl rounded-sm overflow-hidden min-h-[200px]"
            >
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
