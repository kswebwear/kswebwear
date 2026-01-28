import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/lib/invoice";
import { getAllOrders } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // ✅ Require authentication
        const { user, profile } = await requireAuth();

        const { orderId } = await params;

        // Get all orders and find the one we need
        // Note: getAllOrders() is inefficient here, ideally we'd use getOrder(orderId) 
        // if available, but sticking to existing pattern for now.
        const orders = await getAllOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // ✅ Verify ownership
        if (order.userId !== user.uid && profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Generate PDF
        const pdfBuffer = await renderToBuffer(<InvoiceDocument order={order} />);

        // Return PDF (convert Buffer to Uint8Array for NextResponse)
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
            },
        });
    } catch (error: any) {
        // console.error("Error generating invoice:", error);
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
