"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { patientSchema } from "@/lib/schema"
import { PatientListItem } from "@/types/types"
import { Prisma } from "@prisma/client"
import {validateAuthentication} from "@/lib/actions/authValidation.action";

/**
 * Get all patients for the current user's practice
 */
export async function getPatients(): Promise<ActionResponse<PatientListItem[]>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        const patients = await prisma.patient.findMany({
            where: {
                practiceId: auth.practice.practiceId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                status: true,
            },
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' }
            ]
        })

        // Transform to match PatientListItem type
        const transformedPatients = patients.map(patient => ({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`,
            status: patient.status
        }))

        return {
            success: true,
            data: transformedPatients
        }
    } catch (error: any) {
        console.error('Error fetching patients:', error)
        return {
            success: false,
            error: error.message || "Failed to fetch patients"
        }
    }
}

/**
 * Get a specific patient by ID
 */
export async function getPatientById(patientId: string): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId,
                practiceId: auth.practice.practiceId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                gender: true,
                contactEmail: true,
                contactPhone: true,
                address: true,
                medicalHistory: true,
                status: true,
                primaryTherapist: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                progressNotes: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5,
                    select: {
                        id: true,
                        createdAt: true
                    }
                },
                activities: {
                    where: {
                        status: 'ACTIVE'
                    },
                    select: {
                        id: true,
                        activity: {
                            select: {
                                name: true,
                                type: true
                            }
                        },
                        status: true
                    }
                }
            }
        })

        if (!patient) {
            return {
                success: false,
                error: "Patient not found"
            }
        }

        // Transform dates to strings for serialization
        const transformedPatient = {
            ...patient,
            dateOfBirth: patient.dateOfBirth.toISOString(),
            fullName: `${patient.firstName} ${patient.lastName}`,
            progressNotes: patient.progressNotes.map(note => ({
                ...note,
                createdAt: note.createdAt.toISOString()
            }))
        }

        return {
            success: true,
            data: transformedPatient
        }

    } catch (error: any) {
        console.error('Error fetching patient:', error)
        return {
            success: false,
            error: error.message || "Failed to fetch patient"
        }
    }
}

/**
 * Create a new patient
 */
export async function createPatient(data: z.infer<typeof patientSchema>): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        // Validate input data first
        const validation = patientSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                error: "Validation failed",
                data: validation.error.flatten().fieldErrors
            }
        }

        const patient = await prisma.patient.create({
            data: {
                firstName: validation.data.firstName,
                lastName: validation.data.lastName,
                dateOfBirth: new Date(validation.data.dateOfBirth),
                gender: validation.data.gender,
                contactEmail: validation.data.contactEmail,
                contactPhone: validation.data.contactPhone,
                address: validation.data.address,
                medicalHistory: validation.data.medicalHistory || null,
                status: 'ACTIVE',
                primaryTherapistId: auth.user.id,
                practiceId: auth.practice.practiceId
            }
        })

        revalidatePath('/dashboard/patient')

        return {
            success: true,
            data: patient,
            message: "Patient created successfully",
            redirectUrl: `/dashboard/patient/${patient.id}`
        }

    } catch (error: any) {
        console.error('Error creating patient:', error)

        // More specific error handling
        if (error.code === 'P2002') {
            return {
                success: false,
                error: "Patient already exists with this email"
            }
        }

        if (error.code === 'P2003') {
            return {
                success: false,
                error: "Reference error: therapist or practice not found"
            }
        }

        return {
            success: false,
            error: "Error creating patient: " + (error.message || "Unknown error")
        }
    }
}

/**
 * Get patients with pagination, search, and filtering
 */
export async function getPracticePatients(options: {
    searchQuery?: string
    page?: number
    limit?: number
    status?: "ACTIVE" | "INACTIVE"
} = {}): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        const {
            searchQuery = "",
            page = 1,
            limit = 10,
            status = "ACTIVE"
        } = options

        const whereCondition: Prisma.PatientWhereInput = {
            practiceId: auth.practice.practiceId,
            status,
            ...(searchQuery && {
                OR: [
                    {
                        firstName: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        } as Prisma.StringFilter<"Patient">
                    },
                    {
                        lastName: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        } as Prisma.StringFilter<"Patient">
                    },
                    {
                        contactEmail: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        } as Prisma.StringFilter<"Patient">
                    },
                    {
                        contactPhone: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        } as Prisma.StringFilter<"Patient">
                    }
                ]
            })
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    contactPhone: true,
                    contactEmail: true,
                    status: true,
                    primaryTherapist: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    },
                    activities: {
                        where: { status: 'ACTIVE' },
                        select: {
                            id: true,
                            status: true,
                            activity: {
                                select: {
                                    name: true,
                                    type: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            progressNotes: true,
                            documents: true
                        }
                    }
                },
                orderBy: [
                    { lastName: 'asc' },
                    { firstName: 'asc' }
                ],
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.patient.count({ where: whereCondition })
        ])

        const totalPages = Math.ceil(total / limit)
        const hasMore = page < totalPages
        const hasPrev = page > 1

        // Transform dates to strings for serialization
        const transformedPatients = patients.map(patient => ({
            ...patient,
            dateOfBirth: patient.dateOfBirth.toISOString(),
            fullName: `${patient.firstName} ${patient.lastName}`
        }))

        return {
            success: true,
            data: transformedPatients,
            // pagination: {
            //     total,
            //     currentPage: page,
            //     totalPages,
            //     hasMore,
            //     hasPrev,
            //     limit
            // }
        }

    } catch (error: any) {
        console.error('Error fetching practice patients:', error)
        return {
            success: false,
            error: "Error fetching patients: " + (error.message || "Unknown error")
        }
    }
}