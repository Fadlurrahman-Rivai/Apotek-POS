'use client';

import { useEffect } from 'react';
import { initDB } from '@/database/db';

export default function AppInitializer() {
  useEffect(() => {
    initDB();
  }, []);

  return null;
}
