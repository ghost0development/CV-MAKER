import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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

export function useResumes() {
  const { userId } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = useCallback(async () => {
    if (!userId) {
      setResumes([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    setResumes((data as Resume[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const saveResume = async (resume: Partial<Resume> & { id?: string }) => {
    if (!userId) return null;

    if (resume.id) {
      const { data, error } = await supabase
        .from('resumes')
        .update({ ...resume, updated_at: new Date().toISOString() })
        .eq('id', resume.id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchResumes();
      return data as Resume;
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ ...resume, user_id: userId })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchResumes();
      return data as Resume;
    }
  };

  const deleteResume = async (id: string) => {
    if (!userId) return;
    await supabase.from('resumes').delete().eq('id', id).eq('user_id', userId);
    await fetchResumes();
  };

  return { resumes, loading, saveResume, deleteResume, refetch: fetchResumes };
}
