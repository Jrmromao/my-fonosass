import ConsentDashboard from '@/components/legal/ConsentDashboard';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ConsentDashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8">
      <ConsentDashboard />
    </div>
  );
}
