'use client';

import { ConsentPreferences } from '@/lib/services/consentService';
import { useState } from 'react';
import EnhancedConsentManager from './EnhancedConsentManager';

export default function ConsentManagerTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Consent Manager Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open Consent Manager
        </button>
        
        {preferences && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Current Preferences:</h3>
            <pre className="text-sm">{JSON.stringify(preferences, null, 2)}</pre>
          </div>
        )}
      </div>

      <EnhancedConsentManager
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        onConsentChange={(newPreferences) => {
          console.log('Consent changed:', newPreferences);
          setPreferences(newPreferences);
        }}
        showAuditTrail={false}
      />
    </div>
  );
}
