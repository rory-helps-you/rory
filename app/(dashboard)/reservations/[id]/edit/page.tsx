import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { getReservation } from "@/lib/actions/reservation";

export default async function EditReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservation(id);

  if (!reservation) {
    notFound();
  }

  return (
    <>
      <PageHeader
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: "予約管理", href: "/reservations" },
          { label: "予約編集" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-lg font-semibold">予約編集</h1>
        <ReservationForm reservation={reservation} />
      </div>
    </>
  );
}
