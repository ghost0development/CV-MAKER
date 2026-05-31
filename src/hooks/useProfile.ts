import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  plan: 'free' | 'pro';
  stripe_customer_id: string | null;
}

export function useProfile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const ensureProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data) {
        const { data: created } = await supabase
          .from('profiles')
          .insert({ id: userId, plan: 'free' })
          .select()
          .maybeSingle();
        setProfile(created as Profile | null);
      } else {
        setProfile(data as Profile | null);
      }
      setLoading(false);
    };

    ensureProfile();
  }, [userId]);

  return { profile, loading, setProfile };
}
