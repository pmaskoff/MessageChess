export interface PuzzleHistoryEntry {
    scenarioId: string;
    ratingBefore: number;
    ratingAfter: number;
    delta: number;
    success: boolean;
    playedAt: string;
}

export interface PuzzleProgress {
    rating: number;
    bestRating: number;
    streak: number;
    completedRuns: number;
    history: PuzzleHistoryEntry[];
}

const STORAGE_KEY = "message-chess-puzzle-progress";

const defaultProgress: PuzzleProgress = {
    rating: 800,
    bestRating: 800,
    streak: 0,
    completedRuns: 0,
    history: [],
};

function isBrowser() {
    return typeof window !== "undefined";
}

export function getInitialPuzzleProgress() {
    if (!isBrowser()) return defaultProgress;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultProgress;

        return { ...defaultProgress, ...JSON.parse(raw) } as PuzzleProgress;
    } catch {
        return defaultProgress;
    }
}

export function savePuzzleProgress(progress: PuzzleProgress) {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordPuzzleResult(
    progress: PuzzleProgress,
    result: Omit<PuzzleHistoryEntry, "playedAt">
) {
    const nextProgress: PuzzleProgress = {
        rating: result.ratingAfter,
        bestRating: Math.max(progress.bestRating, result.ratingAfter),
        streak: result.success ? progress.streak + 1 : 0,
        completedRuns: progress.completedRuns + 1,
        history: [
            {
                ...result,
                playedAt: new Date().toISOString(),
            },
            ...progress.history,
        ].slice(0, 25),
    };

    savePuzzleProgress(nextProgress);
    return nextProgress;
}
