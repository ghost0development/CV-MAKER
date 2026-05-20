import { Plus, Trash2, X } from 'lucide-react';
import type { Resume, ProjectItem, CertItem } from '../../hooks/useResumes';

interface Props {
  resume: Resume;
  onChange: (data: Partial<Resume>) => void;
}

export function ProjectsSection({ resume, onChange }: Props) {
  const projects = resume.projects;

  const add = () => {
    onChange({ projects: [...projects, { id: crypto.randomUUID(), name: '', description: '', url: '' }] });
  };

  const update = (index: number, field: keyof ProjectItem, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ projects: updated });
  };

  const remove = (index: number) => {
    onChange({ projects: projects.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Projects</h3>
        <button onClick={add} className="text-emerald-400 hover:text-emerald-300 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {projects.map((proj, i) => (
        <div key={proj.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Project {i + 1}</span>
            <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                value={proj.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder="Project name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL</label>
              <input
                value={proj.url}
                onChange={(e) => update(i, 'url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea
              value={proj.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="What you built and achieved..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>
        </div>
      ))}

      {projects.length === 0 && (
        <button onClick={add} className="w-full py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
          + Add Project
        </button>
      )}
    </div>
  );
}

export function CertificationsSection({ resume, onChange }: Props) {
  const certs = resume.certifications;

  const add = () => {
    onChange({ certifications: [...certs, { id: crypto.randomUUID(), name: '', issuer: '', date: '' }] });
  };

  const update = (index: number, field: keyof CertItem, value: string) => {
    const updated = [...certs];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ certifications: updated });
  };

  const remove = (index: number) => {
    onChange({ certifications: certs.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Certifications</h3>
        <button onClick={add} className="text-emerald-400 hover:text-emerald-300 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {certs.map((cert, i) => (
        <div key={cert.id} className="flex items-center gap-3">
          <input
            value={cert.name}
            onChange={(e) => update(i, 'name', e.target.value)}
            placeholder="Certification name"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <input
            value={cert.issuer}
            onChange={(e) => update(i, 'issuer', e.target.value)}
            placeholder="Issuer"
            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <input
            type="month"
            value={cert.date}
            onChange={(e) => update(i, 'date', e.target.value)}
            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {certs.length === 0 && (
        <button onClick={add} className="w-full py-6 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
          + Add Certification
        </button>
      )}
    </div>
  );
}
