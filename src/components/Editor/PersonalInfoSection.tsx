import { Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Resume } from '../../hooks/useResumes';

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

export function PersonalInfoSection({ resume, onChange }: Props) {
  const info = resume.personal_info;
  const [generating, setGenerating] = useState(false);

  const update = (field: string, value: string) => {
    onChange({ personal_info: { ...info, [field]: value } });
  };

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const content = await callAI('summary', {
        personal_info: info,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
      });
      onChange({ personal_info: { ...info, summary: content.trim() } });
    } catch (e) {
      console.error('AI error', e);
    }
    setGenerating(false);
  };

  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890', type: 'tel' },
    { key: 'location', label: 'Location', placeholder: 'New York, NY' },
    { key: 'website', label: 'Website', placeholder: 'https://johndoe.com' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Personal Info</h3>
      <div className="grid gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
            <input
              type={(f as { type?: string }).type ?? 'text'}
              value={info[f.key as keyof typeof info] as string}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500">Professional Summary</label>
          <button
            onClick={generateSummary}
            disabled={generating}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {generating ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
        <textarea
          value={info.summary}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="Brief overview of your professional background..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
}
