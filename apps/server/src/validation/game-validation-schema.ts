import { z } from "zod";

// Enum schema
export const GameTypesSchema = z.enum(["INDIVIDUAL", "GROUP"]);

// Game schema
export const GameSchema = z.object({
  gameType: GameTypesSchema,
  imageUrls: z.array(z.string().url()),
  answer: z.string(),
  hint: z.string(),
  time: z.number().int(),
});

export type GameType = z.infer<typeof GameSchema>;
