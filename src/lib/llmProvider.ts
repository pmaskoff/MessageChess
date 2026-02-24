import { GameReview, Message, GameReviewSchema } from "@/types";
import { mockGameReview } from "./mock";
// Placeholder for OpenAI SDK
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { personas } from "./personas";

// Simulated LLM delay for mock mode
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface LLMProvider {
    analyzeScreenshot(imageBase64Url: string): Promise<GameReview>;
    puzzleTurn(runId: string, personaId: string, turn: number, chatHistory: Message[], userMessage: string): Promise<{ npcMessage: string, updatedHistory: Message[] }>;
    puzzleReview(runId: string, personaId: string, fullHistory: Message[]): Promise<GameReview>;
}

export class MockLLMProvider implements LLMProvider {
    async analyzeScreenshot(_imageBase64Url: string): Promise<GameReview> {
        await delay(1500);
        return mockGameReview;
    }

    async puzzleTurn(runId: string, personaId: string, turn: number, chatHistory: Message[], userMessage: string) {
        await delay(1000);
        const npcMessage = `[Mock ${personaId}]: Re: "${userMessage}"`;
        return {
            npcMessage,
            updatedHistory: [
                ...chatHistory,
                { id: `npc-${turn}`, speaker: "them", text: npcMessage, isUser: false } as Message
            ]
        };
    }

    async puzzleReview(_runId: string, _personaId: string, _fullHistory: Message[]): Promise<GameReview> {
        await delay(1500);
        return mockGameReview; // For now reuse the same mock for MVP
    }
}

export class OpenAILLMProvider implements LLMProvider {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    async analyzeScreenshot(imageBase64Url: string): Promise<GameReview> {
        const prompt = `You are a meme-literate "Game Review" coach for text messages.
Analyze the provided screenshot of a text conversation.
Extract the conversation messages into the "messages" array (infer who is 'you' and 'them' - usually 'you' are blue/green/gray bubbles on the right or the sender).
Provide a chess.com style Game Review analysis. 
You must calculate:
- Players accuracy (0-100)
- An opening name (funny, e.g. "Dry Texter Defense")
- Overall coach summary (PG-13, funny but analytical)
- Give each message a moveNumber and evaluation delta.
- Provide up to 3 critical moments.
- Provide labelCounts for each player matching exactly the number of labels assigned in messageReviews.
- Provide suggestedReplies for 'you' when there's an inaccuracy/mistake/blunder.`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this conversation." },
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

    async puzzleTurn(runId: string, personaId: string, turn: number, chatHistory: Message[], userMessage: string): Promise<{ npcMessage: string, updatedHistory: Message[] }> {
        const persona = personas.find(p => p.id === personaId) || personas[0];
        const sysMsg = `You are a real person texting on a dating app or text message.
Persona: ${persona.name}
Vibe: ${persona.vibe}
Rules: ${persona.systemPrompt}
Currently on turn ${turn} of 5. Reply naturally to the user as a real person texting from your phone. Keep it short (1-2 sentences max). 
CRITICAL: Do NEVER mention being an AI, NPC, or part of a game. If the user is smooth or persuasive, act charmed and you can agree to a date or give your number (meaning they "win" the conversation).`;

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

    async puzzleReview(runId: string, personaId: string, fullHistory: Message[]): Promise<GameReview> {
        const prompt = `You are a chess.com style Game Review coach for text messages.
Review this completed conversation practice run. Generate a complete Game Review identifying mistakes, blunders, and brilliant moves.`;

        const historyText = fullHistory.map(m => `${m.speaker}: ${m.text}`).join("\n");

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
