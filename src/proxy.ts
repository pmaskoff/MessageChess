import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const cookie = request.cookies.get("message_chess_auth");
    const isAuthenticated = cookie?.value === "true";

    const isLoginPage = request.nextUrl.pathname.startsWith("/login");
    const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");
    const isPublicAsset = request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/static") ||
        request.nextUrl.pathname === "/favicon.ico";

    if (isPublicAsset || isApiAuthRoute) {
        return NextResponse.next();
    }

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !isLoginPage) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated and on login or home page, redirect to /review
    if (isAuthenticated && (isLoginPage || request.nextUrl.pathname === "/")) {
        const reviewUrl = new URL("/review", request.url);
        return NextResponse.redirect(reviewUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
