"use client";

import { useState } from "react";
import { Brain, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    conversationContexts,
    ConversationContext,
    NextMoveResponse,
    RefinedReplyResponse,
    TonePreference,
} from "@/types";

const contextLabels: Record<ConversationContext, string> = {
    career: "Career",
    networking: "Networking",
    dating: "Dating",
    "friends-family": "Friends & Family",
    negotiation: "Negotiation",
};

const latestMessagePlaceholders: Record<ConversationContext, string> = {
    career: "happy to talk more about this. what exactly did you have in mind?",
    networking: "sure, what were you hoping to chat about?",
    dating: "haha maybe. what did you have in mind?",
    "friends-family": "i might be able to help. what do you need?",
    negotiation: "we might have some flexibility. what would work better for you?",
};

const contextExamples: Record<ConversationContext, string> = {
    career: "you: thanks again for the feedback today\n\nthem: of course\n\nyou: i wanted to revisit the scope of my role a bit",
    networking: "you: loved your talk today\n\nthem: thank you!\n\nyou: i've been trying to break into this space",
    dating: "you: last night was fun\n\nthem: haha yeah it was\n\nyou: we should probably run that back",
    "friends-family": "you: hey, can i ask a favor?\n\nthem: maybe, what's up?",
    negotiation: "you: appreciate the offer\n\nthem: glad to hear it\n\nyou: i wanted to talk through one part before locking in",
};

const toneLabels: Record<TonePreference, string> = {
    neutral: "Neutral",
    warmer: "Warmer",
    direct: "Direct",
    playful: "Playful",
};

const toneDescriptions: Record<TonePreference, string> = {
    neutral: "Balanced and natural.",
    warmer: "Softer and more personable.",
    direct: "Cleaner and more assertive.",
    playful: "A little more personality.",
};

export default function NextMovePage() {
    const [context, setContext] = useState<ConversationContext>("career");
    const [tone, setTone] = useState<TonePreference>("neutral");
    const [goal, setGoal] = useState("");
    const [latestMessage, setLatestMessage] = useState("");
    const [conversationText, setConversationText] = useState("");
    const [loading, setLoading] = useState(false);
    const [refineLoadingStyle, setRefineLoadingStyle] = useState<string | null>(null);
    const [result, setResult] = useState<NextMoveResponse | null>(null);
    const [refinedReply, setRefinedReply] = useState<RefinedReplyResponse | null>(null);

    const handleGenerate = async () => {
        if (!latestMessage.trim()) return;

        setLoading(true);
        setRefinedReply(null);
        try {
            const res = await fetch("/api/next-move", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    tone,
                    goal,
                    latestMessage,
                    conversationText,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(errData.error || "Failed to generate next move");
                return;
            }

            const data = await res.json();
            setResult(data);
            toast.success("Next moves ready");
        } catch {
            toast.error("An error occurred while generating replies");
        } finally {
            setLoading(false);
        }
    };

    const handleRefine = async (reply: string, style: string) => {
        setRefineLoadingStyle(style);
        try {
            const res = await fetch("/api/next-move/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    tone,
                    reply,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(errData.error || "Failed to rewrite reply");
                return;
            }

            const data = await res.json();
            setRefinedReply(data);
            toast.success("Reply rewritten");
        } catch {
            toast.error("An error occurred while rewriting the reply");
        } finally {
            setRefineLoadingStyle(null);
        }
    };

    const handleCopy = async (message: string) => {
        try {
            await navigator.clipboard.writeText(message);
            toast.success("Reply copied");
        } catch {
            toast.error("Could not copy reply");
        }
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                    Next Move
                </h1>
                <p className="mt-3 text-xl text-zinc-400">
                    Paste the latest message, add a little context, and get three coached replies with clear tradeoffs.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                    <CardHeader>
                        <CardTitle>Build The Position</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Set the context, your goal, and the latest message you need to answer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
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

                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Tone Preference
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {(Object.keys(toneLabels) as TonePreference[]).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setTone(option)}
                                        className={`rounded-xl border p-3 text-left transition-colors ${tone === option
                                            ? "border-emerald-500 bg-emerald-500/10"
                                            : "border-zinc-700 bg-zinc-950 hover:bg-zinc-900"
                                            }`}
                                    >
                                        <div className="font-medium text-zinc-100">{toneLabels[option]}</div>
                                        <div className="mt-1 text-sm text-zinc-500">{toneDescriptions[option]}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-200" htmlFor="goal">
                                What outcome do you want?
                            </label>
                            <Input
                                id="goal"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="Example: lock in a coffee chat without sounding transactional"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-200" htmlFor="latest-message">
                                Latest message from them
                            </label>
                            <Textarea
                                id="latest-message"
                                value={latestMessage}
                                onChange={(e) => setLatestMessage(e.target.value)}
                                placeholder={latestMessagePlaceholders[context]}
                                className="min-h-32 border-zinc-700 bg-zinc-950 text-zinc-100 focus-visible:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-200" htmlFor="conversation-context">
                                Recent conversation context
                            </label>
                            <Textarea
                                id="conversation-context"
                                value={conversationText}
                                onChange={(e) => setConversationText(e.target.value)}
                                placeholder={contextExamples[context]}
                                className="min-h-44 border-zinc-700 bg-zinc-950 text-zinc-100 focus-visible:ring-emerald-500"
                            />
                            <p className="text-xs text-zinc-500">
                                Optional, but it helps a lot. Short speaker labels like <span className="font-mono text-zinc-400">you:</span> and <span className="font-mono text-zinc-400">them:</span> work well.
                            </p>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !latestMessage.trim()}
                            className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Calculating Replies...
                                </>
                            ) : (
                                <>
                                    <Brain className="mr-2 h-5 w-5" />
                                    Generate Next Moves
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                        <CardHeader>
                            <CardTitle>Coach Read</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Strategic guidance before you pick a line.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-zinc-300 leading-relaxed">
                                {result?.overallAdvice || "Your three replies will show up here with a safe, balanced, and bold line once you generate them."}
                            </p>
                            {result && (
                                <div className="mt-4">
                                    <Badge variant="outline" className="border-zinc-700 bg-zinc-950/70 text-zinc-300">
                                        Tone: {result.tone}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {refinedReply && (
                        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                            <CardHeader>
                                <CardTitle>Rewritten Line</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Same idea, reworked in your selected tone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-zinc-100">
                                    {refinedReply.message}
                                </p>
                                <p className="text-sm text-zinc-400">{refinedReply.rationale}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => handleCopy(refinedReply.message)}
                                    className="border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Rewritten Line
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {result?.options.map((option) => (
                            <Card key={option.style} className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                                <CardHeader className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-xl">{option.label}</CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="border-zinc-700 bg-zinc-950/70 text-zinc-300"
                                            >
                                                {option.style}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopy(option.message)}
                                            className="border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy
                                        </Button>
                                    </div>
                                    <p className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-zinc-100">
                                        {option.message}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-zinc-200">Why it works</p>
                                        <p className="mt-1 text-zinc-400">{option.rationale}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-200">Risk / tradeoff</p>
                                        <p className="mt-1 text-zinc-400">{option.risk}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRefine(option.message, option.style)}
                                        disabled={refineLoadingStyle === option.style}
                                        className="border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        {refineLoadingStyle === option.style ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Rewriting...
                                            </>
                                        ) : (
                                            "Rewrite This"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )) || (
                            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                                <CardContent className="flex min-h-64 items-center justify-center p-8 text-center text-zinc-500">
                                    Generate a position to see three reply options here.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
