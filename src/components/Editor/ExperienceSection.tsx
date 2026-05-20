import { Plus, Trash2, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Resume, ExperienceItem } from '../../hooks/useResumes';

interface Props {
  resume: Resume;
  onChange: (data: Partial<Resume>) => void;
}

async function callAI(action: string, context: Record<string, unknown>): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/ai-assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, context }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content;
}

const emptyExp = (): ExperienceItem => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export function ExperienceSection({ resume, onChange }: Props) {
  const items = resume.experience;
  const [enhancing, setEnhancing] = useState<string | null>(null);

  const update = (index: number, field: keyof ExperienceItem, value: string | boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ experience: updated });
  };

  const add = () => onChange({ experience: [...items, emptyExp()] });
  const remove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange({ experience: updated });
  };

  const enhanceDescription = async (index: number) => {
    const exp = items[index];
    setEnhancing(exp.id);
    try {
      const content = await callAI('enhance', {
        position: exp.position,
        company: exp.company,
        description: exp.description,
      });
      update(index, 'description', content.trim());
    } catch (e) {
      console.error('AI error', e);
    }
    setEnhancing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Experience</h3>
        <button onClick={add} className="text-emerald-400 hover:text-emerald-300 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {items.map((exp, i) => (
        <div key={exp.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <GripVertical className="w-4 h-4" />
              <span className="text-xs font-medium">Position {i + 1}</span>
            </div>
            <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Position</label>
              <input
                value={exp.position}
                onChange={(e) => update(i, 'position', e.target.value)}
                placeholder="Software Engineer"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Company</label>
              <input
                value={exp.company}
                onChange={(e) => update(i, 'company', e.target.value)}
                placeholder="Acme Inc."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => update(i, 'startDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
                disabled={exp.current}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-40"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => update(i, 'current', e.target.checked)}
              className="accent-emerald-500"
            />
            Currently working here
          </label>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Description</label>
              <button
                onClick={() => enhanceDescription(i)}
                disabled={enhancing === exp.id}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {enhancing === exp.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {enhancing === exp.id ? 'Enhancing...' : 'AI Enhance'}
              </button>
            </div>
            <textarea
              value={exp.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="Key achievements and responsibilities..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <button onClick={add} className="w-full py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
          + Add Experience
        </button>
      )}
    </div>
  );
}
