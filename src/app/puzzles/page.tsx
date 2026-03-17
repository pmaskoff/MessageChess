"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ConversationContext, Message, GameReview } from "@/types";
import { practiceScenarios, PracticeScenario } from "@/lib/personas";
import { calculateEstimatedElo, calculatePuzzleRatingDelta } from "@/lib/elo";
import { getInitialPuzzleProgress, recordPuzzleResult, PuzzleProgress } from "@/lib/puzzleProgress";
import ReviewDashboard from "@/components/ReviewDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const contextLabels: Record<ConversationContext, string> = {
    career: "Career",
    networking: "Networking",
    dating: "Dating",
    "friends-family": "Friends & Family",
    negotiation: "Negotiation",
};

export default function PuzzlesPage() {
    const sortedScenarios = [...practiceScenarios].sort((a, b) => a.baseElo - b.baseElo);
    const dailyChallenge = sortedScenarios[getDailyScenarioIndex(sortedScenarios.length)];
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [scenario, setScenario] = useState<PracticeScenario | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputStr, setInputStr] = useState("");
    const [loading, setLoading] = useState(false);
    const [gameReview, setGameReview] = useState<GameReview | null>(null);
    const [streak, setStreak] = useState(0);
    const [ratingDelta, setRatingDelta] = useState<number | null>(null);
    const [progress, setProgress] = useState<PuzzleProgress>(getInitialPuzzleProgress);

    const turnsPlayed = Math.floor(messages.length / 2);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const getScenarioById = (scenarioId: string) =>
        sortedScenarios.find((item) => item.id === scenarioId) ?? sortedScenarios[0];

    const startRun = (nextStreak: number = 0, scenarioId?: string) => {
        const selectedScenario = scenarioId
            ? getScenarioById(scenarioId)
            : sortedScenarios[Math.min(nextStreak, sortedScenarios.length - 1)];

        setScenario(selectedScenario);
        setActiveRunId(uuidv4());
        setMessages([]);
        setInputStr("");
        setLoading(false);
        setGameReview(null);
        setRatingDelta(null);
        setStreak(nextStreak);
    };

    const continueToNextScenario = () => {
        if (!scenario) {
            startRun(streak);
            return;
        }

        const currentIndex = sortedScenarios.findIndex((item) => item.id === scenario.id);
        const nextScenario = sortedScenarios[Math.min(currentIndex + 1, sortedScenarios.length - 1)];
        startRun(streak, nextScenario.id);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputStr.trim() || !activeRunId || !scenario) return;

        if (turnsPlayed >= 5) return;

        const userMsg: Message = {
            id: uuidv4(),
            speaker: "you",
            text: inputStr.trim(),
            isUser: true,
            timestamp: new Date().toISOString(),
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInputStr("");
        setLoading(true);

        try {
            const res = await fetch("/api/puzzle-turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    runId: activeRunId,
                    scenarioId: scenario.id,
                    turn: turnsPlayed + 1,
                    chatHistory: updatedHistory,
                    userMessage: userMsg.text,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(data.updatedHistory);

                // If that was the 5th turn, trigger review
                if (turnsPlayed + 1 >= 5) {
                    triggerReview(activeRunId, scenario.id, data.updatedHistory);
                }
            } else {
                toast.error("Failed to fetch NPC response");
                // Rollback
                setMessages(messages);
            }
        } catch {
            toast.error("Network error");
            setMessages(messages);
        } finally {
            if (turnsPlayed + 1 < 5) {
                setLoading(false);
            }
        }
    };

    const triggerReview = async (runId: string, scenarioId: string, history: Message[]) => {
        try {
            const res = await fetch("/api/puzzle-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    runId,
                    scenarioId,
                    fullHistory: history,
                }),
            });

            if (res.ok) {
                const rawReview = await res.json();
                const matchedScenario = sortedScenarios.find((item) => item.id === scenarioId) ?? sortedScenarios[0];
                const normalizedReview: GameReview = {
                    ...rawReview,
                    estimatedElo: calculateEstimatedElo(rawReview, matchedScenario.baseElo),
                };
                const delta = calculatePuzzleRatingDelta(progress.rating, normalizedReview, matchedScenario.baseElo);
                const nextProgress = recordPuzzleResult(progress, {
                    scenarioId,
                    ratingBefore: progress.rating,
                    ratingAfter: Math.max(300, progress.rating + delta),
                    delta,
                    success: normalizedReview.success,
                });

                setProgress(nextProgress);
                setRatingDelta(delta);
                setStreak(nextProgress.streak);
                setGameReview(normalizedReview);
                toast.success("Game Over! Review ready.");
            } else {
                toast.error("Failed to generate Game Review");
            }
        } catch {
            toast.error("Network error during review");
        } finally {
            setLoading(false);
        }
    };

    if (gameReview) {
        return (
            <ReviewDashboard
                review={gameReview}
                ratingDelta={ratingDelta}
                onReset={() => { setGameReview(null); setScenario(null); setActiveRunId(null); setMessages([]); setRatingDelta(null); setStreak(progress.streak); }}
                onContinue={() => continueToNextScenario()}
            />
        );
    }

    if (!activeRunId || !scenario) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-12 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-white">
                        Puzzles
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Pick a scenario, play five turns, and get a chess-style breakdown of how you handled the conversation.
                    </p>
                </div>

                <div className="grid w-full gap-4 mb-6 md:grid-cols-3">
                    <StatCard label="Current Elo" value={progress.rating} accent="text-emerald-400" />
                    <StatCard label="Best Elo" value={progress.bestRating} accent="text-cyan-400" />
                    <StatCard label="Completed Runs" value={progress.completedRuns} accent="text-orange-400" />
                </div>

                <Card className="w-full mb-6 overflow-hidden border-emerald-900/60 bg-[linear-gradient(135deg,rgba(6,78,59,0.45),rgba(24,24,27,0.95))] text-zinc-100 shadow-xl">
                    <CardHeader className="relative">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Daily Challenge</p>
                                <CardTitle className="mt-3 text-3xl font-black">{dailyChallenge.title}</CardTitle>
                                <CardDescription className="mt-2 max-w-2xl text-zinc-300">
                                    {dailyChallenge.setup}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100">
                                    {contextLabels[dailyChallenge.context]}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-700 bg-zinc-950/40 text-zinc-300">
                                    {dailyChallenge.baseElo} Elo
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-3">
                            <p className="text-sm text-zinc-300">
                                Objective: <span className="text-white">{dailyChallenge.objective}</span>
                            </p>
                            <p className="text-sm text-zinc-400">
                                Counterpart: {dailyChallenge.counterpartName} · {dailyChallenge.vibe}
                            </p>
                        </div>
                        <div className="flex items-center md:justify-end">
                            <Button
                                onClick={() => startRun(0, dailyChallenge.id)}
                                className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 md:w-auto"
                            >
                                <PlayCircle className="w-5 h-5 mr-3" />
                                Play Daily Challenge
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid w-full gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="grid gap-4 md:grid-cols-2">
                        {sortedScenarios.map((item) => (
                            <Card key={item.id} className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border border-zinc-700">
                                                <AvatarFallback className="bg-zinc-800 text-2xl">{item.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-xl">{item.title}</CardTitle>
                                                <CardDescription className="text-zinc-400">
                                                    {item.counterpartName} · {item.vibe}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-zinc-700 bg-zinc-950/70 text-zinc-300">
                                            {contextLabels[item.context]}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm text-zinc-400">
                                        <p>{item.setup}</p>
                                        <p className="text-zinc-500">
                                            Objective: <span className="text-zinc-300">{item.objective}</span>
                                        </p>
                                        <p className="text-zinc-500">
                                            Difficulty: <span className="text-zinc-300">{item.baseElo} Elo</span>
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button
                                        onClick={() => startRun(0, item.id)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                    >
                                        <PlayCircle className="w-5 h-5 mr-3" />
                                        Start Scenario
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="h-fit bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                        <CardHeader>
                            <CardTitle>Recent Runs</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Your latest results, Elo changes, and how the streak is trending.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {progress.history.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-500">
                                    No runs logged yet. Play a scenario and your recent ladder history will show up here.
                                </div>
                            ) : (
                                progress.history.slice(0, 6).map((entry) => {
                                    const historyScenario = getScenarioById(entry.scenarioId);
                                    return (
                                        <div
                                            key={`${entry.scenarioId}-${entry.playedAt}`}
                                            className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-zinc-100">{historyScenario.title}</p>
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {formatRelativeDate(entry.playedAt)} · {historyScenario.baseElo} Elo
                                                    </p>
                                                </div>
                                                <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${entry.delta >= 0
                                                    ? "bg-emerald-500/10 text-emerald-300"
                                                    : "bg-red-500/10 text-red-300"
                                                    }`}>
                                                    {entry.delta >= 0 ? "+" : ""}{entry.delta}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                <span className={entry.success ? "text-emerald-300" : "text-red-300"}>
                                                    {entry.success ? "Win" : "Loss"}
                                                </span>
                                                <span className="text-zinc-400">
                                                    {entry.ratingBefore} → <span className="text-zinc-200">{entry.ratingAfter}</span>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {scenario.title}
                    {streak > 0 && (
                        <span className="bg-orange-500/20 text-orange-400 text-sm px-2 py-0.5 rounded-full ring-1 ring-orange-500/50 flex items-center gap-1">
                            🔥 Streak: {streak}
                        </span>
                    )}
                </h1>
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm font-bold border border-zinc-700">
                        Elo {progress.rating}
                    </div>
                    <div className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm font-bold border border-zinc-700">
                        Turn {Math.min(turnsPlayed + 1, 5)} / 5
                    </div>
                </div>
            </div>

            <Card className="flex-1 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 py-4 flex flex-row items-center gap-4">
                    <Avatar className="h-10 w-10 border border-zinc-700">
                        <AvatarFallback className="bg-zinc-800 text-xl">{scenario.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle>{scenario.counterpartName}</CardTitle>
                            <Badge variant="outline" className="border-zinc-700 bg-zinc-950/70 text-zinc-300">
                                {contextLabels[scenario.context]}
                            </Badge>
                        </div>
                        <CardDescription className="text-zinc-400 text-xs mt-1">
                            {scenario.vibe}
                        </CardDescription>
                        <p className="mt-2 text-sm text-zinc-500">
                            Objective: <span className="text-zinc-300">{scenario.objective}</span>
                        </p>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-4 bg-zinc-950">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-zinc-500 italic mt-10">
                                {scenario.openingLine}
                            </div>
                        )}

                        {messages.map((m) => {
                            const isYou = m.speaker === "you";
                            return (
                                <div key={m.id} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[75%] p-3 rounded-2xl ${isYou
                                            ? "bg-emerald-600/90 text-white rounded-tr-sm"
                                            : "bg-zinc-800 text-zinc-200 rounded-tl-sm"
                                            }`}
                                    >
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <CardContent className="p-4 border-t border-zinc-800 bg-zinc-900">
                    <form onSubmit={handleSend} className="flex gap-2 relative">
                        <Input
                            value={inputStr}
                            onChange={(e) => setInputStr(e.target.value)}
                            placeholder="Type your message..."
                            disabled={loading || turnsPlayed >= 5}
                            className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500 pr-12 h-12 rounded-xl"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            disabled={loading || !inputStr.trim() || turnsPlayed >= 5}
                            className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-emerald-600 hover:bg-emerald-500 px-0 rounded-lg"
                        >
                            <SendIcon className="w-5 h-5" />
                        </Button>
                    </form>
                    {loading && turnsPlayed >= 4 && messages.length > 8 && (
                        <div className="text-xs text-center text-emerald-400 mt-3 font-medium animate-pulse">
                            Game Over! Generating Coach Review...
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" onClick={() => { setActiveRunId(null); setScenario(null); setMessages([]); setRatingDelta(null); setStreak(progress.streak); }} className="text-zinc-500 hover:text-zinc-300">
                    End Run Early
                </Button>
            </div>
        </div>
    );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
    return (
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
            <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                <p className={`mt-3 text-3xl font-black ${accent}`}>{value}</p>
            </CardContent>
        </Card>
    );
}

function getDailyScenarioIndex(total: number) {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const day = Math.floor(diff / 86400000);

    return day % total;
}

function formatRelativeDate(isoDate: string) {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}
