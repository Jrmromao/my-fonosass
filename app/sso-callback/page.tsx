'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      router.push(isSignedIn ? '/dashboard' : '/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 text-neutral-900">
      <div className="text-center" role="status" aria-live="polite">
        <Loader2
          className="h-6 w-6 animate-spin mx-auto mb-3 text-neutral-600"
          aria-hidden
        />
        <p className="text-sm text-neutral-600">Conectando sua conta...</p>
      </div>
    </div>
  );
}
