'use server'

// import {revalidatePath} from "next/cache";
// import {patientSchema} from "@/lib/schema";
// import {prisma} from "@/db";
// import {z} from "zod";

// export async function createPatient(values: z.infer<typeof patientSchema>): Promise<ServerResponse<Patient>> {
//     const validation = await patientSchema.safeParseAsync(values)
//     if (!validation.success) {
//         return {error: validation.error.issues[0].message}
//     }
//
//     try {
//         await prisma.patient.create({
//             data: validation.data
//         })
//         revalidatePath('/patients')
//         return null
//
//     } catch (error) {
//         return {error: 'Failed to create patient' + error}
//     }
// }


// export async function login(values: z.infer<typeof loginSchema>): Promise<ActionResponse<void>> {
//     const validation = loginSchema.safeParse(values);
//     if (!validation.success) {
//         return {error: 'Invalid email or password'};
//     }
//
//     const {email, password} = values;
//
//     try {
//         await signIn('credentials', {
//             email,
//             password,
//             redirectTo: DEFAULT_LOGIN_REDIRECT
//         });
//         return {success: true};
//     } catch (error) {
//         if (error instanceof AuthError) {
//             switch (error.type) {
//                 case "CredentialsSignin":
//                     return {error: 'Invalid email or password'};
//                 default:
//                     return {error: 'Something went wrong. Please try again later!'};
//             }
//         }
//         throw error;
//     }
// }


