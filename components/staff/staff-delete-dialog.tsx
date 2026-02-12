"use client";

import { useEffect, useState } from "react";
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

export function StaffDeleteDialog({
  staffId,
  staffName,
  open,
  onOpenChange,
  onMutate,
}: {
  staffId: string;
  staffName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMutate?: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [reservationCount, setReservationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/staff/${staffId}`)
      .then((res) => res.json())
      .then((data) => {
        setReservationCount(data._count?.reservations ?? 0);
      })
      .catch(() => {
        setReservationCount(0);
      })
      .finally(() => setLoading(false));
  }, [open, staffId]);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
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
            「{staffName}」を削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。担当者データが完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loading ? (
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        ) : reservationCount > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-destructive">
              この担当者には {reservationCount} 件の予約が紐づいています。削除すると予約から担当者が外れます。
            </p>
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
