import type { Resume } from '../../hooks/useResumes';

interface Props {
  resume: Resume;
}

function formatDate(date: string) {
  if (!date) return '';
  const [y, m] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

/* ─── Modern Template (Free) ─── */
function ModernTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-8 text-[10px] leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{p.fullName || 'Your Name'}</h1>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-gray-500">
        {p.email && <span>{p.email}</span>}
        {p.phone && <span>{p.phone}</span>}
        {p.location && <span>{p.location}</span>}
        {p.website && <span>{p.website}</span>}
      </div>
      {p.summary && (
        <p className="mt-3 text-gray-600 leading-relaxed border-t border-gray-200 pt-3">{p.summary}</p>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">{exp.position}</span>
                <span className="text-gray-400 text-[9px]">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <div className="text-gray-500">{exp.company}</div>
              {exp.description && <p className="mt-1 text-gray-600 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="text-gray-400 text-[9px]">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div className="text-gray-500">{edu.institution}</div>
              {edu.description && <p className="mt-0.5 text-gray-600">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {skills.map((s) => (
              <span key={s.id} className="text-gray-700">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Languages</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {languages.map((l) => (
              <span key={l.id} className="text-gray-700">{l.name} <span className="text-gray-400">({l.level})</span></span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="font-semibold text-gray-900">{proj.name}</span>
              {proj.url && <span className="text-gray-400 ml-2 text-[9px]">{proj.url}</span>}
              {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Certifications</h2>
          {certifications.map((c) => (
            <div key={c.id} className="flex justify-between">
              <span className="text-gray-700">{c.name} <span className="text-gray-400">- {c.issuer}</span></span>
              {c.date && <span className="text-gray-400 text-[9px]">{formatDate(c.date)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Classic Template (Free) ─── */
function ClassicTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-8 text-[10px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="text-center border-b-2 border-gray-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{p.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1.5 text-gray-600">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>| {p.phone}</span>}
          {p.location && <span>| {p.location}</span>}
          {p.website && <span>| {p.website}</span>}
        </div>
      </div>

      {p.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Professional Summary</h2>
          <p className="text-gray-600">{p.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Professional Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <span className="font-bold text-gray-900">{exp.position}</span>
                  <span className="text-gray-500"> — {exp.company}</span>
                </div>
                <span className="text-gray-400 text-[9px] italic">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && <p className="mt-1 text-gray-600 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="text-gray-400 text-[9px] italic">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              <div className="text-gray-500 italic">{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Skills</h2>
          <p className="text-gray-700">{skills.map((s) => s.name).join('  •  ')}</p>
        </div>
      )}

      {languages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Languages</h2>
          <p className="text-gray-700">{languages.map((l) => `${l.name} (${l.level})`).join('  •  ')}</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="font-bold text-gray-900">{proj.name}</span>
              {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2">Certifications</h2>
          {certifications.map((c) => (
            <div key={c.id}>
              <span className="font-bold text-gray-900">{c.name}</span>
              <span className="text-gray-500"> — {c.issuer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Executive Template (Pro) ─── */
function ExecutiveTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-[35%] bg-gray-900 text-white p-6 text-[9px]">
        <h1 className="text-lg font-bold leading-tight">{p.fullName || 'Your Name'}</h1>
        <div className="mt-3 space-y-1 text-gray-300">
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.website && <div>{p.website}</div>}
        </div>

        {skills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Skills</h2>
            <div className="space-y-1.5">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-gray-300">
                    <span>{s.name}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded mt-0.5">
                    <div className="h-1 bg-emerald-400 rounded" style={{ width: `${s.level * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Languages</h2>
            <div className="space-y-1">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between text-gray-300">
                  <span>{l.name}</span>
                  <span className="text-gray-500">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Certifications</h2>
            <div className="space-y-1">
              {certifications.map((c) => (
                <div key={c.id}>
                  <div className="text-gray-300">{c.name}</div>
                  <div className="text-gray-500 text-[8px]">{c.issuer} {c.date && `• ${formatDate(c.date)}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-6 text-[10px]">
        {p.summary && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Profile</h2>
            <p className="text-gray-600 leading-relaxed">{p.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">{exp.position}</span>
                  <span className="text-gray-400 text-[9px]">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="text-emerald-600 font-medium">{exp.company}</div>
                {exp.description && <p className="mt-1 text-gray-600 whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                  <span className="text-gray-400 text-[9px]">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                </div>
                <div className="text-gray-500">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Projects</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <span className="font-bold text-gray-900">{proj.name}</span>
                {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Minimal Template (Pro) ─── */
function MinimalTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-8 text-[10px] leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 className="text-3xl font-extralight text-gray-900 tracking-tight">{p.fullName || 'Your Name'}</h1>
      <div className="w-12 h-0.5 bg-emerald-400 mt-2 mb-3" />
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-gray-400 text-[9px]">
        {p.email && <span>{p.email}</span>}
        {p.phone && <span>{p.phone}</span>}
        {p.location && <span>{p.location}</span>}
        {p.website && <span>{p.website}</span>}
      </div>

      {p.summary && <p className="mt-4 text-gray-500 leading-relaxed">{p.summary}</p>}

      {experience.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[9px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3 pl-3 border-l border-gray-200">
              <div className="font-medium text-gray-900">{exp.position}</div>
              <div className="text-gray-400 text-[9px]">{exp.company} · {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
              {exp.description && <p className="mt-1 text-gray-500 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[9px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2 pl-3 border-l border-gray-200">
              <div className="font-medium text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
              <div className="text-gray-400 text-[9px]">{edu.institution} · {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[9px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px]">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      {languages.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[9px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Languages</h2>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <span key={l.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px]">{l.name} · {l.level}</span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[9px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2 pl-3 border-l border-gray-200">
              <div className="font-medium text-gray-900">{proj.name}</div>
              {proj.description && <p className="text-gray-500 mt-0.5">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', pro: false },
  { id: 'classic', name: 'Classic', pro: false },
  { id: 'executive', name: 'Executive', pro: true },
  { id: 'minimal', name: 'Minimal', pro: true },
] as const;

export function ResumePreview({ resume }: Props) {
  const template = resume.template;

  switch (template) {
    case 'classic':
      return <ClassicTemplate resume={resume} />;
    case 'executive':
      return <ExecutiveTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    default:
      return <ModernTemplate resume={resume} />;
  }
}
