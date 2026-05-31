import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const LOCAL_RESUMES_KEY = 'cvcraft_resumes';

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: string;
  personal_info: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertItem[];
  projects: ProjectItem[];
  accent_color: string;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
}

const defaultPersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  summary: '',
};

export function createEmptyResume(): Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    title: 'My Resume',
    template: 'modern',
    personal_info: { ...defaultPersonalInfo },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    accent_color: '#059669',
    is_pro: false,
  };
}

function loadLocalResumes(): Resume[] {
  try {
    const raw = localStorage.getItem(LOCAL_RESUMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalResumes(items: Resume[]) {
  try {
    localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(items));
  } catch {}
}

export function useResumes() {
  const { userId } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>(loadLocalResumes);
  const [loading, setLoading] = useState(false);

  const fetchResumes = useCallback(async () => {
    if (!userId) {
      setResumes(loadLocalResumes());
      return;
    }

    if (!supabase) {
      setResumes(loadLocalResumes());
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (data) {
      const items = data as Resume[];
      setResumes(items);
      saveLocalResumes(items);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const saveResume = async (resume: Partial<Resume> & { id?: string }) => {
    if (!userId) return null;

    const updated = { ...resume, updated_at: new Date().toISOString() } as Resume;

    setResumes(prev => {
      const idx = prev.findIndex(r => r.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        saveLocalResumes(copy);
        return copy;
      }
      const copy = [updated, ...prev];
      saveLocalResumes(copy);
      return copy;
    });

    if (supabase) {
      try {
        const { data, error } = resume.id
          ? await supabase.from('resumes').update(updated).eq('id', resume.id).eq('user_id', userId).select().maybeSingle()
          : await supabase.from('resumes').insert({ ...updated, user_id: userId }).select().maybeSingle();
        if (error) throw error;
        return data as Resume;
      } catch (e) {
        console.warn('Supabase save failed, using local only', e);
        return null;
      }
    }
    return null;
  };

  const deleteResume = async (id: string) => {
    if (!userId) return;
    setResumes(prev => {
      const copy = prev.filter(r => r.id !== id);
      saveLocalResumes(copy);
      return copy;
    });
    if (supabase) {
      await supabase.from('resumes').delete().eq('id', id).eq('user_id', userId);
    }
  };

  return { resumes, loading, saveResume, deleteResume, refetch: fetchResumes };
}
