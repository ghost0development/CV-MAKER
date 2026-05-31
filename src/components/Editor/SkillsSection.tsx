import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Resume, SkillItem, LanguageItem } from '../../hooks/useResumes';

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

export function SkillsSection({ resume, onChange }: Props) {
  const skills = resume.skills;
  const languages = resume.languages;
  const [suggesting, setSuggesting] = useState(false);

  const addSkill = () => {
    onChange({ skills: [...skills, { id: crypto.randomUUID(), name: '', level: 3 }] });
  };

  const updateSkill = (index: number, field: keyof SkillItem, value: string | number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ skills: updated });
  };

  const removeSkill = (index: number) => {
    onChange({ skills: skills.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    onChange({ languages: [...languages, { id: crypto.randomUUID(), name: '', level: 'Intermediate' }] });
  };

  const updateLanguage = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ languages: updated });
  };

  const removeLanguage = (index: number) => {
    onChange({ languages: languages.filter((_, i) => i !== index) });
  };

  const suggestSkills = async () => {
    setSuggesting(true);
    try {
      const content = await callAI('skills', {
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
      });
      const suggested = content.split(',').map((s: string) => s.trim()).filter(Boolean);
      const newSkills = suggested.map((name: string) => ({
        id: crypto.randomUUID(),
        name,
        level: 3,
      }));
      onChange({ skills: [...skills, ...newSkills] });
    } catch (e) {
      console.error('AI error', e);
    }
    setSuggesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Skills</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={suggestSkills}
              disabled={suggesting}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {suggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {suggesting ? 'Suggesting...' : 'AI Suggest'}
            </button>
            <button onClick={addSkill} className="text-emerald-400 hover:text-emerald-300 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {skills.map((skill, i) => (
          <div key={skill.id} className="flex items-center gap-3">
            <input
              value={skill.name}
              onChange={(e) => updateSkill(i, 'name', e.target.value)}
              placeholder="Skill name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => updateSkill(i, 'level', lvl)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    lvl <= skill.level ? 'bg-emerald-400' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button onClick={() => removeSkill(i)} className="text-gray-500 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {skills.length === 0 && (
          <button onClick={addSkill} className="w-full py-6 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
            + Add Skills
          </button>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Languages</h3>
          <button onClick={addLanguage} className="text-emerald-400 hover:text-emerald-300 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {languages.map((lang, i) => (
          <div key={lang.id} className="flex items-center gap-3">
            <input
              value={lang.name}
              onChange={(e) => updateLanguage(i, 'name', e.target.value)}
              placeholder="Language"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={lang.level}
              onChange={(e) => updateLanguage(i, 'level', e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option>Native</option>
              <option>Fluent</option>
              <option>Advanced</option>
              <option>Intermediate</option>
              <option>Beginner</option>
            </select>
            <button onClick={() => removeLanguage(i)} className="text-gray-500 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {languages.length === 0 && (
          <button onClick={addLanguage} className="w-full py-6 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-sm">
            + Add Languages
          </button>
        )}
      </div>
    </div>
  );
}
