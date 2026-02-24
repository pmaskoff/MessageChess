import { z } from "zod";

export const moveLabels = [
  "book move",
  "good move",
  "great move",
  "excellent move",
  "best move",
  "brilliant move",
  "inaccuracy",
  "mistake",
  "blunder",
] as const;

export const MoveLabelEnum = z.enum(moveLabels);
export type MoveLabel = z.infer<typeof MoveLabelEnum>;

export const MessageSchema = z.object({
  id: z.string(),
  speaker: z.enum(["you", "them", "unknown"]),
  text: z.string(),
  timestamp: z.string().nullable(),
  isUser: z.boolean(),
});
export type Message = z.infer<typeof MessageSchema>;

export const MessageReviewSchema = z.object({
  messageId: z.string(),
  moveNumber: z.number(),
  label: MoveLabelEnum,
  evalDelta: z.number(),
  evalAfter: z.number(),
  explanation: z.string(),
  suggestedReply: z.string().nullable(),
});
export type MessageReview = z.infer<typeof MessageReviewSchema>;

export const CriticalMomentSchema = z.object({
  moveNumber: z.number(),
  messageId: z.string(),
  label: MoveLabelEnum,
  headline: z.string(),
  explanation: z.string(),
  betterLine: z.string(),
});
export type CriticalMoment = z.infer<typeof CriticalMomentSchema>;

export const LabelCountsSchema = z.object({
  "book move": z.number(),
  "good move": z.number(),
  "great move": z.number(),
  "excellent move": z.number(),
  "best move": z.number(),
  "brilliant move": z.number(),
  "inaccuracy": z.number(),
  "mistake": z.number(),
  "blunder": z.number(),
});

export const SuggestedReplySchema = z.object({
  messageId: z.string(),
  moveNumber: z.number(),
  original: z.string(),
  suggestion: z.string(),
  reason: z.string(),
});

export const GameReviewSchema = z.object({
  id: z.string(),
  createdAt: z.string(), // ISO string usually
  messages: z.array(MessageSchema),
  players: z.object({
    you: z.object({ name: z.string(), accuracy: z.number() }),
    them: z.object({ name: z.string(), accuracy: z.number() }),
  }),
  openingName: z.string(),
  overallCoachSummary: z.string(),
  evalSeries: z.array(
    z.object({
      moveNumber: z.number(),
      eval: z.number(),
      label: MoveLabelEnum.nullable(),
    })
  ),
  messageReviews: z.array(MessageReviewSchema),
  criticalMoments: z.array(CriticalMomentSchema),
  labelCounts: z.object({
    you: LabelCountsSchema,
    them: LabelCountsSchema,
  }),
  suggestedReplies: z.array(SuggestedReplySchema),
  suggestedNextMove: z.string().nullable(),
});
export type GameReview = z.infer<typeof GameReviewSchema>;
