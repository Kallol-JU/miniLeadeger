import { z } from "zod";

// coerce: multipart/form-data sends every field as a string
export const createLoanSchema = z.object({
  friendName: z.string().trim().min(1, "Friend name required").max(100),
  amount: z.coerce.number().positive("Amount must be positive").max(1e9),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine((s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s), "Invalid date"),
});
export type CreateLoanInput = z.infer<typeof createLoanSchema>;
