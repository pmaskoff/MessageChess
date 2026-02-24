import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    response.cookies.delete("message_chess_auth");

    return response;
}
