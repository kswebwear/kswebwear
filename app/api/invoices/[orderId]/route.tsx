import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/lib/invoice";
import { getAllOrders } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Get all orders and find the one we need
        const orders = await getAllOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
        console.error("Error generating invoice:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
