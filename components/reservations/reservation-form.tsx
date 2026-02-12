"use client";

import { useState } from "react";
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
import type { ReservationWithCustomer } from "./types";

type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export function ReservationForm({
  reservation,
  onSuccess,
  onMutate,
}: {
  reservation?: ReservationWithCustomer;
  onSuccess?: () => void;
  onMutate?: () => void;
}) {
  const [state, setState] = useState<ActionState>({ success: false });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false });

    const formData = new FormData(e.currentTarget);
    const body = {
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      dateTime: formData.get("dateTime") as string,
      menu: formData.get("menu") as string,
      note: formData.get("note") as string,
    };

    try {
      const url = reservation
        ? `/api/reservations/${reservation.id}`
        : "/api/reservations";
      const method = reservation ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          success: false,
          error: data.error,
          fieldErrors: data.fieldErrors,
        });
        return;
      }

      setState({ success: true });
      onMutate?.();
      onSuccess?.();
    } catch {
      setState({ success: false, error: "予約の保存に失敗しました" });
    } finally {
      setIsPending(false);
    }
  };

  const defaultDateTime = reservation
    ? new Date(reservation.dateTime).toISOString().slice(0, 16)
    : "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-3">
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

      <div className="flex flex-col gap-3">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
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

        <div className="flex flex-col gap-3">
          <Label htmlFor="menu">メニュー</Label>
          <Select name="menu" defaultValue={reservation?.menu ?? ""} required>
            <SelectTrigger className="w-full" id="menu">
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
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="note">メモ</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={reservation?.note ?? ""}
          placeholder="備考があれば入力してください"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "保存中..."
          : reservation
            ? "更新する"
            : "予約を作成"}
      </Button>
    </form>
  );
}
