// types/global.d.ts
import { Prisma } from '@prisma/client'

declare global {

    type ActionResponse<T> = {
        data?: T;
        error?: string;
        message?: string;
        success?: boolean;
        redirectUrl?: string;
    };

    type User = Prisma.UserGetPayload<{
        include: { role: true; practice: true; patients: true; assessments: true }
    }>

    type Activity = Prisma.ActivityGetPayload<{
        include: { practice: true; patients: true; assessments: true }
    }>


    type Plan = Prisma.PlanGetPayload<{
        include: { practices: true }
    }>

    type Role = 'ADMIN' | 'USER'
    type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

    interface ServerResponse<T> {
        data?: T
        error?: string
    }
}

export {}