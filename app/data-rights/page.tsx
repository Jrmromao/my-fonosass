import DataSubjectRightsDashboard from '@/components/data-subject-rights/DataSubjectRightsDashboard'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DataRightsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DataSubjectRightsDashboard />
    </div>
  )
}
