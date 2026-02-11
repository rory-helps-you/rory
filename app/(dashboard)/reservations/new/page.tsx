import { PageHeader } from "@/components/page-header";
import { ReservationForm } from "@/components/reservations/reservation-form";

export default function NewReservationPage() {
  return (
    <>
      <PageHeader
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: "予約管理", href: "/reservations" },
          { label: "新規予約" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-lg font-semibold">新規予約</h1>
        <ReservationForm />
      </div>
    </>
  );
}
