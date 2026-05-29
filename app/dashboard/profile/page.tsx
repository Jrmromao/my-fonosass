'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Download, Edit, FileText, Mail, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ clinic: '', specialization: '' });

  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: async (): Promise<{
      data?: { total?: number; downloads?: number };
    }> => {
      const res = await fetch('/api/dashboard/stats');
      return res.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (user?.unsafeMetadata) {
      setFormData({
        clinic: (user.unsafeMetadata.clinic as string) || '',
        specialization: (user.unsafeMetadata.specialization as string) || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    await user?.update({
      unsafeMetadata: { ...user.unsafeMetadata, ...formData },
    });
    setIsEditing(false);
  };

  if (!isLoaded) {
    return (
      <div className="h-full p-8">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="px-8 py-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white font-display">
            Meu Perfil
          </h1>
        </div>
      </div>

      <div className="p-8 max-w-3xl">
        {/* Profile Card */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-100">
                  <AvatarFallback className="text-lg bg-indigo-50 text-indigo-600 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.fullName || 'Utilizador'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                  {formData.specialization && formData.specialization.length > 2 && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {formData.specialization}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Clínica</Label>
                    <Input
                      value={formData.clinic}
                      onChange={(e) =>
                        setFormData({ ...formData, clinic: e.target.value })
                      }
                      placeholder="Nome da clínica"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Especialização
                    </Label>
                    <Input
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Ex: Fonemas e Consciência Fonológica"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    3
                  </p>
                  <p className="text-xs text-gray-500">
                    Downloads restantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Download className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.data?.downloads || 0}
                  </p>
                  <p className="text-xs text-gray-500">Downloads este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        {!!user?.unsafeMetadata?.preferences && (
          <Card className="border-gray-200 dark:border-gray-800 mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(user.unsafeMetadata.preferences as any)?.ageRanges?.length >
                  0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      Faixas etárias
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(user.unsafeMetadata.preferences as any).ageRanges.map(
                        (age: string) => (
                          <Badge
                            key={age}
                            variant="outline"
                            className="text-xs"
                          >
                            {age}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
                {(user.unsafeMetadata.preferences as any)?.phonemes?.length >
                  0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Fonemas</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(user.unsafeMetadata.preferences as any).phonemes.map(
                        (p: string) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            /{p}/
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card className="border-gray-200 dark:border-gray-800 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Membro desde</span>
                <span className="text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Plano</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Gratuito</Badge>
                  <Link href="/#assinatura" className="text-xs text-[#f97066] font-medium hover:underline">
                    Fazer upgrade
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
