import { GameReview, MoveLabel } from "@/types";

const labelImpact: Record<MoveLabel, number> = {
    "book move": 0.1,
    "good move": 0.35,
    "great move": 0.55,
    "excellent move": 0.8,
    "best move": 1,
    "brilliant move": 1.2,
    "inaccuracy": -0.35,
    "mistake": -0.75,
    "blunder": -1.15,
    "gambit": 0.45,
    "miss": -0.6,
    "forced": 0,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function calculateMoveScore(review: GameReview) {
    if (review.messageReviews.length === 0) return 0.5;

    const total = review.messageReviews.reduce((sum, move) => sum + labelImpact[move.label], 0);
    const normalized = (total + review.messageReviews.length * 1.2) / (review.messageReviews.length * 2.4);
    return clamp(normalized, 0, 1);
}

export function calculateEstimatedElo(review: GameReview, difficultyElo = 900) {
    const accuracyScore = clamp(review.players.you.accuracy / 100, 0, 1);
    const moveScore = calculateMoveScore(review);
    const resultScore = review.success ? 1 : 0.35;
    const weighted = accuracyScore * 0.45 + moveScore * 0.35 + resultScore * 0.2;
    const elo = 500 + weighted * 900 + difficultyElo * 0.45;

    return Math.round(clamp(elo, 300, 2800));
}

export function calculatePuzzleRatingDelta(
    currentRating: number,
    review: GameReview,
    difficultyElo: number
) {
    const accuracyScore = clamp(review.players.you.accuracy / 100, 0, 1);
    const moveScore = calculateMoveScore(review);
    const resultScore = review.success ? 1 : 0.2;
    const actualScore = accuracyScore * 0.45 + moveScore * 0.35 + resultScore * 0.2;

    const expectedScore = 1 / (1 + Math.pow(10, (difficultyElo - currentRating) / 400));
    const baseDelta = (actualScore - expectedScore) * 36;
    const successBonus = review.success ? 4 : -2;

    return Math.round(clamp(baseDelta + successBonus, -28, 32));
}
