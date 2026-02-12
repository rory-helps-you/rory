"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { RESERVATION_STATUSES } from "@/lib/constants";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

export function ReservationStatusMenu({
  reservationId,
  currentStatus,
  onMutate,
}: {
  reservationId: string;
  currentStatus: ReservationStatus;
  onMutate?: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const statusInfo = RESERVATION_STATUSES[currentStatus];

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (newStatus === currentStatus) return;
    setIsPending(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onMutate?.();
      }
    } catch {
      // silently fail
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
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
