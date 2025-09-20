'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ConsentManager = dynamic(() => import('./ConsentManager'), {
  ssr: false,
  loading: () => null
});

export default function ConsentManagerWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <ConsentManager onConsentChange={(preferences) => {
      // Handle consent preferences
      console.log('Consent preferences:', preferences);
    }} />
  );
}
