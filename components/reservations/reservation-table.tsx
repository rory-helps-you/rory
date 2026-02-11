"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon } from "lucide-react";
import { RISK_LEVELS } from "@/lib/constants";
import { ReservationStatusMenu } from "./reservation-status-menu";
import { ReservationDeleteDialog } from "./reservation-delete-dialog";
import type { ReservationWithCustomer } from "./types";

export function ReservationTable({
  reservations,
}: {
  reservations: ReservationWithCustomer[];
}) {
  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>予約がありません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日時</TableHead>
          <TableHead>顧客名</TableHead>
          <TableHead className="hidden sm:table-cell">電話番号</TableHead>
          <TableHead>メニュー</TableHead>
          <TableHead>リスク</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((r) => {
          const riskInfo = RISK_LEVELS[r.riskLevel];
          return (
            <TableRow key={r.id}>
              <TableCell>
                {format(new Date(r.dateTime), "M/d (E) HH:mm", {
                  locale: ja,
                })}
              </TableCell>
              <TableCell className="font-medium">
                {r.customer.name}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {r.customer.phone}
              </TableCell>
              <TableCell>{r.menu}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${riskInfo.className}`}
                >
                  {riskInfo.label}
                </span>
              </TableCell>
              <TableCell>
                <ReservationStatusMenu
                  reservationId={r.id}
                  currentStatus={r.status}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    render={<Link href={`/reservations/${r.id}/edit`} />}
                  >
                    <PencilIcon className="size-3.5 text-muted-foreground" />
                  </Button>
                  <ReservationDeleteDialog reservationId={r.id} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
