import { Plus, Trash2 } from 'lucide-react';
import type { Resume, EducationItem } from '../../hooks/useResumes';

interface Props {
  resume: Resume;
  onChange: (data: Partial<Resume>) => void;
}

const emptyEdu = (): EducationItem => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  description: '',
});

export function EducationSection({ resume, onChange }: Props) {
  const items = resume.education;

  const update = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ education: updated });
  };

  const add = () => onChange({ education: [...items, emptyEdu()] });
  const remove = (index: number) => {
    onChange({ education: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Education</h3>
        <button onClick={add} className="text-emerald-400 hover:text-emerald-300 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {items.map((edu, i) => (
        <div key={edu.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Education {i + 1}</span>
            <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Institution</label>
              <input
                value={edu.institution}
                onChange={(e) => update(i, 'institution', e.target.value)}
                placeholder="MIT"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Degree</label>
              <input
                value={edu.degree}
                onChange={(e) => update(i, 'degree', e.target.value)}
                placeholder="Bachelor of Science"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Field of Study</label>
            <input
              value={edu.field}
              onChange={(e) => update(i, 'field', e.target.value)}
              placeholder="Computer Science"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => update(i, 'startDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea
              value={edu.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="Notable achievements, GPA, etc."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <button onClick={add} className="w-full py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
          + Add Education
        </button>
      )}
    </div>
  );
}
