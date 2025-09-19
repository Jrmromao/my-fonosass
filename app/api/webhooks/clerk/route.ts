import {NextResponse} from 'next/server';
import {Webhook} from 'svix';
import {WebhookEvent, clerkClient} from '@clerk/nextjs/server';
import {Prisma} from '@prisma/client';
import {prisma} from "@/app/db";
import S3Service from "@/services/S3Service";

// Constants for security configurations
const MAX_PAYLOAD_SIZE = 1048576; // 1MB in bytes
const MAX_EXECUTION_TIME = 30000; // 30 seconds in milliseconds

// Rate limiting setup (simple in-memory implementation)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100;
const requestTimestamps: number[] = [];

// Email validation regex (basic validation - consider using a library in production)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


// Helper function to validate user ID format
function isValidUserId(userId: string): boolean {
    // Clerk user IDs are typically prefixed with 'user_' followed by alphanumeric characters
    return /^user_[a-zA-Z0-9]{10,}$/.test(userId);
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

// Helper function to sanitize string inputs
function sanitizeString(input: string | null | undefined): string {
    if (!input) return '';
    // Basic sanitization - remove control characters and limit length
    return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().substring(0, 255);
}

const clerk = await  clerkClient();



// Helper function to create or update a user with proper error handling and input validation
async function createOrUpdateUser(clerkUserId: string, email: string, firstName: string | null, lastName: string | null): Promise<boolean> {
    // Validate inputs
    if (!isValidUserId(clerkUserId)) {
        console.error(`Invalid Clerk user ID format: ${clerkUserId}`);
        return false;
    }

    if (!isValidEmail(email)) {
        console.error(`Invalid email format: ${email}`);
        return false;
    }

    // Sanitize name inputs
    const sanitizedFirstName = sanitizeString(firstName);
    const sanitizedLastName = sanitizeString(lastName);

    // Construct full name safely
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim() || 'User';

    try {
        // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            await tx.user.upsert({
                where: { clerkUserId },
                update: {
                    email,
                    fullName,
                    updatedAt: new Date(),
                },
                create: {
                    clerkUserId,
                    email,
                    fullName},
            });
        }, {
            timeout: 5000, // 5 second timeout for the transaction
        });

        // Log success without exposing full user details
        console.log(`User operation successful for clerk ID: ${clerkUserId.substring(0, 8)}...`);
        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle unique constraint violations (error.code === 'P2002')
            console.error(`Database error processing user: ${error.code}`);
        } else {
            console.error('Error in user operation:', typeof error === 'object' ? (error as Error).message : 'Unknown error');
        }
        return false;
    }
}
export async function POST(req: Request) {
    // Implement basic rate limiting
    const now = Date.now();
    requestTimestamps.push(now);
    // Remove timestamps outside the current window
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
        requestTimestamps.shift();
    }

    // Check if rate limit exceeded
    if (requestTimestamps.length > MAX_REQUESTS_PER_WINDOW) {
        console.warn('Rate limit exceeded for Clerk webhook');
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        );
    }

    // Set a timeout to prevent long-running operations
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), MAX_EXECUTION_TIME)
    );

    try {
        // Process the webhook with a timeout
        const responsePromise = processWebhook(req);
        return await Promise.race([responsePromise, timeoutPromise]) as NextResponse;
    } catch (error) {
        console.error('Error in webhook handler:', typeof error === 'object' ? (error as Error).message : 'Unknown error');
        // Return generic error for security
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function processWebhook(req: Request): Promise<NextResponse> {
    try {
        // Verify webhook signatures securely
        const svix_id = req.headers.get('svix-id');
        const svix_timestamp = req.headers.get('svix-timestamp');
        const svix_signature = req.headers.get('svix-signature');

        // If there are no svix headers, return 400
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing svix headers');
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Check payload size before parsing to prevent DoS attacks
        const contentLengthHeader = req.headers.get('content-length');
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        if (contentLength > MAX_PAYLOAD_SIZE) {
            console.error(`Payload too large: ${contentLength} bytes`);
            return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
        }

        // Get the body
        const payload = await req.json();
        const body = JSON.stringify(payload);

        // Create a new Svix instance with your webhook secret
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('Missing webhook secret configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
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
            console.error('Webhook verification failed');
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            );
        }

        // Handle the webhook event
        const eventType = evt.type;
        console.log(`Processing Clerk event: ${eventType}`);

        // Process based on event type
        switch (eventType) {
            case 'session.created': {
                // Extract user data from the session
                const { user_id } = evt.data;
                if (!user_id || !isValidUserId(user_id)) {
                    console.error('Invalid user ID in session data');
                    return NextResponse.json(
                        { error: 'Invalid request data' },
                        { status: 400 }
                    );
                }

                // Check if user exists in our database
                const existingUser = await prisma.user.findUnique({
                    where: { clerkUserId: user_id },
                    select: { id: true } // Only select the ID for security
                });

                // If user doesn't exist, we need to create them (social login case)
                if (!existingUser) {
                    console.log(`User not found in database. Fetching from Clerk...`);

                    try {
                        if (!clerk) {
                            throw new Error('Clerk client not initialized');
                        }

                        // Fetch the user details from Clerk
                        const clerkUser = await clerk.users.getUser(user_id);

                        if (!clerkUser) {
                            console.error(`Failed to fetch user data from Clerk`);
                            return NextResponse.json(
                                { error: 'Authentication service error' },
                                { status: 500 }
                            );
                        }

                        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

                        if (!primaryEmail || !isValidEmail(primaryEmail)) {
                            console.error('Invalid or missing email address');
                            return NextResponse.json(
                                { error: 'Invalid user data' },
                                { status: 400 }
                            );
                        }

                        console.log(`Creating user record from session event`);

                        const success = await createOrUpdateUser(
                            user_id,
                            primaryEmail,
                            clerkUser.firstName,
                            clerkUser.lastName
                        );

                        if (!success) {
                            return NextResponse.json(
                                { error: 'User creation failed' },
                                { status: 500 }
                            );
                        }
                    } catch (error) {
                        console.error('Error in social login user creation');
                        return NextResponse.json(
                            { error: 'Authentication processing error' },
                            { status: 500 }
                        );
                    }
                }
                break;
            }

            case 'user.created': {
                const { id, email_addresses, first_name, last_name } = evt.data;

                if (!id || !isValidUserId(id)) {
                    console.error('Invalid user ID in webhook data');
                    return NextResponse.json(
                        { error: 'Invalid request data' },
                        { status: 400 }
                    );
                }
                const primaryEmail = email_addresses?.[0]?.email_address;

                if (!primaryEmail || !isValidEmail(primaryEmail)) {
                    console.error('Invalid or missing email address');
                    return NextResponse.json(
                        { error: 'Invalid user data' },
                        { status: 400 }
                    );
                }

                await createOrUpdateUser(id, primaryEmail, first_name, last_name);
                
                // Send welcome email
                try {
                    const { EmailService } = await import('@/services/emailService')
                    await EmailService.sendWelcomeEmail(primaryEmail, `${first_name || ''} ${last_name || ''}`.trim() || 'Usuário')
                } catch (emailError) {
                    console.error('Error sending welcome email:', emailError)
                    // Don't fail the webhook if email fails
                }
                break;
            }

            case 'user.updated': {
                const { id, email_addresses, first_name, last_name } = evt.data;

                if (!id || !isValidUserId(id)) {
                    console.error('Invalid user ID in webhook data');
                    return NextResponse.json(
                        { error: 'Invalid request data' },
                        { status: 400 }
                    );
                }

                const primaryEmail = email_addresses?.[0]?.email_address;

                if (!primaryEmail || !isValidEmail(primaryEmail)) {
                    console.error('Invalid or missing email address');
                    return NextResponse.json(
                        { error: 'Invalid user data' },
                        { status: 400 }
                    );
                }

                await createOrUpdateUser(id, primaryEmail, first_name, last_name);
                break;
            }

            case 'user.deleted': {
                const { id } = evt.data;

                if (!id || !isValidUserId(id)) {
                    console.error('Invalid user ID in webhook data');
                    return NextResponse.json(
                        { error: 'Invalid request data' },
                        { status: 400 }
                    );
                }

                try {
                    // Use transaction for safety
                    await prisma.$transaction(async (tx) => {
                        await tx.user.deleteMany({
                            where: { clerkUserId: id },
                        });
                    });

                    console.log(`User deletion processed`);
                } catch (error) {
                    console.error(`Error in user deletion operation`);
                    return NextResponse.json(
                        { error: 'User deletion failed' },
                        { status: 500 }
                    );
                }

                break;
            }

            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Webhook processing error');
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}

// Export config for API size limits
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};