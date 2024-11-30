// app/api/forms/[formId]/responses/route.ts
import {NextResponse} from "next/server"


export async function GET(request: Request) {
    try {
        console.log(request)
        return NextResponse.json({})
    } catch (error) {
        console.error("[FORM_RESPONSES_GET]", error)
        return new NextResponse("Internal error", {status: 500})
    }
}