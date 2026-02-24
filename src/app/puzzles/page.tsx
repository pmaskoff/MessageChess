"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, GameReview } from "@/types";
import { personas, Persona } from "@/lib/personas";
import ReviewDashboard from "@/components/ReviewDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon, Loader2, PlayCircle, Hash } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PuzzlesPage() {
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [persona, setPersona] = useState<Persona | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputStr, setInputStr] = useState("");
    const [loading, setLoading] = useState(false);
    const [gameReview, setGameReview] = useState<GameReview | null>(null);

    const turnsPlayed = Math.floor(messages.length / 2);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const startRun = () => {
        const randomPersona = personas[Math.floor(Math.random() * personas.length)];
        setPersona(randomPersona);
        setActiveRunId(uuidv4());
        setMessages([]);
        setGameReview(null);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputStr.trim() || !activeRunId || !persona) return;

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
                    personaId: persona.id,
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
                    triggerReview(activeRunId, persona.id, data.updatedHistory);
                }
            } else {
                toast.error("Failed to fetch NPC response");
                // Rollback
                setMessages(messages);
            }
        } catch (err) {
            toast.error("Network error");
            setMessages(messages);
        } finally {
            if (turnsPlayed + 1 < 5) {
                setLoading(false);
            }
        }
    };

    const triggerReview = async (runId: string, pId: string, history: Message[]) => {
        try {
            const res = await fetch("/api/puzzle-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    runId,
                    personaId: pId,
                    fullHistory: history,
                }),
            });

            if (res.ok) {
                const rw = await res.json();
                setGameReview(rw);
                toast.success("Game Over! Review ready.");
            } else {
                toast.error("Failed to generate Game Review");
            }
        } catch (err) {
            toast.error("Network error during review");
        } finally {
            setLoading(false);
        }
    };

    if (gameReview) {
        return <ReviewDashboard review={gameReview} onReset={() => setGameReview(null)} />;
    }

    if (!activeRunId || !persona) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-white">
                        Puzzles
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Practice your conversational openings against randomized NPCs. Can you survive 5 turns?
                    </p>
                </div>

                <Card className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl text-center p-8">
                    <Hash className="w-16 h-16 mx-auto mb-6 text-emerald-500 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">Start a New Run</h2>
                    <p className="text-zinc-400 mb-8">
                        You will face a random persona. Get points for solid, engaging replies and avoid blunders.
                    </p>
                    <Button
                        onClick={startRun}
                        className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg h-14"
                    >
                        <PlayCircle className="w-5 h-5 mr-3" />
                        Start Run
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Puzzle Run</h1>
                <div className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm font-bold border border-zinc-700">
                    Turn {Math.min(turnsPlayed + 1, 5)} / 5
                </div>
            </div>

            <Card className="flex-1 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 py-4 flex flex-row items-center gap-4">
                    <Avatar className="h-10 w-10 border border-zinc-700">
                        <AvatarFallback className="bg-zinc-800 text-xl">{persona.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{persona.name}</CardTitle>
                        <CardDescription className="text-zinc-400 text-xs mt-1">
                            {persona.vibe}
                        </CardDescription>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-4 bg-zinc-950">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-zinc-500 italic mt-10">
                                You messaged them first. What do you say?
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
                <Button variant="ghost" size="sm" onClick={() => setActiveRunId(null)} className="text-zinc-500 hover:text-zinc-300">
                    End Run Early
                </Button>
            </div>
        </div>
    );
}
