"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
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
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-end px-4 lg:px-6">
        <ReservationDrawer
          trigger={
            <Button variant="outline" size="sm">
              <PlusIcon />
              <span className="hidden lg:inline">新規予約</span>
            </Button>
          }
          onMutate={onMutate}
        />
      </div>
      <div className="flex flex-1 px-4 lg:px-6 pb-4 lg:pb-6">
        <ReservationCalendar reservations={reservations} />
      </div>
    </div>
  );
}
