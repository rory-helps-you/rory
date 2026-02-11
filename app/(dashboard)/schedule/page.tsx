import { SiteHeader } from "@/components/site-header";
import { getReservations } from "@/lib/actions/reservation";
import { ScheduleClient } from "@/components/schedule/schedule-client";

export default async function SchedulePage() {
  const reservations = await getReservations({});

  return (
    <>
      <SiteHeader title="スケジュール" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ScheduleClient reservations={reservations} />
          </div>
        </div>
      </div>
    </>
  );
}
