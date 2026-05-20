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

function SkillDots({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5 ml-1.5 align-middle">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            dot <= level ? 'bg-emerald-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

function SkillBars({ level }: { level: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 ml-2 align-middle w-16">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${level * 20}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Modern Template (Free) ─── */
function ModernTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-8 leading-relaxed h-full flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9.5px' }}>
      {/* Header with accent bar */}
      <div className="flex gap-5 pb-4 border-b border-gray-100">
        <div className="w-1 bg-emerald-500 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">{p.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-gray-500 text-[8.5px]">
            {p.email && <span className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{p.email}</span>}
            {p.phone && <span className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{p.phone}</span>}
            {p.location && <span className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{p.location}</span>}
            {p.website && <span className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>{p.website}</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3.5 mt-4">
        {/* Summary */}
        {p.summary && (
          <div>
            <p className="text-gray-600 leading-relaxed">{p.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900 text-[10px]">{exp.position}</span>
                      <span className="text-gray-500 ml-1.5">at {exp.company}</span>
                    </div>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && <p className="text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 text-[10px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="text-gray-500">{edu.institution}</div>
                  {edu.description && <p className="text-gray-600 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Skills</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center text-gray-700 font-medium">
                  {s.name}
                  <SkillBars level={s.level} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Languages</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {languages.map((l) => (
                <span key={l.id} className="text-gray-700">
                  {l.name} <span className="text-gray-400">— {l.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Projects</h2>
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-1.5">Certifications</h2>
            <div className="space-y-1">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span className="text-gray-700">
                    <span className="font-medium text-gray-900">{c.name}</span>
                    {c.issuer && <span className="text-gray-400 ml-1">— {c.issuer}</span>}
                  </span>
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

/* ─── Classic Template (Free) ─── */
function ClassicTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-8 leading-relaxed h-full flex flex-col" style={{ fontFamily: 'Georgia, serif', fontSize: '9.5px', color: '#1a1a1a' }}>
      {/* Header */}
      <div className="text-center pb-4 mb-4" style={{ borderBottom: '2px solid #1a1a1a' }}>
        <h1 className="text-[24px] font-bold tracking-wide leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{p.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-2 text-gray-600" style={{ fontSize: '8.5px' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span className="text-gray-300">|</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span className="text-gray-300">|</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span className="text-gray-300">|</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Summary */}
        {p.summary && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4a4a4a' }}>Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed italic">{p.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-2" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Professional Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-gray-900">{exp.position}</span>
                      <span className="text-gray-500"> — {exp.company}</span>
                    </div>
                    <span className="text-gray-400 italic whitespace-nowrap ml-2" style={{ fontSize: '8px' }}>
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && <p className="text-gray-700 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-2" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    <span className="text-gray-400 italic whitespace-nowrap ml-2" style={{ fontSize: '8px' }}>
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="text-gray-500 italic">{edu.institution}</div>
                  {edu.description && <p className="text-gray-700 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-1.5" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Skills</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center text-gray-700">
                  {s.name}
                  <SkillDots level={s.level} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-1.5" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Languages</h2>
            <p className="text-gray-700">
              {languages.map((l) => `${l.name} (${l.level})`).join('  ·  ')}
            </p>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-1.5" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Projects</h2>
            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-bold text-gray-900">{proj.name}</span>
                  {proj.url && <span className="text-gray-400 ml-1.5" style={{ fontSize: '8px' }}>{proj.url}</span>}
                  {proj.description && <p className="text-gray-700 mt-0.5">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest pb-0.5 mb-1.5" style={{ color: '#4a4a4a', borderBottom: '1px solid #ccc' }}>Certifications</h2>
            <div className="space-y-1">
              {certifications.map((c) => (
                <div key={c.id}>
                  <span className="font-bold text-gray-900">{c.name}</span>
                  {c.issuer && <span className="text-gray-500"> — {c.issuer}</span>}
                  {c.date && <span className="text-gray-400 ml-2" style={{ fontSize: '8px' }}>({formatDate(c.date)})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Executive Template (Pro) ─── */
function ExecutiveTemplate({ resume }: Props) {
  const { personal_info: p, experience, education, skills, languages, projects, certifications } = resume;
  const hasContent = p.fullName || p.email || experience.length || education.length;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9px' }}>
      {/* Sidebar */}
      <div className="w-[34%] bg-gray-900 text-white p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-base font-bold leading-tight">{p.fullName || 'Your Name'}</h1>
          <div className="mt-3 space-y-1 text-gray-300" style={{ fontSize: '8px' }}>
            {p.email && <div className="flex items-center gap-1.5"><svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{p.email}</div>}
            {p.phone && <div className="flex items-center gap-1.5"><svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{p.phone}</div>}
            {p.location && <div className="flex items-center gap-1.5"><svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{p.location}</div>}
            {p.website && <div className="flex items-center gap-1.5"><svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>{p.website}</div>}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2">Skills</h2>
            <div className="space-y-1.5">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-gray-300" style={{ fontSize: '8px' }}>
                    <span>{s.name}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-0.5">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${s.level * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2">Languages</h2>
            <div className="space-y-1">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between text-gray-300" style={{ fontSize: '8px' }}>
                  <span>{l.name}</span>
                  <span className="text-gray-500">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 className="text-[7px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2">Certifications</h2>
            <div className="space-y-1.5">
              {certifications.map((c) => (
                <div key={c.id}>
                  <div className="text-gray-200 font-medium" style={{ fontSize: '8.5px' }}>{c.name}</div>
                  <div className="text-gray-500" style={{ fontSize: '7.5px' }}>{c.issuer}{c.date && ` • ${formatDate(c.date)}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        {p.summary && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1">Profile</h2>
            <p className="text-gray-600 leading-relaxed">{p.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900" style={{ fontSize: '10px' }}>{exp.position}</span>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div className="text-emerald-600 font-medium" style={{ fontSize: '8.5px' }}>{exp.company}</div>
                  {exp.description && <p className="text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    <span className="text-gray-400 whitespace-nowrap ml-2" style={{ fontSize: '7.5px' }}>
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="text-gray-500">{edu.institution}</div>
                  {edu.description && <p className="text-gray-600 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-1.5">Projects</h2>
            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>{proj.name}</span>
                  {proj.url && <span className="text-gray-400 ml-1.5" style={{ fontSize: '7.5px' }}>{proj.url}</span>}
                  {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
                </div>
              ))}
            </div>
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
      <div className="flex items-center justify-center h-full text-gray-400 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Start filling in your details to see the preview
      </div>
    );
  }

  return (
    <div className="p-10 leading-relaxed h-full flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '9px' }}>
      {/* Header */}
      <div className="pb-5 border-b border-gray-100">
        <h1 className="text-[28px] font-extralight text-gray-900 tracking-tight leading-tight">{p.fullName || 'Your Name'}</h1>
        <div className="w-10 h-[2px] bg-emerald-400 mt-2.5 mb-2.5" />
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-gray-400" style={{ fontSize: '7.5px' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span className="text-gray-200">/</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span className="text-gray-200">/</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span className="text-gray-200">/</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-4 mt-4">
        {/* Summary */}
        {p.summary && (
          <p className="text-gray-500 leading-relaxed">{p.summary}</p>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Experience</h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id} className="pl-3 border-l border-gray-200">
                  <div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{exp.position}</div>
                  <div className="text-gray-400" style={{ fontSize: '8px' }}>{exp.company} · {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                  {exp.description && <p className="text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="pl-3 border-l border-gray-200">
                  <div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                  <div className="text-gray-400" style={{ fontSize: '8px' }}>{edu.institution} · {formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
                  {edu.description && <p className="text-gray-500 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded" style={{ fontSize: '8px' }}>
                  {s.name}
                  <SkillDots level={s.level} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Languages</h2>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span key={l.id} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded" style={{ fontSize: '8px' }}>
                  {l.name} · {l.level}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[7.5px] font-medium text-emerald-600 uppercase tracking-[0.2em] mb-2">Projects</h2>
            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id} className="pl-3 border-l border-gray-200">
                  <div className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{proj.name}</div>
                  {proj.description && <p className="text-gray-500 mt-0.5 leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
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
