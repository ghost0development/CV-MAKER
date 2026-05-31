const labels = {
  pl: {
    summary: 'PODSUMOWANIE',
    experience: 'DOŚWIADCZENIE',
    education: 'EDUKACJA',
    skills: 'UMIEJĘTNOŚCI',
    languages: 'JĘZYKI',
    certifications: 'CERTYFIKATY',
    projects: 'PROJEKTY',
    interests: 'ZAINTERESOWANIA',
    present: 'Obecnie',
    level: 'Poziom',
    rating: 'Ocena',
  },
  en: {
    summary: 'PROFESSIONAL SUMMARY',
    experience: 'EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    languages: 'LANGUAGES',
    certifications: 'CERTIFICATIONS',
    projects: 'PROJECTS',
    interests: 'INTERESTS',
    present: 'Present',
    level: 'Level',
    rating: 'Rating',
  },
};

export function t(lang, key) {
  return labels[lang]?.[key] || labels.en[key] || key;
}

export function detectLanguage(data) {
  const polishChars = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
  const textFields = [
    data.summary,
    data.title,
    ...(data.experience || []).flatMap(e => [e.position, e.company, e.description]),
    ...(data.education || []).flatMap(e => [e.degree, e.institution, e.description]),
    ...(data.skills || []).map(s => s.name),
    ...(data.projects || []).flatMap(e => [e.name, e.description]),
  ];
  const polishCount = textFields.filter(f => f && polishChars.test(f)).length;
  const totalCount = textFields.filter(f => f).length;
  if (totalCount === 0) return 'pl';
  return polishCount / totalCount > 0.3 ? 'pl' : 'en';
}

export const ratingLabels = {
  pl: ['Słaby', 'Podstawowy', 'Średni', 'Dobry', 'Bardzo dobry', 'Zaawansowany', 'Ekspert'],
  en: ['Weak', 'Basic', 'Intermediate', 'Good', 'Very Good', 'Advanced', 'Expert'],
};

export function getRatingLabel(lang, rating) {
  const labels = ratingLabels[lang] || ratingLabels.en;
  const idx = Math.min(Math.floor((rating - 1) * labels.length / 10), labels.length - 1);
  return labels[Math.max(0, idx)];
}
