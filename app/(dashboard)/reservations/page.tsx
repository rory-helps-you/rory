import { SiteHeader } from "@/components/site-header";
import { getReservations } from "@/lib/actions/reservation";
import { ReservationListClient } from "@/components/reservations/reservation-list-client";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const reservations = await getReservations({
    status: params.status as ReservationStatus | undefined,
    from: params.from,
    to: params.to,
  });

  return (
    <>
      <SiteHeader title="予約管理" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ReservationListClient reservations={reservations} />
          </div>
        </div>
      </div>
    </>
  );
}
