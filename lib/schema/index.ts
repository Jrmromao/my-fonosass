import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    practiceId: z.string().optional(),
    roleId: z.string()
})

export const patientSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.date(),
    practiceId: z.string(),
    doctorId: z.string()
})

export const activitySchema = z.object({
    name: z.string().min(2),
    description: z.string(),
    maxScore: z.number().min(0),
    patientIds: z.array(z.string())
})

export const assessmentSchema = z.object({
    patientId: z.string(),
    activityId: z.string(),
    score: z.number().min(0),
    notes: z.string().optional(),
    date: z.date().default(() => new Date())
})

export const practiceSchema = z.object({
    name: z.string().min(2),
    planId: z.string()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type AssessmentInput = z.infer<typeof assessmentSchema>
export type PracticeInput = z.infer<typeof practiceSchema>