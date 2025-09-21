'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import EnhancedConsentManager from './EnhancedConsentManager';

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
      onClose={() => {
        console.log('Closing consent manager');
        setIsOpen(false);
      }}
      onOpen={() => {
        console.log('Opening consent manager, current isOpen:', isOpen);
        setIsOpen(true);
      }}
      showAuditTrail={!!user?.id}
    />
  );
}
