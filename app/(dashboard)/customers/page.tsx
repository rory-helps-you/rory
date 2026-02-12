import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { CustomersContent } from "./customers-content";
import { CustomerTableSkeleton } from "@/components/customers/customer-table-skeleton";

export default function CustomersPage() {
  return (
    <>
      <SiteHeader title="顧客管理" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Suspense fallback={<CustomerTableSkeleton />}>
              <CustomersContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
