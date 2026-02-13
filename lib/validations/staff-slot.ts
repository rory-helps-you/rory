import { z } from "zod/v4";

export const staffSlotSchema = z
  .object({
    staffId: z.string().min(1, "担当者IDは必須です"),
    date: z.string().min(1, "日付は必須です"),
    startTime: z.string().min(1, "開始時間は必須です"),
    endTime: z.string().min(1, "終了時間は必須です"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "終了時間は開始時間より後にしてください",
    path: ["endTime"],
  });

export type StaffSlotFormData = z.infer<typeof staffSlotSchema>;
