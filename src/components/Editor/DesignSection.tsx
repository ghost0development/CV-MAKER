import type { Resume } from '../../hooks/useResumes';
import { TEMPLATES } from './ResumePreview';

interface Props {
  resume: Resume;
  onChange: (data: Partial<Resume>) => void;
}

const TEMPLATE_PREVIEWS: Record<string, string> = {
  modern: 'Clean & professional with accent colors and skill bars',
  classic: 'Elegant serif typography with traditional layout',
  executive: 'Two-column premium design with dark sidebar',
  minimal: 'Ultra-minimalist with clean lines and plenty of whitespace',
};

const PRESET_COLORS = [
  { name: 'Emerald', value: '#059669' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Gray', value: '#4b5563' },
];

export function DesignSection({ resume, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const selected = resume.template === t.id;
            const isProLocked = t.pro && !resume.is_pro;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isProLocked) return;
                  onChange({ template: t.id });
                }}
                className={`relative text-left p-3 rounded-lg border transition-all ${
                  selected
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                    : isProLocked
                    ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                {selected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
                <div className="text-sm font-medium text-white mb-0.5">{t.name}</div>
                <div className="text-[10px] text-gray-400 leading-relaxed">
                  {TEMPLATE_PREVIEWS[t.id]}
                </div>
                {t.pro && (
                  <span className="inline-block mt-1 text-[9px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Accent Color</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange({ accent_color: c.value })}
              className={`w-7 h-7 rounded-full transition-all ${
                resume.accent_color === c.value
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={resume.accent_color}
            onChange={(e) => onChange({ accent_color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <span className="text-xs text-gray-400">Custom color</span>
        </div>
      </div>
    </div>
  );
}
