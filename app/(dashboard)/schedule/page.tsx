"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ScheduleClient } from "@/components/schedule/schedule-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReservationWithCustomer } from "@/components/reservations/types";

export default function SchedulePage() {
  const [reservations, setReservations] = useState<ReservationWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return (
    <>
      <SiteHeader title="スケジュール" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            {loading ? (
              <div className="flex flex-1 flex-col gap-4 px-4 lg:px-6">
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-28" />
                </div>
                <Skeleton className="flex-1 rounded-lg" />
              </div>
            ) : (
              <ScheduleClient
                reservations={reservations}
                onMutate={fetchReservations}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
