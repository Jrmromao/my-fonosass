
"use server"

import { z } from "zod"

const patientSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    address: z.string().min(5),
    healthInsurance: z.string().optional(),
    notes: z.string().optional(),
})

export async function createPatient(data: z.infer<typeof patientSchema>) {
    const validatedData = patientSchema.parse(data)

    // Here you would typically save the data to your database
    // For this example, we'll just log the data and return a success message
    console.log("New patient data:", validatedData)

    // Simulate a delay to mimic database operation
    await new Promise(resolve => setTimeout(resolve, 1000))

    return { success: true, message: "Patient created successfully" }
}

