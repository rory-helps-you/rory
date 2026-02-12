"use client";

import { useState } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ReservationCalendar } from "@/components/reservations/reservation-calendar";
import { ReservationDrawer } from "@/components/reservations/reservation-drawer";
import type { ReservationWithCustomer } from "@/components/reservations/types";

export function ScheduleClient({
  reservations,
  onMutate,
}: {
  reservations: ReservationWithCustomer[];
  onMutate?: () => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm font-medium min-w-24 text-center">
            {format(currentMonth, "yyyy年M月", { locale: ja })}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <ReservationDrawer
          trigger={
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
              <PlusIcon />
              <span className="hidden lg:inline">新規予約</span>
            </Button>
          }
          onMutate={onMutate}
        />
      </div>
      <div className="flex flex-1 px-4 lg:px-6 pb-4 lg:pb-6">
        <ReservationCalendar
          reservations={reservations}
          currentMonth={currentMonth}
        />
      </div>
    </div>
  );
}
