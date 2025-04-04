// app/settings/billing/page.tsx
import {BillingPageClient} from '@/components/BillingPageClient';
import {auth} from '@clerk/nextjs/server';
import {prisma} from '@/app/db';
import {redirect} from 'next/navigation';

export default async function BillingPage() {
    const {userId} = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Get user subscription status
    const user = await prisma.user.findUnique({
        where: {clerkUserId: userId},
        include: {subscriptions: true},
    });

    const isSubscribed = user?.subscriptions?.status === 'ACTIVE';

    return <BillingPageClient subscription={{
        isSubscribed: isSubscribed,
        tier: user?.subscriptions?.tier,
        status: user?.subscriptions?.status,
        currentPeriodEnd: user?.subscriptions?.currentPeriodEnd as Date
    }}/>
}