import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: "2025-12-15.clover",
}) : null;

export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json(
            { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
            { status: 500 }
        );
    }

    try {
        const { items, userId, discountCode, discountAmount = 0 } = await req.json();

        // Calculate total in cents
        // We handle the discount by adjusting the metadata and ensuring the order total 
        // is tracked correctly. For Stripe UI, we'll subtract the discount from the line items.

        let remainingDiscount = Math.round(discountAmount * 100);

        // Create line items for Stripe
        const lineItems = items.map((item: any, index: number) => {
            let unitAmount = Math.round(item.price * 100);

            // If there's a discount, we'll subtract it from the first item (or across items)
            // This is a simple way to ensure Stripe shows the discounted total.
            if (remainingDiscount > 0 && index === 0) {
                // For simplicity, we just subtract the whole discount from the first item
                // In a real app, you'd distribute it or use Stripe Coupons.
                // We ensure the amount doesn't go below 0.
                const adjustment = Math.min(unitAmount * item.quantity, remainingDiscount);
                unitAmount = Math.max(1, Math.round((unitAmount * item.quantity - adjustment) / item.quantity));
                remainingDiscount -= adjustment;
            }

            return {
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: item.name,
                        description: `${item.size || ''} ${item.beadSize || ''} ${item.color || ''}`.trim(),
                        images: [item.image],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
            metadata: {
                userId: userId || "guest",
                discountCode: discountCode || "",
                discountAmount: discountAmount.toString(),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
