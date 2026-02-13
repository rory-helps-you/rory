"use client";

import { useCallback, useEffect, useState } from "react";
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

type Staff = { id: string; name: string };
type Slot = { id: string; staffId: string; startAt: string };
type Reservation = { id: string; staffId: string | null; dateTime: string; duration: number };

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

  // Derive initial values from existing reservation for edit mode
  const editingId = reservation?.id;

  const initialStaffId = reservation?.staffId ?? "";
  const initialDate = reservation
    ? new Date(reservation.dateTime).toLocaleDateString("sv-SE")
    : "";
  const initialSlotTimes = (() => {
    if (!reservation) return [];
    const start = new Date(reservation.dateTime);
    const count = Math.max(1, (reservation.duration ?? 30) / 30);
    const times: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = new Date(start.getTime() + i * 30 * 60 * 1000);
      times.push(t.toISOString());
    }
    return times;
  })();

  // Staff list
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState(initialStaffId);

  // Date
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Slots & reservations for the day
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  const [selectedSlotTimes, setSelectedSlotTimes] = useState<string[]>(initialSlotTimes);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [initialSlotsRestored, setInitialSlotsRestored] = useState(false);

  // Fetch staff on mount
  useEffect(() => {
    fetch("/api/staff")
      .then((res) => (res.ok ? res.json() : []))
      .then(setStaffList)
      .catch(() => {});
  }, []);

  // Fetch slots + reservations when staff & date selected
  const fetchSlots = useCallback(async () => {
    if (!selectedStaffId || !selectedDate) {
      setAvailableSlots([]);
      setExistingReservations([]);
      return;
    }

    setLoadingSlots(true);
    // Only clear selection when user actively changes staff/date, not on initial edit load
    if (initialSlotsRestored) {
      setSelectedSlotTimes([]);
    }

    const from = new Date(`${selectedDate}T00:00:00`).toISOString();
    const to = new Date(`${selectedDate}T23:59:59`).toISOString();

    try {
      const [slotsRes, reservationsRes] = await Promise.all([
        fetch(
          `/api/staff-slots?staffId=${selectedStaffId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        ),
        fetch(
          `/api/reservations?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        ),
      ]);

      const slotsData: Slot[] = slotsRes.ok ? await slotsRes.json() : [];
      const reservationsData: Reservation[] = reservationsRes.ok
        ? await reservationsRes.json()
        : [];

      setAvailableSlots(slotsData);
      setExistingReservations(reservationsData);
    } catch {
      setAvailableSlots([]);
      setExistingReservations([]);
    } finally {
      setLoadingSlots(false);
      if (!initialSlotsRestored) setInitialSlotsRestored(true);
    }
  }, [selectedStaffId, selectedDate, initialSlotsRestored]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Check if a slot time is already reserved (exclude the reservation being edited)
  const isSlotReserved = (slotTime: Date) => {
    return existingReservations.some((r) => {
      if (r.id === editingId) return false;
      if (r.staffId !== selectedStaffId) return false;
      const resStart = new Date(r.dateTime).getTime();
      const resEnd = resStart + r.duration * 60 * 1000;
      const slotStart = slotTime.getTime();
      return slotStart >= resStart && slotStart < resEnd;
    });
  };

  // Normalize to consistent ISO string for comparison
  const normalizeTime = (t: string) => new Date(t).toISOString();

  const toggleSlot = (isoTime: string) => {
    const normalized = normalizeTime(isoTime);
    setSelectedSlotTimes((prev) =>
      prev.map(normalizeTime).includes(normalized)
        ? prev.filter((t) => normalizeTime(t) !== normalized)
        : [...prev, isoTime]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false });

    const formData = new FormData(e.currentTarget);
    const body = {
      staffId: selectedStaffId,
      slotStartTimes: selectedSlotTimes,
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
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

  const formatSlotTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Step 1: Staff selection */}
      <div className="flex flex-col gap-3">
        <Label>担当者</Label>
        <Select value={selectedStaffId} onValueChange={(v) => setSelectedStaffId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="担当者を選択" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.staffId && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.staffId[0]}
          </p>
        )}
      </div>

      {/* Step 2: Date selection */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Step 3: Slot selection */}
      {selectedStaffId && selectedDate && (
        <div className="flex flex-col gap-3">
          <Label>
            空きスロット
            {selectedSlotTimes.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({selectedSlotTimes.length}枠 = {selectedSlotTimes.length * 30}分)
              </span>
            )}
          </Label>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              この日のスロットはありません
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((slot) => {
                const slotDate = new Date(slot.startAt);
                const reserved = isSlotReserved(slotDate);
                const selected = selectedSlotTimes.map(normalizeTime).includes(normalizeTime(slot.startAt));

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={reserved}
                    onClick={() => toggleSlot(slot.startAt)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      reserved
                        ? "cursor-not-allowed border-muted bg-muted text-muted-foreground line-through"
                        : selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary hover:bg-primary/10"
                    }`}
                  >
                    {formatSlotTime(slot.startAt)}
                  </button>
                );
              })}
            </div>
          )}
          {state.fieldErrors?.slotStartTimes && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.slotStartTimes[0]}
            </p>
          )}
        </div>
      )}

      {/* Step 4: Customer info */}
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
