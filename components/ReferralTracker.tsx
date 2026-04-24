'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      // Set cookie for 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `affiliate_ref=${ref}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      console.log('Affiliate referral set:', ref);
    }
  }, [ref]);

  return null;
}
