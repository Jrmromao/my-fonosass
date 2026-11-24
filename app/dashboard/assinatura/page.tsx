import { redirect } from 'next/navigation';

// Moved into the Perfil page. Kept so old links and Stripe return URLs work.
// ?interval=monthly|yearly (no checkout=) sends new subscribers to auto-checkout.
export default async function SubscriptionRedirect({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; interval?: string }>;
}) {
  const { checkout, interval } = await searchParams;
  if (!checkout && (interval === 'monthly' || interval === 'yearly')) {
    redirect(`/dashboard/subscribe?interval=${interval}`);
  }
  const qs = new URLSearchParams({ tab: 'assinatura' });
  if (checkout) qs.set('checkout', checkout);
  if (interval === 'monthly' || interval === 'yearly') {
    qs.set('interval', interval);
  }
  redirect(`/dashboard/profile?${qs.toString()}`);
}
