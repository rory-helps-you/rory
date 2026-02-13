"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StaffSlot } from "./types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function SlotCalendar({
  slots,
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateClick,
}: {
  slots: StaffSlot[];
  currentMonth: Date;
  selectedDate: Date | null;
  onMonthChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSlotCountForDay = (day: Date) =>
    slots.filter((s) => isSameDay(new Date(s.startAt), day)).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-muted px-1 py-1 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const slotCount = getSlotCountForDay(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateClick(day)}
              className={`bg-background p-1 text-center transition-colors hover:bg-accent/50 ${
                !inMonth ? "opacity-40" : ""
              } ${selected ? "ring-2 ring-primary ring-inset" : ""}`}
            >
              <div
                className={`text-xs ${
                  today
                    ? "inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {format(day, "d")}
              </div>
              {slotCount > 0 && (
                <div className="text-[10px] text-primary font-medium">
                  {slotCount}件
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
