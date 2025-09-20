'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Edit3, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface UserProfileData {
  user: {
    id: string
    email: string
    fullName: string
    role: string
    createdAt: string
  }
  subscription: {
    tier: 'FREE' | 'PRO'
    status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE'
    currentPeriodEnd?: string
  }
  downloadLimits: {
    canDownload: boolean
    remaining: number
    isPro: boolean
  }
  stats: {
    totalDownloads: number
    uniqueActivities: number
    recentDownloads: number
  }
  recentDownloads: Array<{
    id: string
    fileName: string
    downloadedAt: string
    activity: {
      id: string
      name: string
      type: string
      phoneme: string
      difficulty: string
    }
  }>
}

export function UserProfile() {
  const { t } = useTranslation()
  const [data, setData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div>No data available</div>

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {data.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{data.user.fullName}</h1>
              <p className="text-gray-600">{data.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs ${data.subscription.tier === 'PRO' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {data.subscription.tier}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${data.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {data.subscription.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {data.subscription.tier === 'FREE' && (
              <Button onClick={async () => {
                try {
                  const response = await fetch('/api/stripe/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  
                  const result = await response.json()
                  
                  if (result.url) {
                    window.location.href = result.url
                  }
                } catch (error) {
                  console.error('Error creating checkout:', error)
                }
              }}>
                Upgrade Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalDownloads}</div>
            <p className="text-xs text-gray-600">
              {data.stats.recentDownloads} nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Exercícios Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.uniqueActivities}</div>
            <p className="text-xs text-gray-600">
              Exercícios diferentes baixados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Downloads Restantes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.downloadLimits.isPro ? (
              <div>
                <div className="text-2xl font-bold text-green-600">∞</div>
                <p className="text-xs text-gray-600">Ilimitado</p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {data.downloadLimits.remaining}
                  <span className="text-sm text-gray-500 font-normal">/5</span>
                </div>
                <p className="text-xs text-gray-600">Este mês</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentDownloads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum download realizado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentDownloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{download.activity.name}</h4>
                    <p className="text-sm text-gray-600">{download.fileName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(download.downloadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Subject Rights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            {t('userProfile.dataRights.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-4">
            {t('userProfile.dataRights.description')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/data-rights">
              <Button variant="outline" className="w-full justify-start gap-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                <Download className="h-4 w-4" />
                {t('userProfile.dataRights.exportButton')}
              </Button>
            </Link>
            
            <Link href="/data-rights">
              <Button variant="outline" className="w-full justify-start gap-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                <Edit3 className="h-4 w-4" />
                {t('userProfile.dataRights.correctButton')}
              </Button>
            </Link>
            
            <Link href="/data-rights">
              <Button variant="outline" className="w-full justify-start gap-2 border-red-300 text-red-700 hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
                {t('userProfile.dataRights.deleteButton')}
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <Link href="/data-rights">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {t('userProfile.dataRights.accessPortalButton')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
