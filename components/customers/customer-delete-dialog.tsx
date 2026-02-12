"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Reservation } from "@/lib/generated/prisma/client";

export function CustomerDeleteDialog({
  customerId,
  customerName,
  open,
  onOpenChange,
  onMutate,
}: {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMutate?: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setReservations(data.reservations ?? []);
      })
      .catch(() => {
        setReservations([]);
      })
      .finally(() => setLoading(false));
  }, [open, customerId]);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onOpenChange(false);
        onMutate?.();
      }
    } catch {
      // silently fail
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            「{customerName}」を削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。顧客データが完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loading ? (
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        ) : reservations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-destructive">
              以下の予約（{reservations.length}件）も一緒に削除されます:
            </p>
            <ul className="max-h-40 overflow-y-auto rounded-md border p-2 text-sm">
              {reservations.map((r) => (
                <li key={r.id} className="flex items-center gap-2 py-1">
                  <span>
                    {format(new Date(r.dateTime), "yyyy/M/d (E) HH:mm", {
                      locale: ja,
                    })}
                  </span>
                  <span className="text-muted-foreground">- {r.menu}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || loading}
          >
            {isPending ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
