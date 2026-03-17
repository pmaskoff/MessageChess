import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";
import { ConversationContextEnum, TonePreferenceEnum } from "@/types";
import { z } from "zod";

const RefineReplyRequestSchema = z.object({
    context: ConversationContextEnum,
    tone: TonePreferenceEnum.optional().default("neutral"),
    reply: z.string().trim().min(1, "Reply is required"),
});

export async function POST(request: Request) {
    try {
        const body = RefineReplyRequestSchema.parse(await request.json());
        const llm = getLLMProvider();
        const result = await llm.refineReply(body.reply, body.context, body.tone);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Refine reply error:", error);
        const msg = error instanceof Error ? error.message : "Failed to refine reply";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
