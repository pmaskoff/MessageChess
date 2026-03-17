import { useRef, useState } from "react";
import { ConversationContext, GameReview } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { DownloadIcon, ArrowLeft, ArrowRight, MessageSquare, ChevronLeft } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

interface Props {
    review: GameReview;
    onReset: () => void;
    onContinue?: () => void;
    ratingDelta?: number | null;
}

const colorMap = {
    "brilliant move": "text-emerald-400 font-bold",
    "best move": "text-green-500 font-medium",
    "excellent move": "text-green-400 font-medium",
    "great move": "text-teal-400",
    "good move": "text-blue-400",
    "book move": "text-zinc-300",
    "inaccuracy": "text-yellow-400",
    "mistake": "text-orange-500",
    "blunder": "text-red-500 font-bold",
    "gambit": "text-purple-400 font-bold",
    "miss": "text-rose-400 font-bold",
    "forced": "text-zinc-400 italic",
} as Record<string, string>;

const labelIcons = {
    "brilliant move": "!!",
    "best move": "★",
    "excellent move": "!",
    "great move": "!",
    "good move": "✓",
    "book move": "📖",
    "inaccuracy": "?!",
    "mistake": "?",
    "blunder": "??",
    "gambit": "♘",
    "miss": "∅",
    "forced": "□",
} as Record<string, string>;

const outcomeCopy: Record<
    ConversationContext,
    {
        successTitle: string;
        successBody: string;
        failureTitle: string;
        failureBody: string;
    }
> = {
    career: {
        successTitle: "Ask Landed",
        successBody: "The conversation stayed professional and moved your request forward.",
        failureTitle: "Request Stalled",
        failureBody: "The ask did not move forward cleanly. Review the key moments and tighten your framing.",
    },
    networking: {
        successTitle: "Connection Secured",
        successBody: "You earned a warm response or a clear next step. Strong positioning.",
        failureTitle: "Connection Slipped",
        failureBody: "The thread lost momentum before a next step was locked in. Review where the energy dropped.",
    },
    dating: {
        successTitle: "Successfully Pulled!",
        successBody: "You got their number or secured the date. Smooth moves.",
        failureTitle: "Fumbled It",
        failureBody: "They left you on read or rejected you. Review your mistakes above.",
    },
    "friends-family": {
        successTitle: "Message Landed",
        successBody: "The tone worked, and the conversation moved toward the outcome you wanted.",
        failureTitle: "Message Missed",
        failureBody: "The ask or explanation did not land cleanly. Review the soft spots and try again.",
    },
    negotiation: {
        successTitle: "Terms Improved",
        successBody: "You protected leverage and moved the conversation toward a better outcome.",
        failureTitle: "Leverage Slipped",
        failureBody: "The conversation did not improve your position. Review the sequence and sharpen the next ask.",
    },
};

export default function ReviewDashboard({ review, onReset, onContinue, ratingDelta }: Props) {
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(0);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const currentMove = review.messageReviews[selectedMoveIndex];
    const resultCopy = outcomeCopy[review.context];
    const bestMove = [...review.messageReviews].sort((a, b) => b.evalDelta - a.evalDelta)[0];
    const biggestBlunder = [...review.messageReviews].sort((a, b) => a.evalDelta - b.evalDelta)[0];

    // Helper to get eval for chart
    const chartData = review.evalSeries.map((d) => ({
        moveInfo: `Move ${d.moveNumber}`,
        eval: d.eval,
        label: d.label
    }));

    const handleShare = async () => {
        if (!shareCardRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(shareCardRef.current, { cacheBust: true, backgroundColor: '#09090b', pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = 'message-chess-review.png';
            link.href = dataUrl;
            link.click();
            toast.success("Share card saved!");
        } catch {
            toast.error("Failed to generate share card");
        }
    };

    return (
        <div className="container mx-auto max-w-[100rem] px-4 py-8 flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-4rem)]">
            {/* Left Column: Original Chat */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
                    <CardHeader className="border-b border-zinc-800 py-4 bg-zinc-950/50">
                        <CardTitle className="text-lg">Original Chat</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 bg-zinc-950">
                        <div className="space-y-4">
                            {review.messages && review.messages.map((m) => {
                                const isYou = m.speaker === "you";
                                const isHighlighted = currentMove?.messageId === m.id;
                                const moveIndex = review.messageReviews.findIndex(r => r.messageId === m.id);
                                const isClickable = moveIndex !== -1;

                                return (
                                    <div key={m.id} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                                        <div
                                            onClick={() => { if (isClickable) setSelectedMoveIndex(moveIndex); }}
                                            className={`max-w-[85%] p-3 rounded-2xl relative transition-all duration-300 ${isClickable ? "cursor-pointer" : ""} ${isYou ? "rounded-tr-sm" : "rounded-tl-sm"} ${isHighlighted
                                                ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 scale-[1.02]"
                                                : "opacity-60 hover:opacity-100"
                                                } ${isYou
                                                    ? "bg-emerald-600/90 text-white"
                                                    : "bg-zinc-800 text-zinc-200"
                                                }`}
                                        >
                                            {isHighlighted && (
                                                <div className="absolute -top-3 -right-2 bg-zinc-950 rounded-full p-0.5 border border-zinc-700">
                                                    <span className={`text-lg bg-zinc-900 rounded-full w-6 h-6 flex items-center justify-center ${colorMap[currentMove.label] || "text-zinc-100"}`}>
                                                        {labelIcons[currentMove.label] || "•"}
                                                    </span>
                                                </div>
                                            )}
                                            {m.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            {/* Middle Column: Game Info & Graph */}
            <div className="flex-1 flex flex-col gap-6 lg:min-w-[400px]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onReset} className="hover:bg-zinc-800 text-zinc-300">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-white">Game Review</h1>
                            {review.estimatedElo && (
                                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30 font-mono font-bold text-sm flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    <span className="text-zinc-400 text-xs">ELO</span> {review.estimatedElo}
                                </span>
                            )}
                            {typeof ratingDelta === "number" && (
                                <span className={`px-3 py-1 rounded-lg border font-mono font-bold text-sm ${ratingDelta >= 0
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-red-500/30 bg-red-500/10 text-red-300"
                                    }`}>
                                    {ratingDelta >= 0 ? "+" : ""}{ratingDelta}
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-400">{review.openingName}</p>
                    </div>
                    <Button className="bg-zinc-800 hover:bg-zinc-700 text-white" variant="outline" onClick={handleShare}>
                        <DownloadIcon className="w-4 h-4 mr-2" /> Share Card
                    </Button>
                </div>

                {/* Coach Summary */}
                <div ref={shareCardRef} className="p-4 bg-zinc-950 rounded-xl relative overflow-hidden ring-1 ring-zinc-800">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]" />
                    <div className="absolute -right-14 top-8 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative z-20 space-y-4">
                        <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 border-2 border-emerald-500 flex-shrink-0">
                                    <AvatarFallback className="bg-zinc-800 text-emerald-500 text-xl">♟</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Message Chess Report</p>
                                    <h2 className="mt-2 text-2xl font-black text-white">{review.openingName}</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
                                        {review.overallCoachSummary}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-right">
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/70">Your Elo</p>
                                    <p className="mt-1 text-3xl font-black text-emerald-300">{review.estimatedElo}</p>
                                </div>
                                {typeof ratingDelta === "number" && (
                                    <div className={`rounded-full border px-3 py-1 text-xs font-bold ${ratingDelta >= 0
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                        : "border-red-500/30 bg-red-500/10 text-red-300"
                                        }`}>
                                        Ladder {ratingDelta >= 0 ? "+" : ""}{ratingDelta}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <ShareMetric
                                label="Outcome"
                                value={review.success ? resultCopy.successTitle : resultCopy.failureTitle}
                                accent={review.success ? "text-emerald-300" : "text-red-300"}
                            />
                            <ShareMetric
                                label="Accuracy"
                                value={`${review.players.you.accuracy}%`}
                                accent="text-cyan-300"
                            />
                            <ShareMetric
                                label="Best Move"
                                value={bestMove ? bestMove.label : "n/a"}
                                accent={bestMove ? colorMap[bestMove.label]?.split(" ")[0] ?? "text-zinc-200" : "text-zinc-200"}
                            />
                            <ShareMetric
                                label="Biggest Blunder"
                                value={biggestBlunder ? biggestBlunder.label : "n/a"}
                                accent={biggestBlunder ? colorMap[biggestBlunder.label]?.split(" ")[0] ?? "text-zinc-200" : "text-zinc-200"}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="bg-zinc-900/85 border-zinc-800 mb-0">
                                <CardHeader className="py-3 px-4 bg-zinc-950/60 border-b border-zinc-800">
                                    <CardTitle className="text-sm text-zinc-300">Film Room</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-3 text-sm text-zinc-300">
                                        {bestMove && (
                                            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Best Move</p>
                                                <p className={`mt-2 font-bold capitalize ${colorMap[bestMove.label] || "text-zinc-100"}`}>
                                                    {labelIcons[bestMove.label] || "•"} {bestMove.label}
                                                </p>
                                                <p className="mt-2 text-zinc-400">{bestMove.explanation}</p>
                                            </div>
                                        )}
                                        {biggestBlunder && (
                                            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-red-300/70">Biggest Blunder</p>
                                                <p className={`mt-2 font-bold capitalize ${colorMap[biggestBlunder.label] || "text-zinc-100"}`}>
                                                    {labelIcons[biggestBlunder.label] || "•"} {biggestBlunder.label}
                                                </p>
                                                <p className="mt-2 text-zinc-400">{biggestBlunder.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                {review.suggestedNextMove && (
                                    <Card className="bg-emerald-950/20 border-emerald-900/50 mb-0">
                                        <CardHeader className="py-3 px-4 bg-emerald-900/10 border-b border-emerald-900/20">
                                            <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Coach D. Dennis&apos; Suggested Next Move
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 text-emerald-100 font-medium">
                                            {review.suggestedNextMove}
                                        </CardContent>
                                    </Card>
                                )}
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
                                    Share your report card and challenge your friends to beat your line.
                                </div>
                            </div>
                        </div>
                    </div>

                    {review.success ? (
                        <div className="mb-4 relative z-20 flex flex-col items-center justify-center p-6 bg-emerald-950/40 border border-emerald-900/50 rounded-xl">
                            <h2 className="text-2xl font-bold text-emerald-400 mb-2 mt-4 text-center">{resultCopy.successTitle}</h2>
                            <p className="text-emerald-200/80 text-center mb-6">{resultCopy.successBody}</p>
                            {onContinue && (
                                <Button onClick={onContinue} size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-12">
                                    Next Scenario (Continue Streak) <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="mb-4 relative z-20 flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <h2 className="text-xl font-bold text-zinc-300 mb-2 mt-4 text-center">{resultCopy.failureTitle}</h2>
                            <p className="text-zinc-500 text-center mb-6">{resultCopy.failureBody}</p>
                            <Button onClick={onReset} size="lg" variant="outline" className="w-full md:w-auto border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold px-8 h-12">
                                {onContinue ? "Reset Practice Run" : "Start Another Review"}
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 relative z-20">
                        <PlayerCard
                            title="You"
                            accuracy={review.players.you.accuracy}
                            counts={review.labelCounts.you}
                        />
                        <PlayerCard
                            title="Opponent"
                            accuracy={review.players.them.accuracy}
                            counts={review.labelCounts.them}
                        />
                    </div>
                </div>

                {/* Evaluation Graph */}
                <Card className="bg-zinc-900 border-zinc-800 h-64 flex-shrink-0 mt-2">
                    <CardHeader className="pb-2 text-zinc-400 uppercase text-xs font-bold tracking-wider">
                        Evaluation Advantage
                    </CardHeader>
                    <CardContent className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                <XAxis dataKey="moveInfo" hide />
                                <YAxis domain={[-5, 5]} hide />
                                <ReferenceLine y={0} stroke="#52525b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                                    itemStyle={{ color: '#a1a1aa' }}
                                    formatter={(value: number | string | undefined) => [value && typeof value === 'number' && value > 0 ? `+${value}` : value, 'Eval']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="eval"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#18181b', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Move List & Details */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
                    <CardHeader className="border-b border-zinc-800 py-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                            Move Analysis
                            <span className="text-sm font-normal text-zinc-500">
                                Move {selectedMoveIndex + 1} of {review.messageReviews.length}
                            </span>
                        </CardTitle>
                    </CardHeader>

                    {/* Detailed View of Top Message */}
                    <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 min-h-[180px]">
                        {currentMove ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xl font-black ${colorMap[currentMove.label] || "text-zinc-100"}`}>
                                        {labelIcons[currentMove.label] || "•"}
                                    </span>
                                    <span className={`text-lg capitalize font-bold ${colorMap[currentMove.label] || "text-zinc-100"}`}>
                                        {currentMove.label}
                                    </span>
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed">{currentMove.explanation}</p>
                                {review.messages && (
                                    <div className="text-zinc-400 italic text-sm mt-3 px-3 py-2 border-l-2 border-zinc-700 bg-zinc-900/50 rounded-r-lg">
                                        {review.messages.find(m => m.id === currentMove.messageId)?.text}
                                    </div>
                                )}
                                {currentMove.suggestedReply && (
                                    <div className="mt-2 text-sm bg-emerald-950/30 text-emerald-200 border border-emerald-900/50 p-3 rounded-lg flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block mb-1">Coach suggests:</span>
                                            {currentMove.suggestedReply}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-500">
                                Select a move to see details
                            </div>
                        )}
                    </div>

                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-1">
                            {review.messageReviews.map((m, idx) => (
                                <button
                                    key={m.messageId}
                                    onClick={() => setSelectedMoveIndex(idx)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors
                    ${selectedMoveIndex === idx ? "bg-zinc-800 shadow-md border border-zinc-700" : "hover:bg-zinc-800/50 border border-transparent"}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 font-mono w-4">{m.moveNumber}.</span>
                                        <span className={`font-bold text-lg w-6 text-center ${colorMap[m.label] || "text-zinc-400"}`}>
                                            {labelIcons[m.label] || "•"}
                                        </span>
                                        <span className="text-zinc-200 truncate max-w-[160px] capitalize text-sm">
                                            {m.label}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-zinc-500">
                                        {m.evalDelta > 0 ? "+" : ""}{m.evalDelta.toFixed(2)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-zinc-800 flex gap-2">
                        <Button
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                            onClick={() => setSelectedMoveIndex(Math.max(0, selectedMoveIndex - 1))}
                            disabled={selectedMoveIndex === 0}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Prev
                        </Button>
                        <Button
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                            onClick={() => setSelectedMoveIndex(Math.min(review.messageReviews.length - 1, selectedMoveIndex + 1))}
                            disabled={selectedMoveIndex === review.messageReviews.length - 1}
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ShareMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">{label}</p>
            <p className={`mt-3 text-lg font-black capitalize ${accent}`}>{value}</p>
        </div>
    );
}

function PlayerCard({ title, accuracy, counts }: { title: string, accuracy: number, counts: Record<string, number> }) {
    // Ordered labels for consistent display
    const displayLabels = [
        "brilliant move", "best move", "excellent move", "great move", "good move", "book move", "gambit", "forced", "inaccuracy", "mistake", "miss", "blunder"
    ];

    return (
        <Card className="bg-zinc-900 border-zinc-800 flex-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-zinc-800/50">
                <div className="flex flex-col">
                    <CardTitle className="text-lg text-white">{title}</CardTitle>
                    <span className="text-3xl font-black mt-1 text-emerald-400">{accuracy}%</span>
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Accuracy</span>
                </div>
                <Avatar className="h-16 w-16 border border-zinc-700">
                    <AvatarFallback className="bg-zinc-800 text-2xl text-zinc-400">
                        {title === "You" ? "😎" : "🤔"}
                    </AvatarFallback>
                </Avatar>
            </CardHeader>
            <CardContent className="pt-4 flex gap-1 justify-between px-2">
                {displayLabels.map((lbl) => {
                    const count = counts[lbl] || 0;
                    if (count === 0 && !["blunder", "mistake", "brilliant move", "best move", "miss", "gambit"].includes(lbl)) return null;

                    return (
                        <div key={lbl} className="flex flex-col items-center">
                            <span className="text-xs font-bold text-zinc-300 font-mono bg-zinc-800 w-6 h-6 flex items-center justify-center rounded-sm">
                                {count}
                            </span>
                            <span className={`text-xl mt-1 ${colorMap[lbl] || "text-zinc-500"}`} title={lbl}>
                                {labelIcons[lbl]}
                            </span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
