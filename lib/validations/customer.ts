import { z } from "zod/v4";

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名を入力してください"),
  phone: z
    .string()
    .min(1, "電話番号を入力してください")
    .regex(/^[0-9\-]+$/, "正しい電話番号を入力してください"),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
