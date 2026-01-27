import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder } from "@/lib/db";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature")!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed:`, err.message);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`Processing completed session: ${session.id}`);

            // Retrieve line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

            // Create order in Firestore
            const orderData = {
                userId: session.metadata?.userId || "guest",
                stripeSessionId: session.id,
                discountCode: session.metadata?.discountCode || null,
                discountAmount: session.metadata?.discountAmount ? parseFloat(session.metadata.discountAmount) : 0,
                items: lineItems.data.map((item) => ({
                    cartId: item.id,
                    productId: item.id,
                    name: item.description || "",
                    price: (item.amount_total || 0) / 100,
                    image: "",
                    quantity: item.quantity || 1,
                })),
                totalAmount: (session.amount_total || 0) / 100,
                status: "pending" as const,
                shippingAddress: {
                    line1: session.customer_details?.address?.line1 || "",
                    line2: session.customer_details?.address?.line2 || "",
                    city: session.customer_details?.address?.city || "",
                    state: session.customer_details?.address?.state || "",
                    postalCode: session.customer_details?.address?.postal_code || "",
                    country: session.customer_details?.address?.country || "",
                },
                createdAt: Date.now(),
            };

            let orderResult;
            try {
                orderResult = await createOrder(orderData);
                console.log(`Order created successfully: ${orderResult.orderNumber}`);
            } catch (err) {
                console.error("CRITICAL: Failed to create order in Firestore:", err);
                // We still returned a 200 to Stripe because we don't want them to keep retrying if it's a code error,
                // but this is a serious issue.
                return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
            }

            const { id, orderNumber } = orderResult;

            // Increment discount usage if applicable
            try {
                if (session.metadata?.discountCode) {
                    const { db } = await import("@/lib/firebase");
                    const { collection, query, where, getDocs, doc, setDoc } = await import("firebase/firestore");
                    const q = query(collection(db, "discounts"), where("code", "==", session.metadata.discountCode.toUpperCase()));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const discountDoc = snap.docs[0];
                        const currentCount = discountDoc.data().usedCount || 0;
                        await setDoc(doc(db, "discounts", discountDoc.id), { usedCount: currentCount + 1 }, { merge: true });
                        console.log(`Discount code usage incremented: ${session.metadata.discountCode}`);
                    }
                }
            } catch (err) {
                console.error("Failed to increment discount usage:", err);
            }

            // Send email notifications
            const customerEmail = session.customer_details?.email;
            if (customerEmail) {
                try {
                    const { sendOrderConfirmationEmail, sendAdminOrderNotification } = await import("@/lib/email");
                    const fullOrder = { ...orderData, id, orderNumber };

                    console.log(`Attempting to send emails for order ${orderNumber} to ${customerEmail}`);

                    // Send customer confirmation
                    sendOrderConfirmationEmail(fullOrder, customerEmail)
                        .then(() => console.log(`Customer email sent to ${customerEmail}`))
                        .catch(err => console.error("Failed to send customer email:", err));

                    // Send admin notification
                    sendAdminOrderNotification(fullOrder)
                        .then(() => console.log(`Admin notification email sent`))
                        .catch(err => console.error("Failed to send admin email:", err));
                } catch (err) {
                    console.error("Failed to initiate email sending process:", err);
                }
            } else {
                console.warn(`No customer email found in session ${session.id}`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook top-level error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
