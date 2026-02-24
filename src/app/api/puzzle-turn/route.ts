import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";

export async function POST(request: Request) {
    try {
        const { runId, personaId, turn, chatHistory, userMessage } = await request.json();

        if (!runId || !personaId || turn === undefined || !userMessage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const llm = getLLMProvider();
        const result = await llm.puzzleTurn(runId, personaId, turn, chatHistory, userMessage);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Puzzle turn error:", error);
        const msg = error instanceof Error ? error.message : "Failed to process turn";
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}
