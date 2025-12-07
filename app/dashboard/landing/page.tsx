import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - Almanaque da Fala',
  description:
    'Acesse sua área de trabalho no Almanaque da Fala. Gerencie pacientes, planos de tratamento e acompanhe o progresso.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLandingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // If user is authenticated, redirect to main dashboard
  redirect('/dashboard');
}
