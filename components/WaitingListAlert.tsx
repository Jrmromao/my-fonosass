'use client'

import React, { useState } from 'react'
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WaitingListAlertProps {
  onClose?: () => void
}

export default function WaitingListAlert({ onClose }: WaitingListAlertProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao adicionar email à lista de espera')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Obrigado! Você foi adicionado à nossa lista de espera. Te avisaremos quando estivermos prontos!
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center flex-1">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <strong>Almanaque da Fala</strong> está em construção! 
                <span className="hidden sm:inline"> Cadastre-se na nossa lista de espera e seja o primeiro a saber quando lançarmos.</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-48 sm:w-56 bg-white/90 text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-pink-600 hover:bg-white/90 font-medium px-4 py-2"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
            
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2">
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
