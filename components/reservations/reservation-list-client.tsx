"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ReservationTable } from "./reservation-table";
import { ReservationFilters } from "./reservation-filters";
import { ReservationDrawer } from "./reservation-drawer";
import type { ReservationWithCustomer } from "./types";

export function ReservationListClient({
  reservations,
}: {
  reservations: ReservationWithCustomer[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <ReservationFilters />
        <ReservationDrawer
          trigger={
            <Button variant="outline" size="sm">
              <PlusIcon />
              <span className="hidden lg:inline">新規予約</span>
            </Button>
          }
        />
      </div>
      <div className="px-4 lg:px-6">
        <ReservationTable reservations={reservations} />
      </div>
    </div>
  );
}
