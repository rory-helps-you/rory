"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReservationListClient } from "@/components/reservations/reservation-list-client";
import { ReservationTableSkeleton } from "@/components/reservations/reservation-table-skeleton";
import type { ReservationWithCustomer } from "@/components/reservations/types";

export function ReservationsContent() {
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<ReservationWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    const params = new URLSearchParams();
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
      const res = await fetch(`/api/reservations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  if (loading) {
    return <ReservationTableSkeleton />;
  }

  return (
    <ReservationListClient
      reservations={reservations}
      onMutate={fetchReservations}
    />
  );
}
