import { NextRequest, NextResponse } from "next/server";
import { getOrderBySessionId } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
    try {
        // ✅ Require authentication
        const { user, profile } = await requireAuth();

        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const order = await getOrderBySessionId(sessionId);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // ✅ Verify ownership - only allow user to see their own order or admin
        // Note: For guests (userId = 'guest'), strict check logic might differ, 
        // but typically authenticated users only fetch their own.
        // If order.userId matches logged in uid, or if admin.
        if (order.userId !== user.uid && profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ order });
    } catch (error: any) {
        // console.error("Order fetch error:", error);
        // ✅ Don't expose internal error messages
        const status = error.message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: "Failed to fetch order" }, { status });
    }
}
