"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 30分刻みの選択肢を生成 ("00:00" ~ "23:30")
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

type ActionState = {
  success: boolean;
  error?: string;
};

export function SlotForm({
  staffId,
  selectedDate,
  onMutate,
}: {
  staffId: string;
  selectedDate: Date;
  onMutate: () => void;
}) {
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [state, setState] = useState<ActionState>({ success: false });
  const [isPending, setIsPending] = useState(false);

  const dateLabel = format(selectedDate, "M月d日（E）", { locale: ja });
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false });

    try {
      const res = await fetch("/api/staff-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, date: dateStr, startTime, endTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ success: false, error: data.error });
        return;
      }

      setState({ success: true });
      onMutate();
    } catch {
      setState({ success: false, error: "スロットの登録に失敗しました" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="text-sm font-medium">{dateLabel}</div>

      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">開始時間</Label>
          <Select value={startTime} onValueChange={(v) => v && setStartTime(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">終了時間</Label>
          <Select value={endTime} onValueChange={(v) => v && setEndTime(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={isPending || endTime <= startTime}>
        {isPending ? "登録中..." : "登録"}
      </Button>
    </form>
  );
}
