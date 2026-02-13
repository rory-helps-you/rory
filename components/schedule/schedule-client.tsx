"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { StaffSlot } from "@/components/staff-slots/types";

type Staff = { id: string; name: string };
type ReservationData = {
  id: string;
  staffId: string | null;
  dateTime: string;
  duration: number;
  menu: string;
  customer: { name: string };
};

// 30分刻みの時間ラベル生成 (例: "09:00", "09:30", ... "21:00")
function generateTimeSlots(startHour: number, endHour: number) {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < endHour) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots(9, 21);

export function ScheduleClient() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<StaffSlot[]>([]);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (staffList.length === 0) return;
    setLoading(true);
    const from = weekStart.toISOString();
    const to = weekEnd.toISOString();
    try {
      const [slotsResults, reservationsRes] = await Promise.all([
        Promise.all(
          staffList.map(async (s) => {
            const res = await fetch(
              `/api/staff-slots?staffId=${s.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            );
            if (res.ok) return res.json();
            return [];
          })
        ),
        fetch(
          `/api/reservations?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        ),
      ]);
      setSlots(slotsResults.flat());
      if (reservationsRes.ok) {
        setReservations(await reservationsRes.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [staffList, weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasSlot = (staffId: string, date: Date, time: string) => {
    const [h, m] = time.split(":").map(Number);
    return slots.some((s) => {
      const startAt = new Date(s.startAt);
      return (
        s.staffId === staffId &&
        isSameDay(startAt, date) &&
        startAt.getHours() === h &&
        startAt.getMinutes() === m
      );
    });
  };

  const getReservation = (staffId: string, date: Date, time: string) => {
    const [h, m] = time.split(":").map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(h, m, 0, 0);
    const slotMs = slotTime.getTime();

    return reservations.find((r) => {
      if (r.staffId !== staffId) return false;
      const resStart = new Date(r.dateTime).getTime();
      const resEnd = resStart + r.duration * 60 * 1000;
      return slotMs >= resStart && slotMs < resEnd;
    });
  };

  // Returns: "first" (render merged cell), "continuation" (skip), or null (no reservation)
  const getSlotRole = (staffId: string, date: Date, time: string) => {
    const res = getReservation(staffId, date, time);
    if (!res) return null;
    const resStart = new Date(res.dateTime);
    const [h, m] = time.split(":").map(Number);
    if (resStart.getHours() === h && resStart.getMinutes() === m) {
      return "first" as const;
    }
    return "continuation" as const;
  };

  const getRowSpan = (reservation: ReservationData) => {
    return Math.max(1, reservation.duration / 30);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm font-medium min-w-48 text-center">
            {format(weekStart, "yyyy年M月d日", { locale: ja })} 〜{" "}
            {format(weekEnd, "M月d日", { locale: ja })}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentDate(new Date());
            setSelectedDate(new Date());
          }}
        >
          今日
        </Button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 px-4 lg:px-6">
        {weekDays.map((day) => {
          const active = isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className={`font-medium ${!active && today ? "text-primary" : ""}`}>
                {format(day, "E", { locale: ja })}
              </span>
              <span className={`text-[11px] ${active ? "" : "text-muted-foreground"} ${!active && today ? "text-primary font-medium" : ""}`}>
                {format(day, "M/d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timetable */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 pb-4 lg:pb-6">
        {loading ? (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border-r px-3 py-2 w-16 sticky left-0 bg-muted/50">
                    <Skeleton className="h-4 w-10" />
                  </th>
                  {[1, 2, 3].map((i) => (
                    <th key={i} className="border-r last:border-r-0 px-3 py-2 min-w-24">
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => {
                  const isHour = time.endsWith(":00");
                  return (
                    <tr
                      key={time}
                      className={isHour ? "border-t" : "border-t border-dashed"}
                    >
                      <td className="border-r px-3 w-16 h-[34px] align-middle sticky left-0 bg-background">
                        {isHour && <Skeleton className="h-3 w-10" />}
                      </td>
                      {[1, 2, 3].map((i) => (
                        <td
                          key={i}
                          className="border-r last:border-r-0 px-3 text-center h-[34px] align-middle"
                        >
                          <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            担当者が登録されていません
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border-r px-3 py-2 text-left text-xs font-medium text-muted-foreground w-16 sticky left-0 bg-muted/50">
                    時間
                  </th>
                  {staffList.map((staff) => (
                    <th
                      key={staff.id}
                      className="border-r last:border-r-0 px-3 py-2 text-center text-xs font-medium min-w-24"
                    >
                      {staff.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => {
                  const isHour = time.endsWith(":00");
                  return (
                    <tr
                      key={time}
                      className={isHour ? "border-t" : "border-t border-dashed"}
                    >
                      <td className="border-r px-3 text-xs text-muted-foreground w-16 h-[34px] align-middle sticky left-0 bg-background">
                        {isHour ? time : ""}
                      </td>
                      {staffList.map((staff) => {
                        const available = hasSlot(staff.id, selectedDate, time);
                        const role = available
                          ? getSlotRole(staff.id, selectedDate, time)
                          : null;

                        // Skip rendering — this cell is covered by a rowSpan above
                        if (role === "continuation") return null;

                        if (role === "first") {
                          const reservation = getReservation(staff.id, selectedDate, time)!;
                          const span = getRowSpan(reservation);
                          return (
                            <td
                              key={staff.id}
                              rowSpan={span}
                              className="border-r last:border-r-0 p-1 align-top"
                              style={{ height: `${span * 34}px` }}
                            >
                              <div className="h-full rounded-md border border-primary/20 bg-primary/5 px-2 py-1 flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-primary truncate">
                                  {reservation.customer.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {reservation.menu}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={staff.id}
                            className={`border-r last:border-r-0 px-3 text-center h-[34px] align-middle ${
                              !available ? "bg-muted/40" : ""
                            }`}
                          >
                            {available && (
                              <span className="inline-flex items-center justify-center size-5 rounded-full border text-xs text-muted-foreground">
                                ○
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
