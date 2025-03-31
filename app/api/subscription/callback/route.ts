// app/api/subscription/callback/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const payload = await req.json()

        // Verify PagSeguro webhook signature
        // Update subscription status based on payment status
        // await prisma.subscription.update({
        //     where: {
        //         pagSeguroOrderId: payload.orderId
        //     },
        //     data: {
        //         status: payload.status === "PAID" ? "ACTIVE" : "PAST_DUE",
        //         currentPeriodEnd: new Date(payload.expirationDate)
        //     }
        // })

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        )
    }
}