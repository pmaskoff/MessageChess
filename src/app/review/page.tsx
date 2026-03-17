"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { conversationContexts, ConversationContext, GameReview } from "@/types";
import ReviewDashboard from "@/components/ReviewDashboard";

const reviewExamples = [
    "Raise ask",
    "Coffee chat",
    "Favor",
    "Follow-up",
    "Dating",
];

const contextLabels: Record<ConversationContext, string> = {
    career: "Career",
    networking: "Networking",
    dating: "Dating",
    "friends-family": "Friends & Family",
    negotiation: "Negotiation",
};

const contextPlaceholders: Record<ConversationContext, string> = {
    career: "you: thanks again for meeting with me today\n\nthem: of course\n\nyou: i wanted to ask if we could talk about my scope and compensation next week",
    networking: "you: hey sam, really enjoyed your panel\n\nthem: appreciate that\n\nyou: if you have 20 minutes next week, i would love to hear how you moved into product",
    dating: "you: had fun last night\n\nthem: me too haha\n\nyou: you free later this week or are you booked and busy",
    "friends-family": "you: hey, could i ask a favor?\n\nthem: sure what's up\n\nyou: would you be able to help me move this weekend if you're free",
    negotiation: "you: i am interested, but the timeline is tight on my side\n\nthem: what would work better for you\n\nyou: if we could move it back a week, i could commit comfortably",
};

export default function ReviewPage() {
    const [file, setFile] = useState<File | null>(null);
    const [conversationText, setConversationText] = useState("");
    const [inputMode, setInputMode] = useState<"screenshot" | "paste">("screenshot");
    const [context, setContext] = useState<ConversationContext>("career");
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState<GameReview | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5MB");
                return;
            }
            setFile(selected);
        }
    };

    const handleAnalyze = async () => {
        if (inputMode === "screenshot" && !file) return;
        if (inputMode === "paste" && !conversationText.trim()) return;

        setLoading(true);
        try {
            const res = inputMode === "screenshot"
                ? await (async () => {
                    const formData = new FormData();
                    formData.append("image", file as File);
                    formData.append("context", context);

                    return fetch("/api/analyze-screenshot", {
                        method: "POST",
                        body: formData,
                    });
                })()
                : await fetch("/api/analyze-screenshot", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conversationText,
                        context,
                    }),
                });

            if (res.ok) {
                const data = await res.json();
                setReview(data);
                toast.success("Analysis complete!");
            } else {
                const errData = await res.json();
                toast.error(errData.error || "Failed to analyze screenshot");
            }
        } catch {
            toast.error("An error occurred during analysis");
        } finally {
            setLoading(false);
        }
    };

    if (review) {
        return <ReviewDashboard review={review} onReset={() => setReview(null)} />;
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 flex flex-col items-center">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-white">
                    Message Chess
                </h1>
                <p className="text-xl text-zinc-400">
                    Upload a screenshot of an important conversation and get a move-by-move Game Review.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {reviewExamples.map((example) => (
                        <Badge
                            key={example}
                            variant="outline"
                            className="border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-300"
                        >
                            {example}
                        </Badge>
                    ))}
                </div>
            </div>

            <Card className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                <CardHeader>
                    <CardTitle>New Game Review</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Choose a context, then analyze either a screenshot or pasted conversation text.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Conversation Context
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {conversationContexts.map((option) => (
                                <Button
                                    key={option}
                                    type="button"
                                    variant={context === option ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setContext(option)}
                                    className={context === option
                                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                        : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}
                                >
                                    {contextLabels[option]}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={inputMode === "screenshot" ? "default" : "outline"}
                            onClick={() => setInputMode("screenshot")}
                            className={inputMode === "screenshot"
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}
                        >
                            Screenshot
                        </Button>
                        <Button
                            type="button"
                            variant={inputMode === "paste" ? "default" : "outline"}
                            onClick={() => setInputMode("paste")}
                            className={inputMode === "paste"
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}
                        >
                            Paste Text
                        </Button>
                    </div>

                    {inputMode === "screenshot" ? (
                        <>
                            <div className="flex justify-center w-full">
                                <label
                                    htmlFor="screenshot-upload"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-800 hover:border-emerald-500 transition-colors bg-zinc-900/50"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
                                        <p className="mb-2 text-sm text-zinc-400">
                                            <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-zinc-500">PNG or JPG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        id="screenshot-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {file && (
                                <div className="p-3 bg-zinc-800 rounded-md border border-zinc-700 flex justify-between items-center">
                                    <span className="truncate max-w-[200px] text-sm font-medium">{file.name}</span>
                                    <span className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Textarea
                                value={conversationText}
                                onChange={(e) => setConversationText(e.target.value)}
                                placeholder={contextPlaceholders[context]}
                                className="min-h-56 resize-y border-zinc-700 bg-zinc-950 text-zinc-100 focus-visible:ring-emerald-500"
                            />
                            <p className="text-xs text-zinc-500">
                                Best results come from simple speaker labels like <span className="font-mono text-zinc-400">you:</span> and <span className="font-mono text-zinc-400">them:</span>.
                            </p>
                        </div>
                    )}

                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg py-6"
                        onClick={handleAnalyze}
                        disabled={(inputMode === "screenshot" ? !file : !conversationText.trim()) || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Reviewing Position...
                            </>
                        ) : (
                            "Generate Game Review"
                        )}
                    </Button>

                    <p className="text-xs text-center text-zinc-500 mt-4">
                        Use this as conversation coaching and entertainment, not professional advice.
                        Avoid uploading sensitive personal information.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
