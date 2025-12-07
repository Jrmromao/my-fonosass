'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Edit,
  Mail,
  MapPin,
  Phone,
  Save,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserStats {
  totalExercises: number;
  completedThisMonth: number;
  averageSessionTime: number;
  favoriteCategory: string;
  streak: number;
  totalHours: number;
  weeklyProgress: number;
  monthlyGoal: number;
  completedGoal: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    clinic: '',
    experience: '',
    specialization: '',
  });

  // Real user statistics - will be fetched from API
  const [userStats, setUserStats] = useState<UserStats>({
    totalExercises: 0,
    completedThisMonth: 0,
    averageSessionTime: 0,
    favoriteCategory: '',
    streak: 0,
    totalHours: 0,
    weeklyProgress: 0,
    monthlyGoal: 30,
    completedGoal: 0,
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // TODO: Replace with actual API calls
        // For now, use mock data with user info from Clerk
        if (user) {
          setProfileData({
            name: user.fullName || 'Usuário',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: '+55 11 99999-9999',
            location: 'São Paulo, SP',
            bio: 'Fonoaudiólogo especializado em terapia da fala para crianças.',
            clinic: 'Clínica FonoVida',
            experience: '5 anos',
            specialization: 'Fonemas e Consciência Fonológica',
          });

          // Mock stats - replace with real API calls
          setUserStats({
            totalExercises: 127,
            completedThisMonth: 23,
            averageSessionTime: 25,
            favoriteCategory: 'Fonemas',
            streak: 12,
            totalHours: 45,
            weeklyProgress: 75,
            monthlyGoal: 30,
            completedGoal: 23,
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality with API call
      console.log('Saving profile data:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="py-6 px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="py-6 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                ←
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Meu Perfil
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  Gerencie suas informações pessoais e acompanhe seu progresso
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 dark:border-gray-800 shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Avatar className="h-24 w-24 border-4 border-blue-100 dark:border-blue-900">
                    <AvatarFallback className="text-2xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {profileData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-200">
                  {profileData.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {profileData.specialization}
                </CardDescription>
                <div className="flex justify-center space-x-2 mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {profileData.experience} de experiência
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    {profileData.clinic}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {profileData.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {profileData.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {profileData.location}
                    </span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Biografia
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 gap-1 rounded-lg">
                <TabsTrigger
                  value="overview"
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
                             data-[state=active]:text-white data-[state=active]:bg-gradient-to-r
                             data-[state=active]:from-blue-500 data-[state=active]:to-teal-500
                             data-[state=active]:shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                             transition-all rounded-md"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
                             data-[state=active]:text-white data-[state=active]:bg-gradient-to-r
                             data-[state=active]:from-blue-500 data-[state=active]:to-teal-500
                             data-[state=active]:shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                             transition-all rounded-md"
                >
                  Estatísticas
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
                             data-[state=active]:text-white data-[state=active]:bg-gradient-to-r
                             data-[state=active]:from-blue-500 data-[state=active]:to-teal-500
                             data-[state=active]:shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                             transition-all rounded-md"
                >
                  Atividade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Exercícios Completos
                      </CardTitle>
                      <Award className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.totalExercises}
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        +{userStats.completedThisMonth} este mês
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Sequência Atual
                      </CardTitle>
                      <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.streak} dias
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Mantenha o ritmo!
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tempo Total
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.totalHours}h
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Média: {userStats.averageSessionTime}min/sessão
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Goal Progress */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                      Meta Mensal
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Progresso em direção à sua meta de {userStats.monthlyGoal}{' '}
                      exercícios este mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {userStats.completedGoal} de {userStats.monthlyGoal}{' '}
                          exercícios
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(
                            (userStats.completedGoal / userStats.monthlyGoal) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (userStats.completedGoal / userStats.monthlyGoal) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Edit Form */}
                {isEditing && (
                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 dark:text-gray-200">
                        Editar Informações do Perfil
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Atualize suas informações pessoais e profissionais.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Nome Completo
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="email"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="phone"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="location"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Localização
                          </Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                location: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="bio"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Biografia
                        </Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-200">
                      Estatísticas Detalhadas
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Análise do seu progresso e uso da plataforma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Estatísticas em Desenvolvimento
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Em breve você terá acesso a gráficos detalhados e
                        análises avançadas do seu progresso.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-200">
                      Histórico de Atividade
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Registro completo de todos os seus exercícios e
                      interações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Histórico em Desenvolvimento
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Em breve você poderá visualizar todo o seu histórico de
                        atividades e progresso.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
