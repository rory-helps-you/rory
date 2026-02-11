import { z } from "zod/v4";

export const reservationSchema = z.object({
  customerName: z
    .string()
    .min(1, "顧客名を入力してください"),
  customerPhone: z
    .string()
    .min(1, "電話番号を入力してください")
    .regex(/^[0-9\-]+$/, "正しい電話番号を入力してください"),
  dateTime: z
    .string()
    .min(1, "予約日時を入力してください"),
  menu: z
    .string()
    .min(1, "メニューを選択してください"),
  note: z
    .string()
    .optional()
    .transform((v) => v || undefined),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
