// app/api/onboarding/route.ts
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/app/db';

// Validation schema
const onboardingSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    displayName: z.string().min(2),
    password: z.string().min(8),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().max(160).optional(),
    role: z.enum(["ADMIN", "USER"]),
});


export async function POST(request: Request) {
    try {
        // Parse and validate the request body
        const body = await request.json();
        const validatedData = onboardingSchema.parse(body);

        // Get clerk client
        const clerk = await clerkClient();

        // Extract first and last name
        let firstName = validatedData.displayName;
        let lastName = '';

        // if (validatedData.fullName.includes(' ')) {
        //     const nameParts = validatedData.fullName.split(' ');
        //     lastName = nameParts.slice(1).join(' ');
        // }

        // Create a new user in Clerk
        const clerkUser = await clerk.users.createUser({
            emailAddress: [validatedData.email],
            password: "MERDAP@ssword2023!",
            firstName: "firstName",
            lastName: "lastName",
            publicMetadata: {
                onboarded: true,
                role: validatedData.role,
            },
        });

        console.log('Clerk user created:', clerkUser.id);


        return NextResponse.json({
            success: true,
            user: {
                id: clerkUser.id,
                clerkId: clerkUser.id,
                email: validatedData.email,
                fullName: validatedData.fullName,
                 role: validatedData.role,
            }
        });
    } catch (error) {
        console.error('User creation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }

        // Handle Clerk-specific errors
        if (typeof error === 'object' && error !== null && 'clerkError' in error) {
            return NextResponse.json(
                { error: 'Clerk error', details: error },
                { status: 422 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}