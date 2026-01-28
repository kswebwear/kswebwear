import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Protect Admin Pages (/admin/*)
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get("firebaseToken")?.value;

        if (!token) {
            // Redirect unauthenticated users to home
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Note: We don't verify the token signature here because edge runtime 
        // doesn't support firebase-admin fully without hacks. 
        // We rely on the API routes/Server Actions to verify it for data access.
        // This middleware is just a "bouncer" to keep casual users out of UI.
    }

    // 2. Protect Admin API Routes (/api/admin/*)
    // Also protect critical data routes like /api/orders, /api/invoices
    if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/invoices") || pathname.startsWith("/api/orders")) {
        const token = request.cookies.get("firebaseToken")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/invoices/:path*",
        "/api/orders/:path*"
    ],
};
