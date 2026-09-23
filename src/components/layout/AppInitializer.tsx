'use client';

import { useEffect } from 'react';
import { initDB, syncFromCloud } from '@/database/db';
import { isSupabaseReady } from '@/lib/supabase';

export default function AppInitializer() {
  useEffect(() => {
    initDB();

    const handleFocus = () => {
      if (isSupabaseReady()) {
        syncFromCloud();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return null;
}
