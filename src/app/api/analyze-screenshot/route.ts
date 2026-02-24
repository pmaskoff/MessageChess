import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llmProvider";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { GameReview } from "@/types";

const CACHE_DIR = path.join(process.cwd(), ".cache");

// Ensure cache dir exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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

        // Hash Image for caching
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");
        const cacheFile = path.join(CACHE_DIR, `${hash}.json`);

        // Check Cache
        if (process.env.DISABLE_CACHE !== "true" && fs.existsSync(cacheFile)) {
            const stat = fs.statSync(cacheFile);
            const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);

            if (ageDays < 7) {
                console.log("Serving from cache:", hash);
                const cachedContent = fs.readFileSync(cacheFile, "utf-8");
                return NextResponse.json(JSON.parse(cachedContent));
            }
        }

        // Convert to base64 for LLM
        const base64Image = buffer.toString("base64");
        const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

        const llm = getLLMProvider();
        const review: GameReview = await llm.analyzeScreenshot(dataUrl);

        // Save to Cache
        if (process.env.DISABLE_CACHE !== "true") {
            fs.writeFileSync(cacheFile, JSON.stringify(review, null, 2));
        }

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
