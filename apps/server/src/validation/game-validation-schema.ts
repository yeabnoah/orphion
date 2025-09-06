import { z } from "zod";

// Enum schema
export const GameTypesSchema = z.enum(["INDIVIDUAL", "GROUP"]);

// Project schema
export const ProjectSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z.string().optional(),
});

// Game schema
export const GameSchema = z.object({
  gameType: GameTypesSchema,
  imageUrls: z.array(z.string().url()),
  answer: z.string(),
  hint: z.string(),
  time: z.number().int(),
});

// Combined project and game schema
export const ProjectGameSchema = z.object({
  project: ProjectSchema,
  game: GameSchema,
});

export type GameType = z.infer<typeof GameSchema>;
export type ProjectType = z.infer<typeof ProjectSchema>;
export type ProjectGameType = z.infer<typeof ProjectGameSchema>;
