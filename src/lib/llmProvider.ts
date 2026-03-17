import {
    ConversationContext,
    GameReview,
    Message,
    GameReviewSchema,
    NextMoveResponse,
    NextMoveResponseSchema,
    RefinedReplyResponse,
    RefinedReplyResponseSchema,
    TonePreference,
} from "@/types";
import {
    buildMockNextMoveResponse,
    buildMockRefinedReplyResponse,
    buildMockReviewFromConversationText,
    getMockGameReview,
} from "./mock";
// Placeholder for OpenAI SDK
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { practiceScenarios } from "./personas";

// Simulated LLM delay for mock mode
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const contextPrompts: Record<
    ConversationContext,
    { label: string; goal: string; signal: string }
> = {
    career: {
        label: "Career",
        goal: "career growth, raises, manager communication, and professional follow-ups",
        signal: "clarity, professionalism, confidence, and a concrete ask",
    },
    networking: {
        label: "Networking",
        goal: "coffee chats, outreach, referrals, and relationship building",
        signal: "warmth, specificity, reciprocity, and making it easy to say yes",
    },
    dating: {
        label: "Dating",
        goal: "flirty, social, and romantic conversations",
        signal: "chemistry, confidence, pacing, and avoiding awkward momentum-killers",
    },
    "friends-family": {
        label: "Friends & Family",
        goal: "favors, apologies, check-ins, and emotionally important personal conversations",
        signal: "warmth, empathy, tact, and emotional clarity",
    },
    negotiation: {
        label: "Negotiation",
        goal: "setting boundaries, asking for terms, and negotiating outcomes without escalation",
        signal: "specificity, leverage, composure, and room to keep the conversation moving",
    },
};

function buildReviewPrompt(context: ConversationContext, source: "screenshot" | "pasted text") {
    const profile = contextPrompts[context];

    return `You are "Coach D. Dennis", a chess.com-style Game Review coach for important conversations.
Your personality is witty, direct, bold, sharp, and entertaining. Keep the tone confident and memorable, but useful.
Conversation context: ${profile.label}
Primary goal in this context: ${profile.goal}
What matters most in the analysis: ${profile.signal}

Analyze the provided ${source} of a conversation.
Extract the conversation into the "messages" array in the original order.
If speaker labels like "you:" or "them:" are provided, use them. If not, infer the most likely speakers from the content.

Provide a complete Game Review and make it feel like studying film after the game.
You must calculate:
- Players accuracy (0-100)
- An opening name that fits the context
- Overall coach summary that matches the context
- A moveNumber and evaluation delta for each reviewed message
- Up to 3 critical moments
- labelCounts that exactly match the labels used in messageReviews
- suggestedReplies for 'you' when there is an inaccuracy, mistake, or blunder
- Set the top-level "context" field to exactly "${context}"
- a suggestedNextMove that fits the context and moves the conversation forward`;
}

function buildNextMovePrompt(context: ConversationContext) {
    const profile = contextPrompts[context];

    return `You are "Coach D. Dennis", a high-signal messaging coach for important conversations.
Your job is to suggest the best next reply options after reading the user's situation.
Conversation context: ${profile.label}
Primary goal in this context: ${profile.goal}
What matters most: ${profile.signal}

Return exactly 3 options with these styles in this order:
1. safe
2. balanced
3. bold

Each option must include:
- style
- label
- message
- rationale
- risk

Rules:
- The reply messages should sound like a real text or DM, not corporate copy.
- Keep messages concise.
- Make the tradeoffs genuinely different across safe, balanced, and bold.
- The "overallAdvice" should explain the best strategic principle for the next move.
- Set the top-level "context" field to exactly "${context}".`;
}

function buildRefinePrompt(context: ConversationContext, tone: TonePreference) {
    const profile = contextPrompts[context];

    return `You are "Coach D. Dennis", refining a candidate reply for an important conversation.
Conversation context: ${profile.label}
Primary goal in this context: ${profile.goal}
What matters most: ${profile.signal}
Requested tone shift: ${tone}

Return:
- context
- tone
- message
- rationale

Rules:
- Preserve the core intent of the original reply.
- Make the result sound like a real text or DM.
- Keep it concise.
- The rationale should explain what changed and why that helps.
- Set "context" to exactly "${context}" and "tone" to exactly "${tone}".`;
}

export interface LLMProvider {
    analyzeScreenshot(imageBase64Url: string, context: ConversationContext): Promise<GameReview>;
    analyzeConversationText(conversationText: string, context: ConversationContext): Promise<GameReview>;
    nextMove(conversationText: string, latestMessage: string, goal: string | undefined, context: ConversationContext, tone: TonePreference): Promise<NextMoveResponse>;
    refineReply(reply: string, context: ConversationContext, tone: TonePreference): Promise<RefinedReplyResponse>;
    puzzleTurn(runId: string, scenarioId: string, turn: number, chatHistory: Message[], userMessage: string): Promise<{ npcMessage: string, updatedHistory: Message[] }>;
    puzzleReview(runId: string, scenarioId: string, fullHistory: Message[]): Promise<GameReview>;
}

export class MockLLMProvider implements LLMProvider {
    async analyzeScreenshot(_imageBase64Url: string, context: ConversationContext): Promise<GameReview> {
        await delay(1500);
        return getMockGameReview(context);
    }

    async analyzeConversationText(_conversationText: string, context: ConversationContext): Promise<GameReview> {
        await delay(1200);
        return buildMockReviewFromConversationText(_conversationText, context);
    }

    async nextMove(conversationText: string, latestMessage: string, goal: string | undefined, context: ConversationContext, tone: TonePreference): Promise<NextMoveResponse> {
        await delay(900);
        return buildMockNextMoveResponse(latestMessage || conversationText, context, goal, tone);
    }

    async refineReply(reply: string, context: ConversationContext, tone: TonePreference): Promise<RefinedReplyResponse> {
        await delay(700);
        return buildMockRefinedReplyResponse(reply, context, tone);
    }

    async puzzleTurn(runId: string, scenarioId: string, turn: number, chatHistory: Message[], userMessage: string) {
        void runId;
        await delay(1000);
        const scenario = practiceScenarios.find((item) => item.id === scenarioId) ?? practiceScenarios[0];
        const npcMessage = `[Mock ${scenario.counterpartName}]: Re: "${userMessage}"`;
        return {
            npcMessage,
            updatedHistory: [
                ...chatHistory,
                { id: `npc-${turn}`, speaker: "them", text: npcMessage, isUser: false } as Message
            ]
        };
    }

    async puzzleReview(_runId: string, scenarioId: string, _fullHistory: Message[]): Promise<GameReview> {
        void _runId;
        await delay(1500);
        const scenario = practiceScenarios.find((item) => item.id === scenarioId) ?? practiceScenarios[0];
        return buildMockReviewFromConversationText(
            _fullHistory.map((message) => `${message.speaker}: ${message.text}`).join("\n"),
            scenario.context
        );
    }
}

export class OpenAILLMProvider implements LLMProvider {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    async analyzeScreenshot(imageBase64Url: string, context: ConversationContext): Promise<GameReview> {
        const prompt = buildReviewPrompt(context, "screenshot");

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Analyze this conversation screenshot in the ${contextPrompts[context].label} context.` },
                        { type: "image_url", image_url: { url: imageBase64Url } }
                    ]
                }
            ],
            response_format: zodResponseFormat(GameReviewSchema, "game_review"),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to get LLM response content");
        }

        return JSON.parse(content) as GameReview;
    }

    async analyzeConversationText(conversationText: string, context: ConversationContext): Promise<GameReview> {
        const prompt = `${buildReviewPrompt(context, "pasted text")}

When the pasted conversation is ambiguous, prefer preserving the user's wording over over-interpreting hidden intent.`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: `Conversation context: ${contextPrompts[context].label}\n\nConversation:\n${conversationText}`,
                },
            ],
            response_format: zodResponseFormat(GameReviewSchema, "game_review"),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to get LLM response content");
        }

        return JSON.parse(content) as GameReview;
    }

    async nextMove(
        conversationText: string,
        latestMessage: string,
        goal: string | undefined,
        context: ConversationContext,
        tone: TonePreference
    ): Promise<NextMoveResponse> {
        const prompt = buildNextMovePrompt(context);

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: `Desired tone preference: ${tone}

Goal: ${goal?.trim() || "Move the conversation forward well."}

Latest message from them:
${latestMessage}

Recent conversation context:
${conversationText || "(No extra context provided)"}`,
                },
            ],
            response_format: zodResponseFormat(NextMoveResponseSchema, "next_move_response"),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to get LLM response content");
        }

        return JSON.parse(content) as NextMoveResponse;
    }

    async refineReply(reply: string, context: ConversationContext, tone: TonePreference): Promise<RefinedReplyResponse> {
        const prompt = buildRefinePrompt(context, tone);

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: `Original reply:\n${reply}`,
                },
            ],
            response_format: zodResponseFormat(RefinedReplyResponseSchema, "refined_reply_response"),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to get LLM response content");
        }

        return JSON.parse(content) as RefinedReplyResponse;
    }

    async puzzleTurn(runId: string, scenarioId: string, turn: number, chatHistory: Message[], userMessage: string): Promise<{ npcMessage: string, updatedHistory: Message[] }> {
        void runId;
        const scenario = practiceScenarios.find((item) => item.id === scenarioId) ?? practiceScenarios[0];
        const sysMsg = `You are a real person messaging someone in an important conversation.
Scenario title: ${scenario.title}
Conversation context: ${contextPrompts[scenario.context].label}
Scenario setup: ${scenario.setup}
User objective: ${scenario.objective}
Your name: ${scenario.counterpartName}
Your vibe: ${scenario.vibe}
Rules: ${scenario.systemPrompt}
Currently on turn ${turn} of 5. Reply naturally to the user as a real person messaging from your phone.
CRITICAL: Use authentic chat language. Do NOT use perfect capitalization, perfect punctuation, or formal sentence structure unless the scenario obviously calls for it.
CRITICAL: Keep replies short and realistic, usually 1-2 sentences.
CRITICAL: Never mention being an AI, NPC, or part of a game.
CRITICAL: Reward clear, tactful, context-aware messages. Resist vague, awkward, pushy, or low-effort messages in a realistic way.`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: sysMsg },
            ...chatHistory.map(m => ({
                role: m.speaker === "you" ? "user" : "assistant",
                content: m.text
            } as OpenAI.Chat.ChatCompletionMessageParam)),
            { role: "user", content: userMessage }
        ];

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        const text = response.choices[0]?.message?.content || "...";
        return {
            npcMessage: text,
            updatedHistory: [
                ...chatHistory,
                { id: `npc-${turn}`, speaker: "them", text, isUser: false } as Message
            ]
        };
    }

    async puzzleReview(runId: string, scenarioId: string, fullHistory: Message[]): Promise<GameReview> {
        void runId;
        const scenario = practiceScenarios.find((item) => item.id === scenarioId) ?? practiceScenarios[0];
        const prompt = `You are "Coach D. Dennis", a chess.com style Game Review coach for important conversations.
Your personality is witty, direct, bold, smart, and smooth. Keep the tone entertaining, but make the feedback useful and tied to the scenario.
Review this completed practice run.
Scenario title: ${scenario.title}
Conversation context: ${contextPrompts[scenario.context].label}
Scenario setup: ${scenario.setup}
User objective: ${scenario.objective}
Generate a complete Game Review identifying mistakes, blunders, gambits, misses, forced moves, and brilliant moves.
CRITICAL INSTRUCTIONS:
- You are provided a History of messages with their exact IDs.
- For EVERY message in the history, you must evaluate it using a valid move label (e.g. book move, good move, great move, excellent move, best move, brilliant move, inaccuracy, mistake, blunder, gambit, miss, forced).
- In "messageReviews", the "messageId" MUST exactly match the ID provided in the History.
- Calculate an evaluation score ("evalSeries") for each move (message). "moveNumber" should start at 1.
- Provide labelCounts for each player matching exactly the number of labels assigned in messageReviews.
- Generate an "estimatedElo" (a number between 100 and 3000) estimating the messaging Elo rating of the "you" player based on their performance.
- Evaluate "success": true if the user achieved or clearly moved toward the scenario objective, false otherwise.
- Set the top-level "context" field to exactly "${scenario.context}".
- Provide a "suggestedNextMove" describing what you should text them next.
- Ensure "evalSeries" length matches the number of messages.`;

        const historyText = fullHistory.map(m => `[ID: ${m.id}] ${m.speaker}: ${m.text}`).join("\n");

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: `History:\n${historyText}` }
            ],
            response_format: zodResponseFormat(GameReviewSchema, "game_review"),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to get LLM response content");
        }

        const review = JSON.parse(content) as GameReview;

        // Ensure the messages array in GameReview includes the full history so the UI renders it
        review.context = scenario.context;
        review.messages = fullHistory;

        return review;
    }
}

// Factory
export function getLLMProvider(): LLMProvider {
    if (process.env.OPENAI_API_KEY) {
        return new OpenAILLMProvider();
    }
    console.warn("No OPENAI_API_KEY found. Falling back to MockLLMProvider.");
    return new MockLLMProvider();
}
