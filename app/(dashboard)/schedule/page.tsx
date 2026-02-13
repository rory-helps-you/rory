"use client";

import { SiteHeader } from "@/components/site-header";
import { ScheduleClient } from "@/components/schedule/schedule-client";

export default function SchedulePage() {
  return (
    <>
      <SiteHeader title="スケジュール" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ScheduleClient />
          </div>
        </div>
      </div>
    </>
  );
}
