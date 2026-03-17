import { ConversationContext } from "@/types";

export interface PracticeScenario {
    id: string;
    title: string;
    counterpartName: string;
    avatar: string;
    vibe: string;
    context: ConversationContext;
    setup: string;
    objective: string;
    openingLine: string;
    systemPrompt: string;
    baseElo: number;
}

export const practiceScenarios: PracticeScenario[] = [
    {
        id: "manager-raise",
        title: "Ask For A Raise",
        counterpartName: "Dana",
        avatar: "💼",
        vibe: "Busy Manager",
        context: "career",
        setup: "You had a strong quarter and want to open a real compensation conversation without sounding entitled or vague.",
        objective: "Get your manager to agree to a focused follow-up conversation about scope and compensation.",
        openingLine: "You are reaching out after a strong quarter and want to start the conversation well.",
        systemPrompt: "You are Dana, the user's manager. You are fair but busy, and you will only take the request seriously if it is specific, professional, and grounded in impact. Keep replies brief and realistic.",
        baseElo: 700,
    },
    {
        id: "coffee-chat",
        title: "Land The Coffee Chat",
        counterpartName: "Miles",
        avatar: "☕",
        vibe: "Warm But Busy Operator",
        context: "networking",
        setup: "You met this person briefly at an event and want to turn that into a real coffee chat without sounding transactional.",
        objective: "Get a concrete yes to a short coffee chat or intro call.",
        openingLine: "You are following up after a brief but positive interaction.",
        systemPrompt: "You are Miles, a helpful but busy product leader. You are open to meeting people, but you respond best to messages that are warm, concise, and respectful of your time.",
        baseElo: 850,
    },
    {
        id: "favor-request",
        title: "Ask For A Favor",
        counterpartName: "Nina",
        avatar: "🫶",
        vibe: "Supportive Friend With Limits",
        context: "friends-family",
        setup: "You need help this weekend and want to ask in a way that is considerate, direct, and low-pressure.",
        objective: "Ask for help clearly without making the other person feel cornered.",
        openingLine: "You need a favor, but you want to keep the relationship feeling easy.",
        systemPrompt: "You are Nina, a good friend who wants to help when possible but has your own schedule and boundaries. Reply naturally and reward messages that are considerate and clear.",
        baseElo: 950,
    },
    {
        id: "date-lock-in",
        title: "Lock In The Date",
        counterpartName: "Jules",
        avatar: "✨",
        vibe: "Interested But Reading The Vibe",
        context: "dating",
        setup: "The energy is decent, but nothing is locked in yet. You want to move from banter to a real plan without fumbling the timing.",
        objective: "Get from open-ended chat to a concrete date plan.",
        openingLine: "You have a decent vibe going and need to make a smooth move.",
        systemPrompt: "You are Jules. You are interested, but you are turned off by awkward, try-hard, or low-effort messages. Keep your replies short and natural like real texting.",
        baseElo: 1100,
    },
    {
        id: "deadline-negotiation",
        title: "Push The Deadline",
        counterpartName: "Rae",
        avatar: "📅",
        vibe: "Client Under Pressure",
        context: "negotiation",
        setup: "A deadline is tight and you need more room, but you want to preserve goodwill and avoid sounding flaky.",
        objective: "Negotiate a better timeline while keeping the other person engaged.",
        openingLine: "You need to ask for more time without losing leverage.",
        systemPrompt: "You are Rae, a client under deadline pressure. You value directness and solutions. You will respond well to composed, specific messages that make the path forward easy to understand.",
        baseElo: 1300,
    },
];
