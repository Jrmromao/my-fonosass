"use server"

import {prisma} from "@/db"
import {currentUser} from "@clerk/nextjs/server"
import {revalidatePath} from "next/cache"
import {z} from "zod"
import {patientSchema} from "@/lib/schema";
import {PatientListItem} from "@/types/types";
import {Prisma} from "@prisma/client";


type GetPatientsResponse = {
    success: true;
    data: PatientListItem[];
} | {
    success: false;
    error: string;
}


export async function getPatients(): Promise<GetPatientsResponse> {
    try {
        const user = await currentUser()
        if (!user) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        const userPractice = await prisma.practiceMember.findFirst({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            select: {
                practiceId: true
            }
        })

        const patients = await prisma.patient.findMany({
            where: {
                practiceId: userPractice?.practiceId
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
        // const transformedPatients = patients.map(patient => ({
        //     id: patient.id,
        //     firstName: patient.firstName,
        //     lastName: patient.lastName,
        //     fullName: `${patient.firstName} ${patient.lastName}`,
        //     status: patient.status
        // }))

        return { success: true, data: [] }
    } catch (error: any) {
        console.error('Error fetching patients:', error)
        return { success: false, error: error.message }
    }
}

export async function getPatientById(patientId: string) {
    try {
        const user = await currentUser()
        if (!user) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        const userPractice = await prisma.practiceMember.findFirst({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            select: {
                practiceId: true
            }
        })

        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId,
                practiceId: userPractice?.practiceId
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
                        // content: true,
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
        // const transformedPatient = {
        //     ...patient,
        //     dateOfBirth: patient.dateOfBirth.toISOString(),
        //     fullName: `${patient.firstName} ${patient.lastName}`,
        //     progressNotes: patient.progressNotes.map(note => ({
        //         ...note,
        //         createdAt: note.createdAt.toISOString()
        //     }))
        // }

        return {
            success: true,
            data: []
        }

    } catch (error: any) {
        console.error('Error fetching patient:', error)
        return {
            success: false,
            error: error.message || "Failed to fetch patient"
        }
    }
}

export async function createPatient(data: z.infer<typeof patientSchema>) {
    try {
        // Validate input data first
        const validation = patientSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.flatten().fieldErrors
            }
        }

        // Get current user
        const user = await currentUser()
        if (!user || !user.id) {
            return {
                success: false,
                error: "Unauthorized - No user found"
            }
        }

        // Get therapist's practice using Clerk user ID
        const userPractice = await prisma.practiceMember.findFirst({
            where: {
                userId:'d097b5c8-2e3f-43c5-a20b-9cd64003a702',
                status: 'ACTIVE'
            },
            select: {
                practiceId: true
            }
        })

        if (!userPractice) {
            return {
                success: false,
                error: "No active practice found for user"
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
                primaryTherapistId: 'd097b5c8-2e3f-43c5-a20b-9cd64003a702',
                practiceId: userPractice.practiceId // This should now be safe to use
            }
        })

        revalidatePath('/dashboard/patient')

        return {
            success: true,
            data: {}
        }

    } catch (error: any) {
        console.error('Error creating patient:', error)

        // More specific error handling
        if (error.code === 'P2002') {
            return {
                success: false,
                error: "Paciente já existe com este email"
            }
        }

        if (error.code === 'P2003') {
            return {
                success: false,
                error: "Erro de referência: terapeuta ou clínica não encontrada"
            }
        }

        return {
            success: false,
            error: "Erro ao criar paciente: " + (error.message || "Erro desconhecido")
        }
    }
}


export async function getPracticePatients({
                                              searchQuery = "",
                                              page = 1,
                                              limit = 10,
                                              status = "ACTIVE"
                                          }: {
    searchQuery?: string
    page?: number
    limit?: number
    status?: "ACTIVE" | "INACTIVE"
} = {}) {
    try {
        const user = await currentUser()
        if (!user || !user.id) {
            return {
                success: false,
                error: "Unauthorized - No user found"
            }
        }

        const practiceMember = await prisma.practiceMember.findFirst({
            where: {
                userId:'d097b5c8-2e3f-43c5-a20b-9cd64003a702',
                status: 'ACTIVE'
            },
            select: {
                practiceId: true
            }
        })

        if (!practiceMember) {
            return {
                success: false,
                error: "No active practice found for user"
            }
        }

        // const whereCondition: Prisma.PatientWhereInput = {
        //     practiceId: practiceMember.practiceId,
        //     status,
        //     ...(searchQuery && {
        //         OR: [
        //             {
        //                 firstName: {
        //                     contains: searchQuery,
        //                     mode: 'insensitive'
        //                 } as Prisma.StringFilter<"Patient">
        //             },
        //             {
        //                 lastName: {
        //                     contains: searchQuery,
        //                     mode: 'insensitive'
        //                 } as Prisma.StringFilter<"Patient">
        //             },
        //             {
        //                 contactEmail: {
        //                     contains: searchQuery,
        //                     mode: 'insensitive'
        //                 } as Prisma.StringFilter<"Patient">
        //             },
        //             {
        //                 contactPhone: {
        //                     contains: searchQuery,
        //                     mode: 'insensitive'
        //                 } as Prisma.StringFilter<"Patient">
        //             }
        //         ]
        //     })
        // }

        // const [patients, total] = await Promise.all([
        //     prisma.patient.findMany({
        //         // where: whereCondition,
        //         select: {
        //             id: true,
        //             firstName: true,
        //             lastName: true,
        //             dateOfBirth: true,
        //             contactPhone: true,
        //             contactEmail: true,
        //             status: true,
        //             primaryTherapist: {
        //                 select: {
        //                     fullName: true,
        //                     email: true
        //                 }
        //             },
        //             activities: {
        //                 where: { status: 'ACTIVE' },
        //                 select: {
        //                     id: true,
        //                     status: true,
        //                     activity: {
        //                         select: {
        //                             name: true,
        //                             type: true
        //                         }
        //                     }
        //                 }
        //             },
        //             _count: {
        //                 select: {
        //                     progressNotes: true,
        //                     documents: true
        //                 }
        //             }
        //         },
        //         orderBy: [
        //             { lastName: 'asc' },
        //             { firstName: 'asc' }
        //         ],
        //         skip: (page - 1) * limit,
        //         take: limit
        //     }),
        //     // prisma.patient.count({ where: whereCondition })
        // ])
        //
        // const totalPages = Math.ceil(total / limit)
        // const hasMore = page < totalPages
        // const hasPrev = page > 1

        return {
            // success: true,
            // data: patients,
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



// export async function getPatients(): Promise<GetPatientsResponse> {
//     try {
//         const user = await currentUser()
//         if (!user || !user.id) {
//             return {
//                 success: false,
//                 error: "Unauthorized"
//             }
//         }
//
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 userId: 'd097b5c8-2e3f-43c5-a20b-9cd64003a702',
//                 status: 'ACTIVE'
//             },
//             select: {
//                 practiceId: true
//             }
//         })
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "No active practice found"
//             }
//         }
//
//         const patients = await prisma.patient.findMany({
//             where: {
//                 practiceId: practiceMember.practiceId
//             },
//             select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 status: true
//             },
//             orderBy: [
//                 { lastName: 'asc' },
//                 { firstName: 'asc' }
//             ]
//         })
//
//         // Transform the data to match PatientListItem type
//         const patientList: PatientListItem[] = patients.map(patient => ({
//             id: patient.id,
//             firstName: patient.firstName,
//             lastName: patient.lastName,
//             status: patient.status,
//             fullName: `${patient.firstName} ${patient.lastName}`
//         }))
//
//         console.log(patientList)
//
//         return {
//             success: true,
//             data: patientList
//         }
//
//     } catch (error: any) {
//         console.error('Error:', error)
//         return {
//             success: false,
//             error: error.message || "Failed to fetch patients"
//         }
//     }
// }

// export async function getPatients() {
//     try {
//         const user = await currentUser()
//         if (!user || !user.id) {
//             return {
//                 success: false,
//                 error: "Unauthorized"
//             }
//         }
//
//         // Get user's practice
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 userId:'d097b5c8-2e3f-43c5-a20b-9cd64003a702',
//                 status: 'ACTIVE'
//             },
//             select: {
//                 practiceId: true
//             }
//         })
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "No active practice found"
//             }
//         }
//
//         const patients = await prisma.patient.findMany({
//             where: {
//                 practiceId: practiceMember.practiceId
//             },
//             select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 status: true
//             },
//             orderBy: [
//                 { lastName: 'asc' },
//                 { firstName: 'asc' }
//             ]
//         })
//
//         return {
//             success: true,
//             data: patients
//         }
//
//     } catch (error: any) {
//         console.error('Error:', error)
//         return {
//             success: false,
//             error: error.message || "Failed to fetch patients"
//         }
//     }
// }

// export async function createPatient(data: z.infer<typeof patientSchema>) {
//     try {
//         // Validate input data
//         const validation = patientSchema.safeParse(data)
//         const user = await currentUser()
//
//         console.log(data)
//
//
//         if (!validation.success) {
//             return {
//                 success: false,
//                 error: validation.error.flatten().fieldErrors
//             }
//         }
//
//
//         if (!user) {
//             return {
//                 success: false,
//                 error: "Unauthorized"
//             }
//         }
//
//         // Get therapist's practice
//         const userPractice = await prisma.practiceMember.findFirst({
//             where: {
//                 userId:'d097b5c8-2e3f-43c5-a20b-9cd64003a702',
//                 status: 'ACTIVE'
//             },
//             select: {
//                 practiceId: true
//             }
//         })
//
//         console.log(userPractice)
//
//
//         const patient = await prisma.patient.create({
//             data: {
//                 firstName: validation.data.firstName,
//                 lastName: validation.data.lastName,
//                 dateOfBirth: new Date(validation.data.dateOfBirth),
//                 gender: validation.data.gender,
//                 contactEmail: validation.data.contactEmail,
//                 contactPhone: validation.data.contactPhone,
//                 address: validation.data.address,
//                 medicalHistory: validation.data.medicalHistory,
//                 status: 'ACTIVE',
//                 primaryTherapistId: user.id,
//                 practiceId: userPractice?.practiceId
//             }
//         })
//
//         revalidatePath('/dashboard/patient')
//
//         return {
//             success: true,
//             data: patient
//         }
//
//     } catch (error: any) {
//         console.error('Error creating patient:', error)
//
//         return {
//             success: false,
//             error: error.message || "Erro ao criar paciente"
//         }
//     }
// }

//
// export async function getPatients({
//                                       practiceId,
//                                       therapistId,
//                                       searchQuery,
//                                       status = 'ACTIVE',
//                                       page = 1,
//                                       limit = 10
//                                   }: {
//     practiceId?: string
//     therapistId?: string
//     searchQuery?: string
//     status?: 'ACTIVE' | 'INACTIVE'
//     page?: number
//     limit?: number
// }) {
//     try {
//         const user = await currentUser()
//
//         if (!user) {
//             return {
//                 success: false,
//                 error: "Unauthorized"
//             }
//         }
//
//         const where = {
//             status,
//             ...(practiceId && { practiceId }),
//             ...(therapistId && { primaryTherapistId: therapistId }),
//             ...(searchQuery && {
//                 OR: [
//                     { firstName: { contains: searchQuery, mode: 'insensitive' } },
//                     { lastName: { contains: searchQuery, mode: 'insensitive' } },
//                     { contactEmail: { contains: searchQuery, mode: 'insensitive' } },
//                 ],
//             }),
//         }
//
//         const [patients, total] = await Promise.all([
//             prisma.patient.findMany({
//                 where,
//                 include: {
//                     primaryTherapist: {
//                         select: {
//                             id: true,
//                             fullName: true,
//                         },
//                     },
//                     activities: {
//                         where: { status: 'ACTIVE' },
//                         include: {
//                             activity: true,
//                         },
//                     },
//                 },
//                 orderBy: [
//                     { lastName: 'asc' },
//                     { firstName: 'asc' }
//                 ],
//                 skip: (page - 1) * limit,
//                 take: limit,
//             }),
//             prisma.patient.count({ where })
//         ])
//
//         return {
//             success: true,
//             data: patients,
//             pagination: {
//                 total,
//                 pages: Math.ceil(total / limit),
//                 page,
//                 limit,
//             }
//         }
//
//     } catch (error: any) {
//         console.error('Error fetching patients:', error)
//
//         return {
//             success: false,
//             error: error.message || "Erro ao buscar pacientes"
//         }
//     }
// }

// export async function getPatient(patientId: string) {
//     try {
//         const user = await currentUser()
//
//         if (!user) {
//             return {
//                 success: false,
//                 error: "Unauthorized"
//             }
//         }
//
//         const patient = await prisma.patient.findUnique({
//             where: {id: patientId},
//             include: {
//                 primaryTherapist: {
//                     select: {
//                         id: true,
//                         fullName: true,
//                         email: true,
//                     },
//                 },
//                 practice: true,
//                 progressNotes: {
//                     orderBy: {sessionDate: 'desc'},
//                     take: 5,
//                 },
//                 activities: {
//                     include: {
//                         activity: true,
//                         progress: {
//                             orderBy: {date: 'desc'},
//                             take: 1,
//                         },
//                     },
//                     orderBy: {startDate: 'desc'},
//                 },
//                 documents: {
//                     where: {
//                         OR: [
//                             {visibility: 'PATIENT_VISIBLE'},
//                             {visibility: 'PRACTICE_WIDE'}
//                         ]
//                     },
//                     orderBy: {createdAt: 'desc'},
//                 },
//             },
//         })
//
//         if (!patient) {
//             return {
//                 success: false,
//                 error: "Paciente não encontrado"
//             }
//         }
//
//         return {
//             success: true,
//             data: patient
//         }
//
//     } catch (error: any) {
//         console.error('Error fetching patient:', error)
//
//         return {
//             success: false,
//             error: error.message || "Erro ao buscar paciente"
//         }
//     }
// }