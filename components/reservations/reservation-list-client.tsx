"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListIcon, CalendarIcon } from "lucide-react";
import { ReservationTable } from "./reservation-table";
import { ReservationCalendar } from "./reservation-calendar";
import { ReservationFilters } from "./reservation-filters";
import type { ReservationWithCustomer } from "./types";

type ViewMode = "list" | "calendar";

export function ReservationListClient({
  reservations,
}: {
  reservations: ReservationWithCustomer[];
}) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ReservationFilters />
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
          >
            <ListIcon className="size-4" />
          </Button>
          <Button
            variant={view === "calendar" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("calendar")}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <ReservationTable reservations={reservations} />
      ) : (
        <ReservationCalendar reservations={reservations} />
      )}
    </div>
  );
}
