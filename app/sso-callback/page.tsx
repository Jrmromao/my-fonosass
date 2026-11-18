'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

/**
 * Return point after Google. AuthenticateWithRedirectCallback finishes the
 * OAuth flow (creates the session); without it Google sign-in never
 * completed. New accounts that still miss a field (the username Clerk
 * requires) continue at /sso-callback/concluir.
 */
export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 text-neutral-900">
      <div className="text-center" role="status" aria-live="polite">
        <Loader2
          className="h-6 w-6 animate-spin mx-auto mb-3 text-neutral-600"
          aria-hidden
        />
        <p className="text-sm text-neutral-600">Conectando sua conta...</p>
      </div>
      <AuthenticateWithRedirectCallback
        continueSignUpUrl="/sso-callback/concluir"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
