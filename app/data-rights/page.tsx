import { redirect } from 'next/navigation';

// Moved into Configurações > Privacidade. Kept so old links keep working.
export default function Page() {
  redirect('/dashboard/profile?tab=privacidade');
}
