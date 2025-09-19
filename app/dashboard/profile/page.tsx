import { UserProfile } from '@/components/user/UserProfile'

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie sua conta e acompanhe seu histórico de downloads</p>
      </div>
      
      <UserProfile />
    </div>
  )
}
