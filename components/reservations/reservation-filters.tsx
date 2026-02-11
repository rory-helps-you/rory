"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RESERVATION_STATUSES } from "@/lib/constants";

export function ReservationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentFrom = searchParams.get("from") ?? "";
  const currentTo = searchParams.get("to") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/reservations?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/reservations");
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">ステータス</label>
        <Select
          value={currentStatus}
          onValueChange={(v) => updateParam("status", v ?? "")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RESERVATION_STATUSES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">開始日</label>
        <Input
          type="date"
          value={currentFrom}
          onChange={(e) => updateParam("from", e.target.value)}
          className="w-[160px]"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">終了日</label>
        <Input
          type="date"
          value={currentTo}
          onChange={(e) => updateParam("to", e.target.value)}
          className="w-[160px]"
        />
      </div>

      {(currentStatus || currentFrom || currentTo) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          クリア
        </Button>
      )}
    </div>
  );
}
