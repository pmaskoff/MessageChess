import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";
import { ConversationContextEnum, TonePreferenceEnum } from "@/types";
import { z } from "zod";

const NextMoveRequestSchema = z.object({
    context: ConversationContextEnum.optional().default("career"),
    tone: TonePreferenceEnum.optional().default("neutral"),
    latestMessage: z.string().trim().min(1, "Latest message is required"),
    conversationText: z.string().trim().optional().default(""),
    goal: z.string().trim().optional(),
});

export async function POST(request: Request) {
    try {
        const body = NextMoveRequestSchema.parse(await request.json());
        const llm = getLLMProvider();
        const result = await llm.nextMove(
            body.conversationText,
            body.latestMessage,
            body.goal,
            body.context,
            body.tone
        );

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Next move error:", error);
        const msg = error instanceof Error ? error.message : "Failed to generate next move";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
