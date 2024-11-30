// types/global.d.ts
import { Prisma } from '@prisma/client'

declare global {
    type User = Prisma.UserGetPayload<{
        include: { role: true; practice: true; patients: true; assessments: true }
    }>

    type Patient = Prisma.PatientGetPayload<{
        include: { practice: true; doctor: true; activities: true; assessments: true }
    }>

    type Activity = Prisma.ActivityGetPayload<{
        include: { practice: true; patients: true; assessments: true }
    }>

    type Assessment = Prisma.AssessmentGetPayload<{
        include: { patient: true; activity: true; assessedBy: true }
    }>

    type Practice = Prisma.PracticeGetPayload<{
        include: { plan: true; users: true; patients: true; activities: true }
    }>

    type Plan = Prisma.PlanGetPayload<{
        include: { practices: true }
    }>

    type Role = 'ADMIN' | 'DOCTOR' | 'STAFF'
    type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

    interface ServerResponse<T> {
        data?: T
        error?: string
    }
}

export {}