// app/api/webhooks/clerk/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { UserRole } from '@prisma/client';
import { prisma } from "@/app/db";

export async function POST(req: Request) {
    try {


        const svix_id = req.headers.get('svix-id');
        const svix_timestamp = req.headers.get('svix-timestamp');
        const svix_signature = req.headers.get('svix-signature');

        // If there are no svix headers, return 400
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing svix headers');
            return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
        }

        // Get the body
        const payload = await req.json();
        const body = JSON.stringify(payload);

        // Create a new Svix instance with your webhook secret
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        const wh = new Webhook(webhookSecret);

        let evt: WebhookEvent;

        // Verify the webhook
        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            }) as WebhookEvent;
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return NextResponse.json(
                { error: 'Error verifying webhook' },
                { status: 400 }
            );
        }

        // Handle the webhook event
        const eventType = evt.type;
        // Process based on event type
        switch (eventType) {
            case 'user.created': {
                const { id, email_addresses, first_name, last_name, username} = evt.data;
                if (!id) {
                    console.error('User ID is missing in the webhook data');
                    return NextResponse.json(
                        { error: 'Invalid webhook data' },
                        { status: 400 }
                    );
                }

                const primaryEmail = email_addresses?.[0]?.email_address;

                if (!primaryEmail) {
                    console.error('User has no email address');
                    return NextResponse.json(
                        { error: 'User has no email address' },
                        { status: 400 }
                    );
                }

                // Check if user already exists (to prevent duplicates)
                const existingUser = await prisma.user.findUnique({
                    where: { clerkUserId: id },
                });

                if (existingUser) {
                    console.log(`User with clerk ID ${id} already exists, skipping creation`);
                    return NextResponse.json(
                        { message: 'User already exists' },
                        { status: 200 }
                    );
                }

                // Create new user in the database
                await prisma.user.create({
                    data: {
                        clerkUserId: id,
                        email: primaryEmail,
                        fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
                        role: UserRole.USER,
                    },
                });

                console.log(`User created with clerk ID: ${id}`);
                break;
            }

            case 'user.updated': {
                const { id, email_addresses, first_name, last_name } = evt.data;

                if (!id) {
                    console.error('User ID is missing in the webhook data');
                    return NextResponse.json(
                        { error: 'Invalid webhook data' },
                        { status: 400 }
                    );
                }

                const primaryEmail = email_addresses?.[0]?.email_address;

                if (!primaryEmail) {
                    console.error('User has no email address');
                    return NextResponse.json(
                        { error: 'User has no email address' },
                        { status: 400 }
                    );
                }

                // Find user in the database
                const user = await prisma.user.findUnique({
                    where: { clerkUserId: id },
                });

                // If user exists, update their information
                if (user) {
                    await prisma.user.update({
                        where: { clerkUserId: id },
                        data: {
                            email: primaryEmail,
                            fullName: `${first_name || ''} ${last_name || ''}`.trim() || user.fullName,
                            updatedAt: new Date(),
                        },
                    });
                    console.log(`User updated with clerk ID: ${id}`);
                } else {
                    // Create user if they don't exist (fallback for missed user.created events)
                    await prisma.user.create({
                        data: {
                            clerkUserId: id,
                            email: primaryEmail,
                            fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
                            role: UserRole.USER,
                        },
                    });
                    console.log(`User created (from update event) with clerk ID: ${id}`);
                }

                break;
            }

            case 'user.deleted': {
                const { id } = evt.data;

                if (!id) {
                    console.error('User ID is missing in the webhook data');
                    return NextResponse.json(
                        { error: 'Invalid webhook data' },
                        { status: 400 }
                    );
                }

                // Check if user exists
                const user = await prisma.user.findUnique({
                    where: { clerkUserId: id },
                });

                if (!user) {
                    console.log(`User with clerk ID ${id} not found, skipping deletion`);
                    return NextResponse.json(
                        { message: 'User not found' },
                        { status: 200 }
                    );
                }

                // Delete user from the database
                await prisma.user.delete({
                    where: { clerkUserId: id },
                });

                console.log(`User deleted with clerk ID: ${id}`);
                break;
            }

            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
        }

        return NextResponse.json(
            { message: 'Webhook processed successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        );
    }
}

// Export config for larger payload size (especially important for organizations with many members)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};