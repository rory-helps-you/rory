"use client";

import { useState } from "react";
import { format, addMinutes, isSameDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StaffSlot } from "./types";

export function SlotList({
  slots,
  selectedDate,
  onMutate,
}: {
  slots: StaffSlot[];
  selectedDate: Date;
  onMutate: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const daySlots = slots
    .filter((s) => isSameDay(new Date(s.startAt), selectedDate))
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/staff-slots/${id}`, { method: "DELETE" });
      if (res.ok) {
        onMutate();
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (daySlots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        この日のスロットはありません
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium text-muted-foreground mb-1">
        登録済みスロット（{daySlots.length}件）
      </div>
      {daySlots.map((slot) => {
        const start = new Date(slot.startAt);
        const end = addMinutes(start, 30);
        return (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
          >
            <span>
              {format(start, "HH:mm")} - {format(end, "HH:mm")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={deletingId === slot.id}
              onClick={() => handleDelete(slot.id)}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
