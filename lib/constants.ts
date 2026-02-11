export const SERVICE_MENUS = [
  { value: "カット", label: "カット" },
  { value: "カラー", label: "カラー" },
  { value: "パーマ", label: "パーマ" },
  { value: "トリートメント", label: "トリートメント" },
  { value: "カット+カラー", label: "カット+カラー" },
  { value: "カット+パーマ", label: "カット+パーマ" },
  { value: "カット+トリートメント", label: "カット+トリートメント" },
  { value: "縮毛矯正", label: "縮毛矯正" },
  { value: "ヘッドスパ", label: "ヘッドスパ" },
  { value: "その他", label: "その他" },
] as const;

export const RESERVATION_STATUSES = {
  CONFIRMED: { label: "予約確定", variant: "default" as const },
  COMPLETED: { label: "来店済み", variant: "secondary" as const },
  CANCELLED: { label: "キャンセル", variant: "outline" as const },
  NO_SHOW: { label: "無断キャンセル", variant: "destructive" as const },
} as const;

export const RISK_LEVELS = {
  LOW: { label: "低", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  MEDIUM: { label: "中", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  HIGH: { label: "高", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
} as const;

export type ReservationStatusKey = keyof typeof RESERVATION_STATUSES;
export type RiskLevelKey = keyof typeof RISK_LEVELS;
