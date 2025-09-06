import { z } from "zod";

// Project schema
export const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  description: z.string().optional(),
});

export type ProjectType = z.infer<typeof ProjectSchema>;
