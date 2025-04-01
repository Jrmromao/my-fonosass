import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    practiceId: z.string().optional(),
    roleId: z.string()
})


 const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "THERAPIST", "STAFF"]).default("THERAPIST"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    practiceId: z.string().uuid("Invalid practice ID")
});



export const userSchema = z.object({
    clerkUserId: z.string().optional(),
    email: z.string().email(),
    username: z.string(),
    fullName: z.string(),
    role: z.enum(['USER', 'ADMIN']).optional().default('USER')
});



export const practiceSchema = z.object({
    name: z.string().min(3, "Practice name must be at least 3 characters"),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    website: z.string().url().optional().nullable(),
    logo: z.string().optional().nullable(),
    primaryColor: z.string().optional().nullable(),
    secondaryColor: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    active: z.boolean().default(true)
});


// export const patientSchema = z.object({
//     name: z.string().min(2, {
//         message: "Nome deve ter pelo menos 2 caracteres.",
//     }).optional(),
//     dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
//         message: "Data de nascimento deve estar no formato YYYY-MM-DD.",
//     }).optional(),
//     practiceId: z.string().optional(),
//     email: z.string().email({
//         message: "Tutor Email inválido.",
//     }).optional(),
//     address: z.string().optional(),
//     //     .min(5, {
//     //     message: "Endereço deve ter pelo menos 5 caracteres.",
//     // }),
//     phone: z.string()
//         .optional(),
//     //     .min(8, {
//     //     message: "Telefone deve ter pelo menos 8 dígitos.",
//     // }),
//     healthInsurance: z.string().optional(),
//     notes: z.string().optional(),
// })


const phoneRegex = /^[0-9]{10,15}$/

export const patientSchema = z.object({
    firstName: z.string({
        required_error: "Nome é obrigatório",
        invalid_type_error: "Nome deve ser texto",
    })
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(50, "Nome não pode exceder 50 caracteres")
        .trim(),

    lastName: z.string({
        required_error: "Sobrenome é obrigatório",
        invalid_type_error: "Sobrenome deve ser texto",
    })
        .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
        .max(50, "Sobrenome não pode exceder 50 caracteres")
        .trim(),

    dateOfBirth: z.string({
        required_error: "Data de nascimento é obrigatória",
    })
        .refine((date) => {
            const parsedDate = new Date(date);
            const today = new Date();
            return parsedDate < today;
        }, "Data de nascimento não pode ser no futuro")
        .refine((date) => !isNaN(new Date(date).getTime()), "Data de nascimento inválida"),

    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
        invalid_type_error: "Gênero inválido",
    }).optional(),

    contactEmail: z.string({
        required_error: "Email é obrigatório",
        invalid_type_error: "Email deve ser texto",
    })
        .email("Email inválido")
        .toLowerCase()
        .trim(),

    contactPhone: z.string({
        required_error: "Telefone é obrigatório",
        invalid_type_error: "Telefone deve ser texto",
    })
        .regex(phoneRegex, "Telefone deve conter apenas números e ter entre 10 e 15 dígitos")
        .trim(),

    address: z.string({
        required_error: "Endereço é obrigatório",
        invalid_type_error: "Endereço deve ser texto",
    })
        .min(5, "Endereço deve ter pelo menos 5 caracteres")
        .max(200, "Endereço não pode exceder 200 caracteres")
        .trim(),

    medicalHistory: z.string()
        .max(2000, "Histórico médico não pode exceder 2000 caracteres")
        .optional()
        .nullable()
        .transform(val => val || undefined),
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

// export const practiceSchema = z.object({
//     name: z.string().min(2),
//     planId: z.string()
// })




export type RegisterInput = z.infer<typeof registerSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type AssessmentInput = z.infer<typeof assessmentSchema>
export type PracticeInput = z.infer<typeof practiceSchema>
export type UserInput = z.infer<typeof createUserSchema>


// export const userSchema = z.object({
//     firstName: z.string().min(1, "First name is required"),
//     lastName: z.string().min(1, "Last name is required"),
//     email: z
//         .string()
//         .min(1, "Email is required")
//         .email("Invalid email format")
//         .refine(async (email) => {
//             try {
//                 const response = await fetch(`${baseUrl}/api/validate/email`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ email }),
//                     credentials: "same-origin",
//                     cache: "no-store",
//                 });
//                 if (!response.ok) return false;
//                 const data = await response.json();
//                 return !data.exists;
//             } catch (error) {
//                 console.error("Email validation error:", error);
//                 return false;
//             }
//         }, "Email already exists"),
//     title: z.string().min(1, "Title is required"),
//     employeeId: z
//         .string()
//         .min(1, "Employee ID is required")
//         .refine(async (employeeId) => {
//             try {
//                 const response = await fetch(`${baseUrl}/api/validate/employeeId`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ employeeId }),
//                     credentials: "same-origin",
//                     cache: "no-store",
//                 });
//                 if (!response.ok) return false;
//                 const data = await response.json();
//                 return !data.exists;
//             } catch (error) {
//                 console.error("EmployeeId validation error:", error);
//                 return false;
//             }
//         }, "Employee ID already exists"),
//     roleId: z.string().min(1, "Role is required"),
// });
