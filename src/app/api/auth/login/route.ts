import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        const expectedPassword = process.env.SHARED_PASSWORD;

        if (!expectedPassword) {
            // In dev mode without env, allow any password or fail depending on strictness
            // We will require it to be set though.
            console.warn("SHARED_PASSWORD is not set in env.");
            if (password !== "demo") {
                return NextResponse.json({ error: "Invalid password" }, { status: 401 });
            }
        } else {
            if (password !== expectedPassword) {
                return NextResponse.json({ error: "Invalid password" }, { status: 401 });
            }
        }

        const response = NextResponse.json({ success: true });

        // Set httpOnly cookie
        response.cookies.set("message_chess_auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        return response;
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
