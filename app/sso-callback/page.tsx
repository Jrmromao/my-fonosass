'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/dashboard')
      } else {
        router.push('/sign-in')
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
        <p className="text-indigo-600 dark:text-blue-300">
          Processando autenticação...
        </p>
      </div>
    </div>
  )
}
