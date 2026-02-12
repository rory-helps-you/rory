import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { StaffContent } from "./staff-content";
import { StaffTableSkeleton } from "@/components/staff/staff-table-skeleton";

export default function StaffSettingsPage() {
  return (
    <>
      <SiteHeader title="担当者管理" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Suspense fallback={<StaffTableSkeleton />}>
              <StaffContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
