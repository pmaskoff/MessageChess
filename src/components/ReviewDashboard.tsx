import { useState } from "react";
import { GameReview, moveLabels } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { DownloadIcon, ArrowLeft, ArrowRight, MessageSquare, ChevronLeft } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useRef } from "react";
import { toast } from "sonner";

interface Props {
    review: GameReview;
    onReset: () => void;
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
} as Record<string, string>;

export default function ReviewDashboard({ review, onReset }: Props) {
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(0);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const currentMove = review.messageReviews[selectedMoveIndex];

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
        } catch (err) {
            toast.error("Failed to generate share card");
        }
    };

    return (
        <div className="container mx-auto max-w-[100rem] px-4 py-8 flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-4rem)]">
            {/* Left Column: Original Chat */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col overflow-hidden max-h-[800px]">
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
                        <h1 className="text-3xl font-extrabold text-white">Game Review</h1>
                        <p className="text-zinc-400">{review.openingName}</p>
                    </div>
                    <Button className="bg-zinc-800 hover:bg-zinc-700 text-white" variant="outline" onClick={handleShare}>
                        <DownloadIcon className="w-4 h-4 mr-2" /> Share Card
                    </Button>
                </div>

                {/* Coach Summary */}
                <div ref={shareCardRef} className="p-4 bg-zinc-950 rounded-xl relative overflow-hidden ring-1 ring-zinc-800">
                    <Card className="bg-zinc-900 border-zinc-800 mb-4 relative z-20">
                        <CardContent className="pt-6 flex gap-4">
                            <Avatar className="h-12 w-12 border-2 border-emerald-500 flex-shrink-0">
                                <AvatarFallback className="bg-zinc-800 text-emerald-500 text-xl">♟</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-zinc-800/50 p-4 rounded-xl rounded-tl-none border border-zinc-700/50">
                                <p className="text-lg text-zinc-200">"{review.overallCoachSummary}"</p>
                            </div>
                        </CardContent>
                    </Card>

                    {review.suggestedNextMove && (
                        <Card className="bg-emerald-950/20 border-emerald-900/50 mb-4 relative z-20">
                            <CardHeader className="py-3 px-4 bg-emerald-900/10 border-b border-emerald-900/20">
                                <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Coach's Suggested Next Move
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-emerald-100 font-medium">
                                "{review.suggestedNextMove}"
                            </CardContent>
                        </Card>
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
                <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col overflow-hidden max-h-[800px]">
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
                                        "{review.messages.find(m => m.id === currentMove.messageId)?.text}"
                                    </div>
                                )}
                                {currentMove.suggestedReply && (
                                    <div className="mt-2 text-sm bg-emerald-950/30 text-emerald-200 border border-emerald-900/50 p-3 rounded-lg flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block mb-1">Coach suggests:</span>
                                            "{currentMove.suggestedReply}"
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

function PlayerCard({ title, accuracy, counts }: { title: string, accuracy: number, counts: Record<string, number> }) {
    // Ordered labels for consistent display
    const displayLabels = [
        "brilliant move", "best move", "excellent move", "good move", "book move", "inaccuracy", "mistake", "blunder"
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
                    if (count === 0 && !["blunder", "mistake", "brilliant move", "best move"].includes(lbl)) return null;

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
