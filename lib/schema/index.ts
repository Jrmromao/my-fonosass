import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    practiceId: z.string().optional(),
    roleId: z.string()
})

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

export const practiceSchema = z.object({
    name: z.string().min(2),
    planId: z.string()
})




export type RegisterInput = z.infer<typeof registerSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type AssessmentInput = z.infer<typeof assessmentSchema>
export type PracticeInput = z.infer<typeof practiceSchema>