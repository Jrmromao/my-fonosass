import {NextResponse} from "next/server";

export async function POST(request: Request) {
    try {
        // Ensure request has content
        if (!request.body) {
            return NextResponse.json(
                { error: "Request body is required" },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error("[FORMS_POST]", error)
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}