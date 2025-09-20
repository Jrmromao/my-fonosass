'use client';

import dynamic from 'next/dynamic';

const ConsentManager = dynamic(() => import('./ConsentManager'), {
  ssr: false,
  loading: () => null
});

export default function ConsentManagerWrapper() {
  return (
    <ConsentManager onConsentChange={(preferences) => {
      // Handle consent preferences
      console.log('Consent preferences:', preferences);
    }} />
  );
}
