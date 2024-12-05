import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { tier } = await req.json()

        // Initialize PagSeguro checkout session
        // const checkout = await createPagSeguroCheckout({
        //     itemId: tier,
        //     returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/callback`,
        //     // Add other required PagSeguro parameters
        // })

        return NextResponse.json({ checkoutUrl:' checkout.url' })
    } catch (error) {
        console.error("PagSeguro checkout error:", error)
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        )
    }
}