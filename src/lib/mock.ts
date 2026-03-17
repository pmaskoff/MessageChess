import {
    ConversationContext,
    GameReview,
    Message,
    MoveLabel,
    NextMoveResponse,
    NextMoveStyle,
    RefinedReplyResponse,
    TonePreference,
} from "@/types";

const baseMockGameReview: GameReview = {
    id: "demo-mock-id",
    createdAt: new Date().toISOString(),
    context: "dating",
    messages: [
        { id: "msg-0", speaker: "them", text: "Hey! Still on for tonight?", timestamp: null, isUser: false },
        { id: "msg-1", speaker: "you", text: "Hey yeah, looking forward to it!", timestamp: null, isUser: true },
        { id: "msg-them-1", speaker: "them", text: "Awesome! Where should we meet?", timestamp: null, isUser: false },
        { id: "msg-2", speaker: "you", text: "k", timestamp: null, isUser: true },
        { id: "msg-them-2", speaker: "them", text: "...okay then. Nevermind.", timestamp: null, isUser: false },
        { id: "msg-3", speaker: "you", text: "Wait no I'm sorry, my cat stepped on my phone and I panicked. I know a great sushi spot downtown, my treat! 🍣", timestamp: null, isUser: true },
    ],
    players: {
        you: { name: "You", accuracy: 78 },
        them: { name: "Player B", accuracy: 65 },
    },
    openingName: "Dry Texter Defense",
    overallCoachSummary: "You survived the early game, but giving a one-word answer nearly threw away your advantage. Good recovery in the endgame.",
    estimatedElo: 850,
    success: true,
    evalSeries: [
        { moveNumber: 0, eval: +0.20, label: null },
        { moveNumber: 1, eval: +0.25, label: null },
        { moveNumber: 2, eval: -1.05, label: "blunder" },
        { moveNumber: 3, eval: -0.80, label: null },
        { moveNumber: 4, eval: +1.50, label: "brilliant move" },
    ],
    messageReviews: [
        {
            messageId: "msg-1",
            moveNumber: 1,
            label: "book move",
            evalDelta: 0.05,
            evalAfter: 0.25,
            explanation: "Standard greeting. Nothing flashy, but solid.",
            suggestedReply: null,
        },
        {
            messageId: "msg-2",
            moveNumber: 2,
            label: "blunder",
            evalDelta: -1.30,
            evalAfter: -1.05,
            explanation: "Replying 'k' drops all momentum. You lost the initiative completely.",
            suggestedReply: "Sure! What time works for you?",
        },
        {
            messageId: "msg-3",
            moveNumber: 4,
            label: "brilliant move",
            evalDelta: +2.30,
            evalAfter: +1.50,
            explanation: "A deeply considered meme response that changed the entire conversation dynamic.",
            suggestedReply: null,
        },
    ],
    criticalMoments: [
        {
            moveNumber: 2,
            messageId: "msg-2",
            label: "blunder",
            headline: "The One-Word Tragedy",
            explanation: "You could have secured the date here, but opted for a single letter.",
            betterLine: "Yes, I know a great spot downtown.",
        },
        {
            moveNumber: 4,
            messageId: "msg-3",
            label: "brilliant move",
            headline: "The Comeback",
            explanation: "Perfect execution of a niche joke to regain ground.",
            betterLine: "", // not always needed for good moves
        }
    ],
    labelCounts: {
        you: {
            "book move": 1,
            "good move": 0,
            "great move": 0,
            "excellent move": 0,
            "best move": 0,
            "brilliant move": 1,
            "inaccuracy": 0,
            "mistake": 0,
            "blunder": 1,
            "gambit": 0,
            "miss": 0,
            "forced": 0,
        },
        them: {
            "book move": 2,
            "good move": 0,
            "great move": 0,
            "excellent move": 0,
            "best move": 0,
            "brilliant move": 0,
            "inaccuracy": 0,
            "mistake": 0,
            "blunder": 0,
            "gambit": 0,
            "miss": 0,
            "forced": 0,
        }
    },
    suggestedReplies: [
        {
            messageId: "msg-2",
            moveNumber: 2,
            original: "k",
            suggestion: "Sure! What time works for you?",
            reason: "It opens up the conversation and asks for their input."
        }
    ],
    suggestedNextMove: "Sounds great! Let's do 7pm?",
};

const mockContextCopy: Record<
    ConversationContext,
    { openingName: string; summary: string; suggestedNextMove: string }
> = {
    career: {
        openingName: "Comp Review Gambit",
        summary: "You kept things respectful and direct, but one low-clarity message gave away leverage. Tighten the framing and your ask lands much cleaner.",
        suggestedNextMove: "Would you be open to a quick conversation this week about my scope and compensation?",
    },
    networking: {
        openingName: "Coffee Chat Opening",
        summary: "Strong early positioning. The conversation works best when you stay warm, specific, and easy to say yes to.",
        suggestedNextMove: "Would you be up for a quick coffee next week? I would love to hear how you broke into this space.",
    },
    dating: {
        openingName: "Dry Texter Defense",
        summary: "You survived the early game, but giving a one-word answer nearly threw away your advantage. Good recovery in the endgame.",
        suggestedNextMove: "Sounds great! Let's do 7pm?",
    },
    "friends-family": {
        openingName: "Favor Request System",
        summary: "The tone is solid overall, but the best lines are the ones that balance honesty with a low-pressure ask.",
        suggestedNextMove: "No pressure at all, but would you be able to help me with this sometime this week?",
    },
    negotiation: {
        openingName: "Leverage Counterattack",
        summary: "You did well to stay composed. The next improvement is making your ask more specific without sounding combative.",
        suggestedNextMove: "I am interested, but I would need a bit more flexibility on the timeline for this to work.",
    },
};

export function getMockGameReview(context: ConversationContext = "dating"): GameReview {
    const review = JSON.parse(JSON.stringify(baseMockGameReview)) as GameReview;
    const copy = mockContextCopy[context];

    review.context = context;
    review.openingName = copy.openingName;
    review.overallCoachSummary = copy.summary;
    review.suggestedNextMove = copy.suggestedNextMove;

    return review;
}

function parseConversationText(conversationText: string): Message[] {
    const speakerAliases: Record<string, "you" | "them"> = {
        you: "you",
        me: "you",
        i: "you",
        them: "them",
        other: "them",
        boss: "them",
        manager: "them",
        friend: "them",
        recruiter: "them",
        client: "them",
    };

    let fallbackSpeaker: "you" | "them" = "you";

    return conversationText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            const match = line.match(/^([^:]+):\s*(.+)$/);
            const alias = match?.[1]?.trim().toLowerCase();
            const speaker = alias ? (speakerAliases[alias] ?? "them") : fallbackSpeaker;
            const text = match ? match[2].trim() : line;

            if (!match) {
                fallbackSpeaker = fallbackSpeaker === "you" ? "them" : "you";
            }

            return {
                id: `msg-${index}`,
                speaker,
                text,
                timestamp: null,
                isUser: speaker === "you",
            } satisfies Message;
        });
}

function assessUserMove(text: string): {
    label: MoveLabel;
    evalDelta: number;
    explanation: string;
    suggestedReply: string | null;
} {
    const normalized = text.trim().toLowerCase();

    if (normalized.length <= 2 || ["k", "ok", "kk", "sure", "fine"].includes(normalized)) {
        return {
            label: "blunder",
            evalDelta: -1.4,
            explanation: "This is so short that it risks killing momentum and making the other person do all the work.",
            suggestedReply: "Give a warmer, more specific reply that keeps the conversation moving.",
        };
    }

    if (normalized.length > 160) {
        return {
            label: "inaccuracy",
            evalDelta: -0.35,
            explanation: "The message gets wordy, which makes the ask feel less sharp than it could be.",
            suggestedReply: "Trim this into one clear sentence plus one specific ask.",
        };
    }

    if (normalized.includes("?") && /(would|could|can|free|available|open to|down to)/.test(normalized)) {
        return {
            label: "excellent move",
            evalDelta: 0.9,
            explanation: "You made a clear ask and gave the conversation an easy next step.",
            suggestedReply: null,
        };
    }

    if (/(thanks|thank you|appreciate|sorry|glad|happy to)/.test(normalized)) {
        return {
            label: "great move",
            evalDelta: 0.55,
            explanation: "This keeps the tone warm and lowers friction without feeling passive.",
            suggestedReply: null,
        };
    }

    if (normalized.includes("?")) {
        return {
            label: "good move",
            evalDelta: 0.35,
            explanation: "Asking a question keeps the rally going, even if the wording could still be sharper.",
            suggestedReply: null,
        };
    }

    return {
        label: "book move",
        evalDelta: 0.15,
        explanation: "Solid, standard play. It does the job without creating a big edge.",
        suggestedReply: null,
    };
}

function calculateAccuracy(messageReviews: GameReview["messageReviews"]) {
    if (messageReviews.length === 0) return 72;

    const weights: Record<MoveLabel, number> = {
        "book move": 78,
        "good move": 82,
        "great move": 88,
        "excellent move": 92,
        "best move": 96,
        "brilliant move": 99,
        inaccuracy: 62,
        mistake: 48,
        blunder: 28,
        gambit: 80,
        miss: 42,
        forced: 74,
    };

    const total = messageReviews.reduce((sum, review) => sum + weights[review.label], 0);
    return Math.round(total / messageReviews.length);
}

function inferSuccess(messages: Message[]) {
    const lastMessage = messages.at(-1)?.text.toLowerCase() ?? "";
    return /(yes|sounds good|works for me|let's do it|lets do it|happy to|absolutely|free|available)/.test(lastMessage);
}

export function buildMockReviewFromConversationText(
    conversationText: string,
    context: ConversationContext = "career"
): GameReview {
    const messages = parseConversationText(conversationText);

    if (messages.length === 0) {
        return getMockGameReview(context);
    }

    let runningEval = 0;
    const messageReviews: GameReview["messageReviews"] = [];
    const evalSeries: GameReview["evalSeries"] = [];
    const labelCounts = {
        you: {
            "book move": 0,
            "good move": 0,
            "great move": 0,
            "excellent move": 0,
            "best move": 0,
            "brilliant move": 0,
            "inaccuracy": 0,
            "mistake": 0,
            "blunder": 0,
            "gambit": 0,
            "miss": 0,
            "forced": 0,
        },
        them: {
            "book move": 0,
            "good move": 0,
            "great move": 0,
            "excellent move": 0,
            "best move": 0,
            "brilliant move": 0,
            "inaccuracy": 0,
            "mistake": 0,
            "blunder": 0,
            "gambit": 0,
            "miss": 0,
            "forced": 0,
        },
    } satisfies GameReview["labelCounts"];

    const suggestedReplies: GameReview["suggestedReplies"] = [];

    messages.forEach((message, index) => {
        if (message.speaker === "you") {
            const assessment = assessUserMove(message.text);
            runningEval = Math.max(-5, Math.min(5, runningEval + assessment.evalDelta));

            messageReviews.push({
                messageId: message.id,
                moveNumber: index + 1,
                label: assessment.label,
                evalDelta: assessment.evalDelta,
                evalAfter: Number(runningEval.toFixed(2)),
                explanation: assessment.explanation,
                suggestedReply: assessment.suggestedReply,
            });
            labelCounts.you[assessment.label] += 1;

            if (assessment.suggestedReply) {
                suggestedReplies.push({
                    messageId: message.id,
                    moveNumber: index + 1,
                    original: message.text,
                    suggestion: assessment.suggestedReply,
                    reason: "A little more clarity and warmth would improve the position.",
                });
            }

            evalSeries.push({
                moveNumber: index + 1,
                eval: Number(runningEval.toFixed(2)),
                label: assessment.label,
            });
            return;
        }

        const opponentDelta = message.text.length > 24 ? -0.1 : 0.1;
        runningEval = Math.max(-5, Math.min(5, runningEval + opponentDelta));
        evalSeries.push({
            moveNumber: index + 1,
            eval: Number(runningEval.toFixed(2)),
            label: null,
        });
    });

    const negativeReview = [...messageReviews]
        .sort((a, b) => a.evalDelta - b.evalDelta)[0];
    const positiveReview = [...messageReviews]
        .sort((a, b) => b.evalDelta - a.evalDelta)[0];

    const review = getMockGameReview(context);
    review.messages = messages;
    review.messageReviews = messageReviews;
    review.evalSeries = evalSeries;
    review.labelCounts = labelCounts;
    review.suggestedReplies = suggestedReplies;
    review.players.you.accuracy = calculateAccuracy(messageReviews);
    review.players.them.accuracy = 74;
    review.success = inferSuccess(messages);
    review.criticalMoments = [
        negativeReview && {
            moveNumber: negativeReview.moveNumber,
            messageId: negativeReview.messageId,
            label: negativeReview.label,
            headline: "Where The Position Slipped",
            explanation: negativeReview.explanation,
            betterLine: negativeReview.suggestedReply ?? "",
        },
        positiveReview && positiveReview !== negativeReview && {
            moveNumber: positiveReview.moveNumber,
            messageId: positiveReview.messageId,
            label: positiveReview.label,
            headline: "Best Move On The Board",
            explanation: positiveReview.explanation,
            betterLine: "",
        },
    ].filter(Boolean) as GameReview["criticalMoments"];

    if (messageReviews.length > 0) {
        review.estimatedElo = 600 + review.players.you.accuracy * 10;
    }

    return review;
}

const nextMoveVoice: Record<
    ConversationContext,
    { advice: string; endings: Record<NextMoveStyle, string> }
> = {
    career: {
        advice: "Keep the reply calm, specific, and easy to answer. Career messages usually win by sounding prepared, not dramatic.",
        endings: {
            safe: "Would you be open to a quick conversation about it this week?",
            balanced: "If you are open to it, I would love to set aside 15 minutes and talk through it directly.",
            bold: "I think this is worth a direct conversation, and I would love to put time on the calendar this week.",
        },
    },
    networking: {
        advice: "Make it easy to say yes. Warmth plus specificity beats a long paragraph every time.",
        endings: {
            safe: "If you have 15 minutes next week, I would really appreciate it.",
            balanced: "Would you be up for a quick coffee or call next week?",
            bold: "I would love to grab 20 minutes next week and learn from your path if you are open to it.",
        },
    },
    dating: {
        advice: "You want momentum, not overthinking. Keep it light, clear, and a little playful.",
        endings: {
            safe: "if you're free, we should lock something in this week",
            balanced: "you seem fun, let's stop freelancing this convo and grab a drink this week",
            bold: "cool so i'm calling it, we should hang this week. what night works for you?",
        },
    },
    "friends-family": {
        advice: "Lead with warmth and make the ask feel low-pressure. That usually lands better than overexplaining.",
        endings: {
            safe: "No pressure at all if not.",
            balanced: "Would you be open to helping if you have the bandwidth?",
            bold: "I figured I would ask directly because I trust you, but no worries if the timing is bad.",
        },
    },
    negotiation: {
        advice: "Stay composed and specific. The best next move protects leverage without sounding combative.",
        endings: {
            safe: "If there is any flexibility there, I would appreciate it.",
            balanced: "If we can adjust that piece, I would feel much better moving forward.",
            bold: "That change would make it a much easier yes on my side.",
        },
    },
};

const toneAdjustments: Record<
    TonePreference,
    {
        advice: string;
        labels: Record<NextMoveStyle, string>;
        transform: (message: string) => string;
    }
> = {
    neutral: {
        advice: "Keep the tone natural and well-balanced.",
        labels: { safe: "Safe", balanced: "Balanced", bold: "Bold" },
        transform: (message) => message,
    },
    warmer: {
        advice: "Soften the edges a bit and make the reply feel more personable.",
        labels: { safe: "Warm & Safe", balanced: "Warm & Balanced", bold: "Warm & Forward" },
        transform: (message) => {
            if (/^totally/i.test(message)) return `Absolutely, ${message.slice("Totally, ".length)}`;
            if (/^i am /i.test(message)) return `Honestly, ${message}`;
            return `Honestly, ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
        },
    },
    direct: {
        advice: "Trim the extra softness and make the next step unmistakably clear.",
        labels: { safe: "Direct & Safe", balanced: "Direct", bold: "Direct & Assertive" },
        transform: (message) => message.replace(/^Honestly,\s*/i, "").replace(/^Totally,\s*/i, ""),
    },
    playful: {
        advice: "Keep it strategic, but add a little personality so it does not feel overly rehearsed.",
        labels: { safe: "Playful & Safe", balanced: "Playful", bold: "Playful & Bold" },
        transform: (message) => `${message.replace(/[.]+$/, "")} :)`,
    },
};

function cleanSentence(text: string) {
    return text.trim().replace(/\s+/g, " ").replace(/[.?!]+$/, "");
}

export function buildMockNextMoveResponse(
    latestMessage: string,
    conversationContext: string,
    goal?: string,
    tone: TonePreference = "neutral"
): NextMoveResponse {
    const context = (conversationContext in nextMoveVoice ? conversationContext : "career") as ConversationContext;
    const voice = nextMoveVoice[context];
    const toneConfig = toneAdjustments[tone];
    const anchor = cleanSentence(latestMessage) || "that";
    const goalLine = goal?.trim() ? ` Aim for: ${goal.trim()}.` : "";

    const buildMessage = (style: NextMoveStyle, base: string) => toneConfig.transform(base);

    return {
        context,
        tone,
        overallAdvice: `${voice.advice} ${toneConfig.advice}${goalLine}`,
        options: [
            {
                style: "safe",
                label: toneConfig.labels.safe,
                message: buildMessage("safe", `Totally, re ${anchor}, ${voice.endings.safe}`),
                rationale: "This keeps the tone easy and lowers the risk of sounding too aggressive or overeager.",
                risk: "It may be a little too cautious if you need a clear commitment quickly.",
            },
            {
                style: "balanced",
                label: toneConfig.labels.balanced,
                message: buildMessage("balanced", `I am into that. ${voice.endings.balanced}`),
                rationale: "This is the most generally useful option: warm, direct, and likely to move the conversation forward.",
                risk: "It is strong enough to force a real answer, so it gives the other person less room to stay vague.",
            },
            {
                style: "bold",
                label: toneConfig.labels.bold,
                message: buildMessage("bold", `${voice.endings.bold}`),
                rationale: "This takes initiative and makes the next step unmistakably clear.",
                risk: "If the vibe is still fragile, it can read as slightly pushy or premature.",
            },
        ],
    };
}

export function buildMockRefinedReplyResponse(
    reply: string,
    context: ConversationContext,
    tone: TonePreference = "neutral"
): RefinedReplyResponse {
    const toneConfig = toneAdjustments[tone];
    const message = toneConfig.transform(cleanSentence(reply));

    return {
        context,
        tone,
        message,
        rationale: `${toneConfig.advice} This version keeps the same idea while nudging the delivery toward a more ${tone} feel.`,
    };
}

export const mockGameReview = getMockGameReview();
