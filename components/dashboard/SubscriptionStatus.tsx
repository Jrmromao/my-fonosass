'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Crown, Download } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SubscriptionData {
  tier: 'FREE' | 'PRO'
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE'
  currentPeriodEnd?: string
  downloadsUsed: number
  downloadsRemaining: number
  isPro: boolean
}

interface SubscriptionStatusProps {
  className?: string
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/download-limit')
      const result = await response.json()
      
      if (result.success) {
        setData({
          tier: result.data.isPro ? 'PRO' : 'FREE',
          status: result.data.isPro ? 'ACTIVE' : 'INACTIVE',
          downloadsUsed: result.data.isPro ? 0 : (5 - result.data.remaining),
          downloadsRemaining: result.data.remaining,
          isPro: result.data.isPro
        })
      } else {
        setError('Nenhuma assinatura encontrada')
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      setError('Erro ao carregar assinatura')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className || ''}`}>
      {/* Subscription Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
          {data.isPro ? (
            <Crown className="h-4 w-4 text-yellow-600" />
          ) : (
            <CreditCard className="h-4 w-4 text-gray-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={data.isPro ? "default" : "secondary"}>
              {data.tier}
            </Badge>
            <Badge 
              variant={data.status === 'ACTIVE' ? "default" : "destructive"}
              className={data.status === 'ACTIVE' ? "bg-green-600" : ""}
            >
              {data.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          {data.isPro ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">Pro</p>
              <p className="text-sm text-gray-600">
                Downloads ilimitados • Todos os recursos
              </p>
              {data.currentPeriodEnd && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Renova em {new Date(data.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-bold">Gratuito</p>
              <p className="text-sm text-gray-600">
                5 downloads por mês
              </p>
              <Button onClick={handleUpgrade} className="w-full mt-2">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade para Pro - R$ 39,90/mês
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Downloads</CardTitle>
          <Download className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {data.isPro ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">∞</p>
              <p className="text-sm text-gray-600">Downloads ilimitados</p>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {data.downloadsRemaining}
                <span className="text-sm text-gray-500 font-normal">/5</span>
              </p>
              <p className="text-sm text-gray-600">Downloads restantes</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(data.downloadsRemaining / 5) * 100}%` }}
                ></div>
              </div>
              {data.downloadsRemaining === 0 && (
                <p className="text-xs text-red-600">
                  Limite atingido! Upgrade para downloads ilimitados.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
