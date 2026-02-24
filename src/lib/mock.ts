import { GameReview } from "@/types";

export const mockGameReview: GameReview = {
    id: "demo-mock-id",
    createdAt: new Date().toISOString(),
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
