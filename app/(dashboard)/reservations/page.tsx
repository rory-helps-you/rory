import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { ReservationsContent } from "./reservations-content";
import { ReservationTableSkeleton } from "@/components/reservations/reservation-table-skeleton";

export default function ReservationsPage() {
  return (
    <>
      <SiteHeader title="予約管理" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Suspense fallback={<ReservationTableSkeleton />}>
              <ReservationsContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
