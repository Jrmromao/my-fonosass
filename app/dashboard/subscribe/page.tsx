import StartCheckout from '@/components/dashboard/StartCheckout';
import { Suspense } from 'react';

export const metadata = {
  title: 'Assinar',
  robots: { index: false, follow: false },
};

/** Deep link after sign-up: starts Stripe checkout for ?interval=monthly|yearly. */
export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-6 text-center text-sm text-neutral-600">
          A abrir o pagamento…
        </div>
      }
    >
      <StartCheckout />
    </Suspense>
  );
}
