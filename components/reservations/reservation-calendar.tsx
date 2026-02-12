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
} from "date-fns";
import { RISK_LEVELS } from "@/lib/constants";
import type { ReservationWithCustomer } from "./types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function ReservationCalendar({
  reservations,
  currentMonth,
}: {
  reservations: ReservationWithCustomer[];
  currentMonth: Date;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getReservationsForDay = (day: Date) =>
    reservations.filter((r) => isSameDay(new Date(r.dateTime), day));

  const rows = days.length / 7;

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden flex-1" style={{ gridTemplateRows: `auto repeat(${rows}, 1fr)` }}>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayReservations = getReservationsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-background p-1 overflow-hidden ${
                !inMonth ? "opacity-40" : ""
              }`}
            >
              <div
                className={`mb-1 text-right text-xs ${
                  today
                    ? "inline-flex float-right size-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="clear-both space-y-0.5">
                {dayReservations.slice(0, 3).map((r) => {
                  const riskInfo = RISK_LEVELS[r.riskLevel];
                  return (
                    <div
                      key={r.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight ${riskInfo.className}`}
                    >
                      {format(new Date(r.dateTime), "HH:mm")} {r.customer.name}
                    </div>
                  );
                })}
                {dayReservations.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{dayReservations.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
