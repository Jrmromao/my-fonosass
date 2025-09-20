'use client';

import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const EnhancedConsentManager = dynamic(() => import('./EnhancedConsentManager'), {
  ssr: false,
  loading: () => null
});

export default function ConsentManagerWrapper() {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsClient(true);
    
    // Check if user has already set consent preferences
    if (user?.id) {
      const hasConsentPreferences = localStorage.getItem('consent-preferences');
      if (!hasConsentPreferences) {
        // Show consent banner for new users
        setIsOpen(true);
      }
    }
  }, [user?.id]);

  if (!isClient) {
    return null;
  }

  return (
    <EnhancedConsentManager 
      onConsentChange={(preferences) => {
        // Handle consent preferences
        console.log('Enhanced consent preferences:', preferences);
        localStorage.setItem('consent-preferences', JSON.stringify(preferences));
      }}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showAuditTrail={!!user?.id}
    />
  );
}
