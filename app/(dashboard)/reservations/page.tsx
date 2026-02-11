import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
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
      <PageHeader
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: "予約管理" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">予約管理</h1>
          <Button render={<Link href="/reservations/new" />}>
            <PlusIcon />
            新規予約
          </Button>
        </div>
        <ReservationListClient reservations={reservations} />
      </div>
    </>
  );
}
