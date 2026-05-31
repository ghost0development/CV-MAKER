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

function SkillDots({ level, color }: { level: number; color: string }) {
  return (
    <span className="inline-flex gap-0.5 ml-1.5 align-middle">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span key={dot} className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot <= level ? color : '#e5e7eb' }} />
      ))}
    </span>
  );
}

function SkillBars({ level, color }: { level: number; color: string }) {
  return (
    <div className="inline-flex items-center gap-0.5 ml-2 align-middle w-16">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${level * 20}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ModernTemplate({ resume, accentColor }: Props & { accentColor: string }) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const ac = accentColor;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return <div className="p-8 text-gray-400 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Start filling in your details to see the preview</div>;
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9.5px' }}>
      <div className="px-8 pt-7 pb-5 text-white" style={{ backgroundColor: ac }}>
        <h1 className="text-[22px] font-extrabold tracking-tight leading-tight">{p.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-white/80" style={{ fontSize: '8px' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span className="ml-2">{p.phone}</span>}
          {p.location && <span className="ml-2">{p.location}</span>}
          {p.website && <span className="ml-2">{p.website}</span>}
        </div>
      </div>
      <div className="px-8 pt-4 pb-7 space-y-3.5">
        {p.summary && <p className="text-gray-600 leading-relaxed">{p.summary}</p>}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div><span className="font-semibold text-gray-900 text-[10px]">{exp.position}</span><span className="text-gray-500 ml-1.5">at {exp.company}</span></div>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                  </div>
                  {exp.description && <p className="text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 text-[10px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                  </div>
                  <div className="text-gray-500">{edu.institution}</div>
                  {edu.description && <p className="text-gray-600 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Skills</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center text-gray-700 font-medium">{s.name}<SkillBars level={s.level} color={ac} /></span>
              ))}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Languages</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {languages.map((l) => (<span key={l.id} className="text-gray-700">{l.name} <span className="text-gray-400">— {l.level}</span></span>))}
            </div>
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Projects</h2>
            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-semibold text-gray-900 text-[10px]">{proj.name}</span>
                  {proj.url && <span className="text-gray-400 ml-1.5" style={{ fontSize: '7.5px' }}>{proj.url}</span>}
                  {proj.description && <p className="text-gray-600 mt-0.5 leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ac }}>Certifications</h2>
            <div className="space-y-1">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span className="text-gray-700"><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && <span className="text-gray-400 ml-1">— {c.issuer}</span>}</span>
                  {c.date && <span className="text-gray-400" style={{ fontSize: '7.5px' }}>{formatDate(c.date)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClassicTemplate({ resume, accentColor }: Props & { accentColor: string }) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const ac = accentColor;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) return <div className="p-8 text-gray-400 text-sm" style={{ fontFamily: 'Georgia, serif' }}>Start filling in your details to see the preview</div>;

  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: '9.5px', color: '#1a1a1a' }}>
      <div className="text-center pt-7 pb-4 px-8" style={{ borderBottom: `3px solid ${ac}` }}>
        <h1 className="text-[26px] font-bold tracking-wide leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: ac }}>{p.fullName || 'Your Name'}</h1>
        <div className="w-8 h-px mx-auto my-2" style={{ backgroundColor: ac }} />
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-gray-600" style={{ fontSize: '8.5px' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span className="text-gray-300 ml-1">|</span>}
          {p.phone && <span className="ml-1">{p.phone}</span>}
          {p.location && <span className="text-gray-300 ml-1">|</span>}
          {p.location && <span className="ml-1">{p.location}</span>}
          {p.website && <span className="text-gray-300 ml-1">|</span>}
          {p.website && <span className="ml-1">{p.website}</span>}
        </div>
      </div>
      <div className="px-8 pt-4 pb-7 space-y-4">
        {p.summary && (<div><h2 className="text-[8.5px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4a4a4a' }}>Professional Summary</h2><p className="text-gray-700 leading-relaxed">{p.summary}</p></div>)}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-2" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Professional Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div><span className="font-bold text-gray-900">{exp.position}</span><span className="text-gray-500"> — {exp.company}</span></div>
                    <span className="text-gray-400 italic whitespace-nowrap ml-2" style={{ fontSize: '8px' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                  </div>
                  {exp.description && <p className="text-gray-700 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-2" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    <span className="text-gray-400 italic whitespace-nowrap ml-2" style={{ fontSize: '8px' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                  </div>
                  <div className="text-gray-500 italic">{edu.institution}</div>
                  {edu.description && <p className="text-gray-700 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-1.5" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Skills</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">{skills.map((s) => (<span key={s.id} className="inline-flex items-center text-gray-700">{s.name}<SkillDots level={s.level} color={ac} /></span>))}</div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-1.5" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Languages</h2>
            <p className="text-gray-700">{languages.map((l) => `${l.name} (${l.level})`).join('  ·  ')}</p>
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-1.5" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Projects</h2>
            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id}><span className="font-bold text-gray-900">{proj.name}</span>{proj.url && <span className="text-gray-400 ml-1.5" style={{ fontSize: '8px' }}>{proj.url}</span>}{proj.description && <p className="text-gray-700 mt-0.5">{proj.description}</p>}</div>
              ))}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-1 mb-1.5" style={{ color: '#4a4a4a', borderBottom: `1px solid ${ac}` }}>Certifications</h2>
            <div className="space-y-1">{certifications.map((c) => (<div key={c.id}><span className="font-bold text-gray-900">{c.name}</span>{c.issuer && <span className="text-gray-500"> — {c.issuer}</span>}{c.date && <span className="text-gray-400 ml-2" style={{ fontSize: '8px' }}>({formatDate(c.date)})</span>}</div>))}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ resume, accentColor }: Props & { accentColor: string }) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const ac = accentColor;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) return <div className="p-8 text-gray-400 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Start filling in your details to see the preview</div>;

  return (
    <div className="flex" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9px' }}>
      <div className="w-[34%] bg-gray-900 text-white p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-base font-bold leading-tight">{p.fullName || 'Your Name'}</h1>
          <div className="mt-3 space-y-1 text-gray-300" style={{ fontSize: '8px' }}>
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
            {p.website && <div>{p.website}</div>}
          </div>
        </div>
        {skills.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: ac }}>Skills</h2>
            <div className="space-y-1.5">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-gray-300" style={{ fontSize: '8px' }}><span>{s.name}</span></div>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-0.5"><div className="h-full rounded-full" style={{ width: `${s.level * 20}%`, backgroundColor: ac }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: ac }}>Languages</h2>
            <div className="space-y-1">{languages.map((l) => (<div key={l.id} className="flex justify-between text-gray-300" style={{ fontSize: '8px' }}><span>{l.name}</span><span className="text-gray-500">{l.level}</span></div>))}</div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: ac }}>Certifications</h2>
            <div className="space-y-1.5">{certifications.map((c) => (<div key={c.id}><div className="text-gray-200 font-medium" style={{ fontSize: '8.5px' }}>{c.name}</div><div className="text-gray-500" style={{ fontSize: '7.5px' }}>{c.issuer}{c.date && ` • ${formatDate(c.date)}`}</div></div>))}</div>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 space-y-4">
        {p.summary && (<div><h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1">Profile</h2><p className="text-gray-600 leading-relaxed">{p.summary}</p></div>)}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline"><span className="font-bold text-gray-900" style={{ fontSize: '10px' }}>{exp.position}</span><span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span></div>
                  <div className="font-medium" style={{ fontSize: '8.5px', color: ac }}>{exp.company}</div>
                  {exp.description && <p className="text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Education</h2>
            <div className="space-y-2">{education.map((edu) => (<div key={edu.id}><div className="flex justify-between items-baseline"><span className="font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span><span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span></div><div className="text-gray-500">{edu.institution}</div>{edu.description && <p className="text-gray-600 mt-0.5">{edu.description}</p>}</div>))}</div>
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Projects</h2>
            <div className="space-y-1.5">{projects.map((proj) => (<div key={proj.id}><span className="font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>{proj.name}</span>{proj.url && <span className="text-gray-400 ml-1.5" style={{ fontSize: '7.5px' }}>{proj.url}</span>}{proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}</div>))}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({ resume, accentColor }: Props & { accentColor: string }) {
  const { personal_info: p, experience, education, skills, languages, projects } = resume;
  const ac = accentColor;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) return <div className="p-8 text-gray-400 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Start filling in your details to see the preview</div>;

  return (
    <div className="p-10" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9px' }}>
      <div className="pb-5 border-b border-gray-100">
        <h1 className="text-[28px] font-extralight text-gray-900 tracking-tight leading-tight">{p.fullName || 'Your Name'}</h1>
        <div className="w-10 h-[2px] mt-2.5 mb-2.5" style={{ backgroundColor: ac }} />
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-gray-400" style={{ fontSize: '7.5px' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span className="text-gray-200 ml-1">/</span>}
          {p.phone && <span className="ml-1">{p.phone}</span>}
          {p.location && <span className="text-gray-200 ml-1">/</span>}
          {p.location && <span className="ml-1">{p.location}</span>}
          {p.website && <span className="text-gray-200 ml-1">/</span>}
          {p.website && <span className="ml-1">{p.website}</span>}
        </div>
      </div>
      <div className="space-y-4 mt-4">
        {p.summary && <p className="text-gray-500 leading-relaxed">{p.summary}</p>}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: ac }}>Experience</h2>
            <div className="space-y-2.5">{experience.map((exp) => (<div key={exp.id} className="pl-3 border-l border-gray-200"><div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{exp.position}</div><div className="text-gray-400" style={{ fontSize: '8px' }}>{exp.company} · {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</div>{exp.description && <p className="text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}</div>))}</div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: ac }}>Education</h2>
            <div className="space-y-2">{education.map((edu) => (<div key={edu.id} className="pl-3 border-l border-gray-200"><div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div><div className="text-gray-400" style={{ fontSize: '8px' }}>{edu.institution} · {formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>{edu.description && <p className="text-gray-500 mt-0.5">{edu.description}</p>}</div>))}</div>
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: ac }}>Skills</h2>
            <div className="flex flex-wrap gap-1.5">{skills.map((s) => (<span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded" style={{ fontSize: '8px' }}>{s.name}<SkillDots level={s.level} color={ac} /></span>))}</div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: ac }}>Languages</h2>
            <div className="flex flex-wrap gap-1.5">{languages.map((l) => (<span key={l.id} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded" style={{ fontSize: '8px' }}>{l.name} · {l.level}</span>))}</div>
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: ac }}>Projects</h2>
            <div className="space-y-1.5">{projects.map((proj) => (<div key={proj.id} className="pl-3 border-l border-gray-200"><div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{proj.name}</div>{proj.description && <p className="text-gray-500 mt-0.5 leading-relaxed">{proj.description}</p>}</div>))}</div>
          </div>
        )}
      </div>
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
  const accentColor = resume.accent_color || '#059669';
  switch (resume.template) {
    case 'classic': return <ClassicTemplate resume={resume} accentColor={accentColor} />;
    case 'executive': return <ExecutiveTemplate resume={resume} accentColor={accentColor} />;
    case 'minimal': return <MinimalTemplate resume={resume} accentColor={accentColor} />;
    default: return <ModernTemplate resume={resume} accentColor={accentColor} />;
  }
}
