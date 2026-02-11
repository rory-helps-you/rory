"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { RESERVATION_STATUSES } from "@/lib/constants";
import { updateReservationStatus } from "@/lib/actions/reservation";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

export function ReservationStatusMenu({
  reservationId,
  currentStatus,
}: {
  reservationId: string;
  currentStatus: ReservationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const statusInfo = RESERVATION_STATUSES[currentStatus];

  const handleStatusChange = (newStatus: ReservationStatus) => {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await updateReservationStatus(reservationId, newStatus);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Badge
            variant={statusInfo.variant}
            className={isPending ? "opacity-50" : "cursor-pointer"}
          />
        }
      >
        {statusInfo.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(
          Object.entries(RESERVATION_STATUSES) as [
            ReservationStatus,
            (typeof RESERVATION_STATUSES)[ReservationStatus],
          ][]
        ).map(([key, { label }]) => (
          <DropdownMenuItem
            key={key}
            disabled={key === currentStatus}
            onClick={() => handleStatusChange(key)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
