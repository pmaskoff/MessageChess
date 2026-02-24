import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";

export async function POST(request: Request) {
    try {
        const { runId, personaId, fullHistory } = await request.json();

        if (!fullHistory || fullHistory.length === 0) {
            return NextResponse.json({ error: "No history provided" }, { status: 400 });
        }

        const llm = getLLMProvider();
        const result = await llm.puzzleReview(runId, personaId, fullHistory);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Puzzle review error:", error);
        const msg = error instanceof Error ? error.message : "Failed to generate review";
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}
