"use client";

import { useMemo } from "react";
import { Trophy, Flame, Activity, TrendingUp, CircleCheck, CircleX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitialPuzzleProgress } from "@/lib/puzzleProgress";
import { practiceScenarios } from "@/lib/personas";
import { ConversationContext } from "@/types";

const contextLabels: Record<ConversationContext, string> = {
    career: "Career",
    networking: "Networking",
    dating: "Dating",
    "friends-family": "Friends & Family",
    negotiation: "Negotiation",
};

export default function ProfilePage() {
    const progress = getInitialPuzzleProgress();

    const stats = useMemo(() => {
        const wins = progress.history.filter((entry) => entry.success).length;
        const losses = progress.history.length - wins;
        const winRate = progress.history.length > 0 ? Math.round((wins / progress.history.length) * 100) : 0;

        const scenarioMap = new Map(practiceScenarios.map((scenario) => [scenario.id, scenario]));
        const byScenario = progress.history.reduce<Record<string, { played: number; wins: number; delta: number }>>((acc, entry) => {
            const scenario = scenarioMap.get(entry.scenarioId);
            const key = scenario?.title ?? entry.scenarioId;
            acc[key] ??= { played: 0, wins: 0, delta: 0 };
            acc[key].played += 1;
            acc[key].wins += entry.success ? 1 : 0;
            acc[key].delta += entry.delta;
            return acc;
        }, {});

        const byContext = progress.history.reduce<Record<string, { played: number; wins: number; delta: number }>>((acc, entry) => {
            const scenario = scenarioMap.get(entry.scenarioId);
            const key = scenario ? contextLabels[scenario.context] : "Unknown";
            acc[key] ??= { played: 0, wins: 0, delta: 0 };
            acc[key].played += 1;
            acc[key].wins += entry.success ? 1 : 0;
            acc[key].delta += entry.delta;
            return acc;
        }, {});

        return {
            wins,
            losses,
            winRate,
            scenarioRows: Object.entries(byScenario).sort((a, b) => b[1].played - a[1].played),
            contextRows: Object.entries(byContext).sort((a, b) => b[1].played - a[1].played),
        };
    }, [progress]);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Profile</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                        Your Message Chess Ladder
                    </h1>
                    <p className="mt-3 max-w-3xl text-xl text-zinc-400">
                        Track your rating, see where you are strongest, and keep tabs on how the puzzle grind is going.
                    </p>
                </div>
                <Badge variant="outline" className="w-fit border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                    {progress.completedRuns} recorded runs
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ProfileStatCard label="Current Elo" value={progress.rating} accent="text-emerald-300" icon={<TrendingUp className="h-5 w-5" />} />
                <ProfileStatCard label="Best Elo" value={progress.bestRating} accent="text-cyan-300" icon={<Trophy className="h-5 w-5" />} />
                <ProfileStatCard label="Current Streak" value={progress.streak} accent="text-orange-300" icon={<Flame className="h-5 w-5" />} />
                <ProfileStatCard label="Win Rate" value={`${stats.winRate}%`} accent="text-violet-300" icon={<Activity className="h-5 w-5" />} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                    <CardHeader>
                        <CardTitle>Recent Ladder History</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Your latest runs, Elo changes, and which scenarios are helping or hurting the climb.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {progress.history.length === 0 ? (
                            <EmptyState message="No runs yet. Play some puzzles and your ladder history will start filling in here." />
                        ) : (
                            progress.history.map((entry) => {
                                const scenario = practiceScenarios.find((item) => item.id === entry.scenarioId);
                                return (
                                    <div key={`${entry.scenarioId}-${entry.playedAt}`} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-zinc-100">{scenario?.title ?? entry.scenarioId}</p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {scenario ? contextLabels[scenario.context] : "Unknown"} · {formatRelativeDate(entry.playedAt)}
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
                                            <span className={`inline-flex items-center gap-1 ${entry.success ? "text-emerald-300" : "text-red-300"}`}>
                                                {entry.success ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
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

                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                        <CardHeader>
                            <CardTitle>Performance By Scenario</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Where you spend the most time and where the ladder gains are coming from.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.scenarioRows.length === 0 ? (
                                <EmptyState message="Scenario stats will appear after your first few runs." />
                            ) : (
                                stats.scenarioRows.map(([name, row]) => (
                                    <RowSummary
                                        key={name}
                                        label={name}
                                        meta={`${row.wins}/${row.played} wins`}
                                        delta={row.delta}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                        <CardHeader>
                            <CardTitle>Performance By Context</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Useful for seeing whether you are better in career asks, dating, negotiation, or relationship-heavy scenarios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.contextRows.length === 0 ? (
                                <EmptyState message="Context stats will appear after your first few runs." />
                            ) : (
                                stats.contextRows.map(([name, row]) => (
                                    <RowSummary
                                        key={name}
                                        label={name}
                                        meta={`${row.wins}/${row.played} wins`}
                                        delta={row.delta}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                        <CardHeader>
                            <CardTitle>Record</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Simple win-loss summary from your saved puzzle runs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <MiniStat label="Wins" value={stats.wins} accent="text-emerald-300" />
                            <MiniStat label="Losses" value={stats.losses} accent="text-red-300" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ProfileStatCard({
    label,
    value,
    accent,
    icon,
}: {
    label: string;
    value: number | string;
    accent: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                    <div className="text-zinc-500">{icon}</div>
                </div>
                <p className={`mt-4 text-3xl font-black ${accent}`}>{value}</p>
            </CardContent>
        </Card>
    );
}

function RowSummary({
    label,
    meta,
    delta,
}: {
    label: string;
    meta: string;
    delta: number;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-zinc-100">{label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{meta}</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${delta >= 0
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                    }`}>
                    {delta >= 0 ? "+" : ""}{delta}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
            <p className={`mt-3 text-2xl font-black ${accent}`}>{value}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-500">
            {message}
        </div>
    );
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
