import { z } from "zod/v4";

export const staffSchema = z.object({
  name: z
    .string()
    .min(1, "担当者名を入力してください"),
});

export type StaffFormData = z.infer<typeof staffSchema>;
