// app/api/onboarding/route.ts
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/app/db';
import { sanitizeInput, sanitizeHtml } from '@/lib/security/validation';

// Generate secure password for test users
const generateSecurePassword = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
};

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
        
        // Sanitize input data
        const sanitizedBody = {
            email: sanitizeInput(body.email || ''),
            fullName: sanitizeInput(body.fullName || ''),
            displayName: sanitizeInput(body.displayName || ''),
            password: body.password || '', // Don't sanitize password as it needs special chars
            jobTitle: sanitizeInput(body.jobTitle || ''),
            department: sanitizeInput(body.department || ''),
            bio: sanitizeHtml(body.bio || ''),
            role: body.role || 'USER'
        };
        
        const validatedData = onboardingSchema.parse(sanitizedBody);

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
            password: validatedData.password, // Use user-provided password
            firstName: validatedData.displayName,
            lastName: lastName,
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