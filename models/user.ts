
// Data Transfer Object (DTO) for User
import {UserRole} from "@prisma/client";

export interface UserDto {
    id: string
    clerkUserId: string
    email: string
    fullName: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
    activitiesCount?: number
    hasSubscription?: boolean
}