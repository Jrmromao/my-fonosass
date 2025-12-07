// import {NextResponse} from "next/server"
// import {createClerkClient} from "@clerk/backend";
//
// const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
//
//
// export async function POST(req: Request) {
//     try {
//
//        const clerkUser = await clerkClient.users.createUser({
//             emailAddress: ["test@example.com"], firstName: "John", lastName: "Doe", skipPasswordChecks: true, password: "securePassword123"});
//
//
//
//         return NextResponse.json({ clerkUser })
//     } catch (error) {
//         console.error("Create user error:", error)
//         return NextResponse.json(
//             { error: "Failed to create user" },
//             { status: 500 }
//         )
//     }
// }
//
//
//

// // app/api/create-users/route.ts
// import { NextResponse } from "next/server";

// Generate secure password for test users
const generateSecurePassword = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
};

//
// // For v6.5.0, we need to use the Clerk API client directly
// import { createClerkClient } from "@clerk/clerk-sdk-node";
//
// export async function POST(req: Request) {
//     try {
//
//         // Initialize Clerk client
//         if (!process.env.CLERK_SECRET_KEY) {
//             throw new Error("CLERK_SECRET_KEY is not defined in environment variables");
//         }
//
//         // Create Clerk client with the secret key
//         const clerk = createClerkClient({
//             secretKey: process.env.CLERK_SECRET_KEY
//         });
//
//         // Generate a unique email address to avoid conflicts
//         const timestamp = new Date().getTime();
//         const email = `test+${timestamp}@example.com`;
//
//         try {
//             // Create a user with the Clerk client
//             const user = await clerk.users.createUser({
//                 emailAddress: [email],
//                 firstName: "Test",
//                 lastName: "User",
//                 password: "SuperSecurePassword123!"
//             });
//
//
//             return NextResponse.json({
//                 success: true,
//                 message: "User created successfully",
//                 user: {
//                     id: user.id,
//                     emailAddress: email,
//                     firstName: user.firstName,
//                     lastName: user.lastName,
//                     createdAt: user.createdAt
//                 }
//             });
//         } catch (clerkError: any) {
//             console.error("Clerk error:", clerkError);
//
//             return NextResponse.json({
//                 success: false,
//                 error: clerkError.errors?.[0]?.message || clerkError.message || "Clerk API error",
//                 code: clerkError.errors?.[0]?.code,
//                 status: clerkError.status
//             }, { status: 500 });
//         }
//     } catch (error: any) {
//         console.error("General error:", error);
//
//         return NextResponse.json({
//             success: false,
//             error: error.message || "An unexpected error occurred",
//             stack: error.stack
//         }, { status: 500 });
//     }
// }

// app/api/create-users/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make sure the CLERK_SECRET_KEY is set
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error(
        'CLERK_SECRET_KEY is not defined in environment variables'
      );
    }

    // Try to get data from request body first
    let userData;
    try {
      userData = await req.json();
    } catch (e) {
      // Generate a unique email for testing
      const timestamp = new Date().getTime();
      userData = {
        email: `test-${Date.now()}@example.com`,
        username: `test${timestamp}`,
        password: generateSecurePassword(),
        firstName: 'Test',
        lastName: 'User',
      };
    }

    // Try with explicit allowlisting of the domain
    const payload = JSON.stringify({
      email_addresses: [
        {
          email: 'test@example.com',
          primary: true,
          verification: {
            strategy: 'admin_verification', // This tells Clerk you're verifying this email as an admin
            status: 'verified', // Pre-verify the email
          },
        },
      ],

      username: 'testuser',
      password: 'SecureP@ssword2023!',
      first_name: 'John',
      last_name: 'Doe',
      skip_password_checks: true,
      skip_password_requirement: false, // This user needs a password
    });

    // Create the Clerk payload based on version 6.5.0 expected format
    // const payload = JSON.stringify({
    //     username: user   Data.username,
    //     email_addresses: [
    //         {
    //             email: userData.email,
    //             primary: true,
    //             verified: true
    //         }
    //     ],
    //     password: userData.password,
    //     first_name: userData.firstName,
    //     last_name: userData.lastName,
    //     skip_password_checks: true
    // });

    // Make a direct fetch request (no SDK dependency)
    const response = await fetch('https://api.clerk.dev/v1/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    // Get the raw response for debugging
    const responseText = await response.text();

    // Try to parse the response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON response from Clerk API',
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    // Handle errors
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0]?.message || 'Unknown Clerk API error',
          code: result.errors?.[0]?.code,
          status: response.status,
          fullResponse: result,
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.id,
        email: userData.email,
        firstName: result.first_name,
        lastName: result.last_name,
        createdAt: result.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
        stackTrace: error.stack,
      },
      { status: 500 }
    );
  }
}
