import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { cvs } from '../api/client';
import { t, detectLanguage, getRatingLabel } from '../i18n';

export default function SharedCV() {
  const { link } = useParams();
  const [cv, setCv] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cvs.getShared(link)
      .then(setCv)
      .catch(() => setError('CV nie znalezione lub nie jest publiczne'));
  }, [link]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="card text-center py-16">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">{error}</h2>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const data = JSON.parse(cv.data);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary-600" />
          <span className="font-semibold">{cv.title}</span>
        </div>
        <button onClick={() => window.print()} className="btn-secondary text-sm flex items-center gap-1">
          <Download size={16} /> Drukuj / PDF
        </button>
      </div>
      <div className="p-8 flex justify-center">
        <div className="cv-page" style={{ fontFamily: cv.font || 'Inter' }}>
          <CVContent data={data} />
        </div>
      </div>
    </div>
  );
}

function CVContent({ data }) {
  const lang = data.language === 'auto' ? detectLanguage(data) : (data.language || 'pl');

  return (
    <div>
      <div className="border-b-4 border-primary-600 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-primary-600 mb-1">
          {data.firstName} {data.lastName}
        </h1>
        {data.title && <p className="text-lg text-gray-600 mb-2">{data.title}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.website && <span>{data.website}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-2">{t(lang, 'summary')}</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-3">{t(lang, 'experience')}</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{exp.position}</p>
                  <p className="text-sm text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">{exp.startDate} - {exp.endDate || t(lang, 'present')}</p>
              </div>
              {exp.description && <p className="text-sm text-gray-700 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.education?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-3">{t(lang, 'education')}</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">{edu.startDate} - {edu.endDate}</p>
              </div>
              {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.skills?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-3">{t(lang, 'skills')}</h2>
          <div className="space-y-2">
            {data.skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <span className="text-primary-600 font-semibold">{skill.level || 5}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${(skill.level || 5) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.languages?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-3">{t(lang, 'languages')}</h2>
          <div className="flex flex-wrap gap-3">
            {data.languages.map((l, i) => (
              <span key={i} className="text-sm text-gray-700">{l.name} {l.level ? `- ${l.level}` : ''}</span>
            ))}
          </div>
        </div>
      )}

      {data.certifications?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-2">{t(lang, 'certifications')}</h2>
          {data.certifications.map((cert, i) => (
            <div key={i} className="mb-1 text-sm">
              <span className="font-medium">{cert.name}</span>
              {cert.issuer && <span className="text-gray-600"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
            </div>
          ))}
        </div>
      )}

      {data.projects?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-600 mb-2">{t(lang, 'projects')}</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-gray-900">{proj.name}</p>
              {proj.description && <p className="text-sm text-gray-700">{proj.description}</p>}
              {proj.url && <p className="text-xs text-primary-600">{proj.url}</p>}
            </div>
          ))}
        </div>
      )}

      {data.hobbies?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-primary-600 mb-2">{t(lang, 'interests')}</h2>
          <p className="text-sm text-gray-700">{data.hobbies.map(h => h.name || h).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
