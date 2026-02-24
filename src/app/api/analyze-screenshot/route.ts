import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";
import { GameReview } from "@/types";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Rate Limiting Mock (in-memory, simple IP check) -> MVP implementation
        // Standard Next.js request.ip might be null depending on hosting, so skip strict check for now.

        // Convert to base64 for LLM
        const base64Image = buffer.toString("base64");
        const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

        const llm = getLLMProvider();
        const review: GameReview = await llm.analyzeScreenshot(dataUrl);

        return NextResponse.json(review);
    } catch (error: unknown) {
        console.error("Screenshot analysis error:", error);
        const msg = error instanceof Error ? error.message : "Failed to analyze screenshot";
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}
