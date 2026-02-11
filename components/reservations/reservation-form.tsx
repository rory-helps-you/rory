"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_MENUS } from "@/lib/constants";
import {
  createReservation,
  updateReservation,
  type ActionState,
} from "@/lib/actions/reservation";
import type { ReservationWithCustomer } from "./types";

const initialState: ActionState = { success: false };

export function ReservationForm({
  reservation,
}: {
  reservation?: ReservationWithCustomer;
}) {
  const router = useRouter();
  const action = reservation ? updateReservation : createReservation;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/reservations");
    }
  }, [state.success, router]);

  // Format datetime for input default value
  const defaultDateTime = reservation
    ? new Date(reservation.dateTime).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="grid gap-4 max-w-lg">
      {reservation && <input type="hidden" name="id" value={reservation.id} />}

      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="customerName">顧客名</Label>
        <Input
          id="customerName"
          name="customerName"
          defaultValue={reservation?.customer.name ?? ""}
          placeholder="山田 太郎"
          required
        />
        {state.fieldErrors?.customerName && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.customerName[0]}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="customerPhone">電話番号</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          defaultValue={reservation?.customer.phone ?? ""}
          placeholder="090-1234-5678"
          required
        />
        {state.fieldErrors?.customerPhone && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.customerPhone[0]}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dateTime">予約日時</Label>
        <Input
          id="dateTime"
          name="dateTime"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
        {state.fieldErrors?.dateTime && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.dateTime[0]}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="menu">メニュー</Label>
        <Select name="menu" defaultValue={reservation?.menu ?? ""} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="メニューを選択" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_MENUS.map((menu) => (
              <SelectItem key={menu.value} value={menu.value}>
                {menu.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.menu && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.menu[0]}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">メモ</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={reservation?.note ?? ""}
          placeholder="備考があれば入力してください"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "保存中..."
            : reservation
              ? "更新する"
              : "予約を作成"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
