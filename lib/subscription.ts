import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/db'

export async function getUserSubscription() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      subscriptions: true
    }
  })

  if (!user) {
    return null
  }

  const subscription = user.subscriptions

  if (!subscription) {
    return {
      isSubscribed: false,
      isPro: false,
      plan: 'free',
      exercisesUsed: 0,
      exerciseLimit: 5
    }
  }

  const isActive = subscription.status === 'ACTIVE' && 
    subscription.currentPeriodEnd && 
    subscription.currentPeriodEnd > new Date()

  return {
    isSubscribed: isActive,
    isPro: isActive,
    plan: isActive ? 'pro' : 'free',
    exercisesUsed: 0, // TODO: Track usage
    exerciseLimit: isActive ? 999999 : 5,
    currentPeriodEnd: subscription.currentPeriodEnd,
    status: subscription.status
  }
}

export async function checkExerciseAccess(exerciseId: string) {
  const subscription = await getUserSubscription()
  
  if (!subscription) {
    return { hasAccess: false, reason: 'Not authenticated' }
  }

  // Pro users have unlimited access
  if (subscription.isPro) {
    return { hasAccess: true, reason: 'Pro subscription' }
  }

  // Free users have limited access
  if (subscription.exercisesUsed >= subscription.exerciseLimit) {
    return { 
      hasAccess: false, 
      reason: 'Free limit exceeded',
      upgradeRequired: true 
    }
  }

  return { hasAccess: true, reason: 'Within free limit' }
}

export async function incrementExerciseUsage() {
  const { userId } = await auth()
  
  if (!userId) {
    return false
  }

  // TODO: Implement usage tracking
  // This would track downloads/views per month
  return true
}
