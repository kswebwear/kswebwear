import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/db";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/auth-server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover", // Ensure this matches user's types if possible, or keep existing
});

export async function POST(req: NextRequest) {
    try {
        // ✅ Require admin authentication
        await requireAdmin();

        const { orderId, status } = await req.json();

        const orders = await getAllOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Update order object with new status for email template
        const updatedOrder = { ...order, status };

        // Fetch customer email from Stripe if necessary or use metadata
        // For now we'll try to find it in stripe session or use a placeholder
        // In a real app, store customer email in the Order object!

        // Attempting to retrieve stripe session for email
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        const email = session.customer_details?.email;

        if (email) {
            await sendOrderStatusUpdateEmail(updatedOrder, email);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        // console.error("Notification API error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: error.message === "Unauthorized" ? 401 : (error.message.includes("Forbidden") ? 403 : 500) }
        );
    }
}
