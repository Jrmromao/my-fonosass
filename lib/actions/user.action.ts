//
// import { UserRole } from '@prisma/client';
// import { cache } from 'react';
// import {auth, clerkClient} from "@clerk/nextjs/server";
//
// export type UserProfile = {
//     id: string;
//     clerkUserId: string;
//     email: string;
//     fullName: string;
//     role: UserRole;
//     createdAt:  any;
//     updatedAt:  any;
//     hasActiveSubscription: boolean;
// };
//
// // Get the current user from Clerk auth (cached)
// export const getCurrentClerkUser = cache(async () => {
//     const { userId } = auth();
//
//     if (!userId) {
//         return null;
//     }
//
//     try {
//         const user = await clerkClient.users.getUser(userId);
//         return user;
//     } catch (error) {
//         console.error('Error fetching Clerk user:', error);
//         return null;
//     }
// });
//
// // Get or create user profile in our database
// export const getUserProfile = async (): Promise<UserProfile | null> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         return null;
//     }
//
//     try {
//         // First try to get existing user profile
//         const user = await prisma.user.findUnique({
//             where: { clerkUserId: userId },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         // If user profile exists, return it
//         if (user) {
//             return {
//                 ...user,
//                 hasActiveSubscription: user.subscriptions !== null
//             } as UserProfile;
//         }
//
//         // If not, get user from Clerk and create profile
//         const clerkUser = await clerkClient.users.getUser(userId);
//         const primaryEmail = clerkUser.emailAddresses.find(email =>
//             email.id === clerkUser.primaryEmailAddressId
//         )?.emailAddress;
//
//         if (!primaryEmail) {
//             throw new Error('No primary email found for user');
//         }
//
//         // Create user profile in our database
//         const newUser = await prisma.user.create({
//             data: {
//                 clerkUserId: userId,
//                 email: primaryEmail,
//                 fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
//                 role: UserRole.USER, // Default role
//             },
//         });
//
//         return {
//             ...newUser,
//             hasActiveSubscription: false
//         } as UserProfile;
//     } catch (error) {
//         console.error('Error fetching or creating user profile:', error);
//         return null;
//     }
// };
//
// // Update user profile
// export const updateUserProfile = async (
//     userData: { fullName?: string; email?: string }
// ): Promise<UserProfile | null> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         return null;
//     }
//
//     try {
//         // Check if user exists
//         const existingUser = await getUserProfile();
//
//         if (!existingUser) {
//             throw new Error('User profile not found');
//         }
//
//         // Update user profile
//         const updatedUser = await prisma.user.update({
//             where: { clerkUserId: userId },
//             data: {
//                 ...userData,
//                 updatedAt: new Date(),
//             },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         return {
//             ...updatedUser,
//             hasActiveSubscription: updatedUser.subscriptions !== null
//         } as UserProfile;
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         return null;
//     }
// };
//
// // Update user role (admin only)
// export const updateUserRole = async (
//     userIdToUpdate: string,
//     newRole: UserRole
// ): Promise<UserProfile | null> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         return null;
//     }
//
//     try {
//         // Check if current user is an admin
//         const currentUser = await getUserProfile();
//
//         if (!currentUser || currentUser.role !== UserRole.ADMIN) {
//             throw new Error('Unauthorized: Only admins can update user roles');
//         }
//
//         // Update user role
//         const updatedUser = await prisma.user.update({
//             where: { id: userIdToUpdate },
//             data: {
//                 role: newRole,
//                 updatedAt: new Date(),
//             },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         return {
//             ...updatedUser,
//             hasActiveSubscription: updatedUser.subscriptions !== null
//         } as UserProfile;
//     } catch (error) {
//         console.error('Error updating user role:', error);
//         return null;
//     }
// };
//
// // Get all users (admin only)
// export const getAllUsers = async (
//     page = 1,
//     limit = 10
// ): Promise<{
//     users: UserProfile[];
//     totalCount: number;
//     totalPages: number;
// }> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         throw new Error('Unauthorized');
//     }
//
//     try {
//         // Check if current user is an admin
//         const currentUser = await getUserProfile();
//
//         if (!currentUser || currentUser.role !== UserRole.ADMIN) {
//             throw new Error('Unauthorized: Only admins can view all users');
//         }
//
//         // Calculate pagination
//         const skip = (page - 1) * limit;
//
//         // Get total count
//         const totalCount = await prisma.user.count();
//         const totalPages = Math.ceil(totalCount / limit);
//
//         // Get users with pagination
//         const users = await prisma.user.findMany({
//             skip,
//             take: limit,
//             orderBy: { createdAt: 'desc' },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         return {
//             users: users.map(user => ({
//                 ...user,
//                 hasActiveSubscription: user.subscriptions !== null
//             })) as UserProfile[],
//             totalCount,
//             totalPages
//         };
//     } catch (error) {
//         console.error('Error fetching all users:', error);
//         throw error;
//     }
// };
//
// // Check if user has an active subscription
// export const hasActiveSubscription = async (): Promise<boolean> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         return false;
//     }
//
//     try {
//         const user = await prisma.user.findUnique({
//             where: { clerkUserId: userId },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         return user?.subscriptions !== null;
//     } catch (error) {
//         console.error('Error checking subscription status:', error);
//         return false;
//     }
// };
//
// // Get user's activities
// export const getUserActivities = async (
//     page = 1,
//     limit = 10
// ): Promise<{
//     activities: any[]; // Type should match your Activity model
//     totalCount: number;
//     totalPages: number;
// }> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         throw new Error('Unauthorized');
//     }
//
//     try {
//         const user = await getUserProfile();
//
//         if (!user) {
//             throw new Error('User profile not found');
//         }
//
//         // Calculate pagination
//         const skip = (page - 1) * limit;
//
//         // Get total count
//         const totalCount = await prisma.activity.count({
//             where: { creatorId: user.id }
//         });
//         const totalPages = Math.ceil(totalCount / limit);
//
//         // Get activities with pagination
//         const activities = await prisma.activity.findMany({
//             where: { creatorId: user.id },
//             skip,
//             take: limit,
//             orderBy: { createdAt: 'desc' },
//             include: {
//                 // Include any related data you need
//                 phonemes: true,
//                 // other relations...
//             }
//         });
//
//         return {
//             activities,
//             totalCount,
//             totalPages
//         };
//     } catch (error) {
//         console.error('Error fetching user activities:', error);
//         throw error;
//     }
// };
//
// // Search users (admin only)
// export const searchUsers = async (
//     searchTerm: string,
//     page = 1,
//     limit = 10
// ): Promise<{
//     users: UserProfile[];
//     totalCount: number;
//     totalPages: number;
// }> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         throw new Error('Unauthorized');
//     }
//
//     try {
//         // Check if current user is an admin
//         const currentUser = await getUserProfile();
//
//         if (!currentUser || currentUser.role !== UserRole.ADMIN) {
//             throw new Error('Unauthorized: Only admins can search users');
//         }
//
//         // Calculate pagination
//         const skip = (page - 1) * limit;
//
//         // Search condition
//         const where = {
//             OR: [
//                 { email: { contains: searchTerm, mode: 'insensitive' } },
//                 { fullName: { contains: searchTerm, mode: 'insensitive' } }
//             ]
//         };
//
//         // Get total count for search
//         const totalCount = await prisma.user.count({ where });
//         const totalPages = Math.ceil(totalCount / limit);
//
//         // Get users with pagination
//         const users = await prisma.user.findMany({
//             where,
//             skip,
//             take: limit,
//             orderBy: { createdAt: 'desc' },
//             include: {
//                 subscriptions: {
//                     where: {
//                         OR: [
//                             { status: 'active' },
//                             { status: 'trialing' }
//                         ]
//                     }
//                 }
//             }
//         });
//
//         return {
//             users: users.map(user => ({
//                 ...user,
//                 hasActiveSubscription: user.subscriptions !== null
//             })) as UserProfile[],
//             totalCount,
//             totalPages
//         };
//     } catch (error) {
//         console.error('Error searching users:', error);
//         throw error;
//     }
// };
//
// // Get user stats (admin only)
// export const getUserStats = async (): Promise<{
//     totalUsers: number;
//     activeSubscriptions: number;
//     newUsersThisMonth: number;
//     newUsersLastMonth: number;
// }> => {
//     const { userId } = auth();
//
//     if (!userId) {
//         throw new Error('Unauthorized');
//     }
//
//     try {
//         // Check if current user is an admin
//         const currentUser = await getUserProfile();
//
//         if (!currentUser || currentUser.role !== UserRole.ADMIN) {
//             throw new Error('Unauthorized: Only admins can view user stats');
//         }
//
//         // Get total users
//         const totalUsers = await prisma.user.count();
//
//         // Get active subscriptions
//         const activeSubscriptions = await prisma.subscription.count({
//             where: {
//                 OR: [
//                     { status: 'active' },
//                     { status: 'trialing' }
//                 ]
//             }
//         });
//
//         // Get current date
//         const now = new Date();
//
//         // Calculate first day of current month
//         const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//
//         // Calculate first day of last month
//         const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//
//         // Calculate first day of two months ago
//         const firstDayOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
//
//         // Get new users this month
//         const newUsersThisMonth = await prisma.user.count({
//             where: {
//                 createdAt: {
//                     gte: firstDayOfCurrentMonth,
//                     lt: now
//                 }
//             }
//         });
//
//         // Get new users last month
//         const newUsersLastMonth = await prisma.user.count({
//             where: {
//                 createdAt: {
//                     gte: firstDayOfLastMonth,
//                     lt: firstDayOfCurrentMonth
//                 }
//             }
//         });
//
//         return {
//             totalUsers,
//             activeSubscriptions,
//             newUsersThisMonth,
//             newUsersLastMonth
//         };
//     } catch (error) {
//         console.error('Error fetching user stats:', error);
//         throw error;
//     }
// };