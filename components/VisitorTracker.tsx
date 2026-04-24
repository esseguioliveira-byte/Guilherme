'use client';

import { useEffect } from 'react';
import { trackVisit } from '@/app/actions/analytics';

export default function VisitorTracker() {
  useEffect(() => {
    // Apenas rastrear em produção/ambiente real para não poluir
    trackVisit();
  }, []);

  return null;
}
