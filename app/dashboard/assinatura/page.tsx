import { redirect } from 'next/navigation';

// Moved into the Perfil page. Kept so old links and Stripe return URLs work.
export default async function SubscriptionRedirect({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const qs = new URLSearchParams({ tab: 'assinatura' });
  if (checkout) qs.set('checkout', checkout);
  redirect(`/dashboard/profile?${qs.toString()}`);
}
