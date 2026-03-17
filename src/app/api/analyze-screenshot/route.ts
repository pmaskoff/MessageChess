import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";
import { ConversationContext, ConversationContextEnum, GameReview } from "@/types";
import { z } from "zod";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/png", "image/jpeg"]);

const TextReviewRequestSchema = z.object({
    conversationText: z.string().trim().min(1, "Conversation text is required"),
    context: ConversationContextEnum.optional().default("career"),
});

function parseContext(value: FormDataEntryValue | null): ConversationContext {
    const parsed = ConversationContextEnum.safeParse(value);
    return parsed.success ? parsed.data : "career";
}

export async function POST(request: Request) {
    try {
        const llm = getLLMProvider();
        const contentType = request.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const body = TextReviewRequestSchema.parse(await request.json());
            const review: GameReview = await llm.analyzeConversationText(body.conversationText, body.context);

            return NextResponse.json(review);
        }

        const formData = await request.formData();
        const imageFile = formData.get("image");
        const context = parseContext(formData.get("context"));

        if (!(imageFile instanceof File)) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!acceptedImageTypes.has(imageFile.type)) {
            return NextResponse.json({ error: "Only PNG and JPG screenshots are supported" }, { status: 400 });
        }

        if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
            return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 });
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Rate Limiting Mock (in-memory, simple IP check) -> MVP implementation
        // Standard Next.js request.ip might be null depending on hosting, so skip strict check for now.

        // Convert to base64 for LLM
        const base64Image = buffer.toString("base64");
        const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

        const review: GameReview = await llm.analyzeScreenshot(dataUrl, context);

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
