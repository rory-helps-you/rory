"use client";

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { StaffForm } from "./staff-form";
import { SlotCalendar } from "@/components/staff-slots/slot-calendar";
import { SlotForm } from "@/components/staff-slots/slot-form";
import { SlotList } from "@/components/staff-slots/slot-list";
import type { StaffWithCounts } from "./types";
import type { StaffSlot } from "@/components/staff-slots/types";

export function StaffDrawer({
  staff,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onMutate,
}: {
  staff?: StaffWithCounts;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMutate?: () => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;
  const isMobile = useIsMobile();
  const isEdit = !!staff;
  const formKeyRef = React.useRef(0);
  if (open) {
    formKeyRef.current;
  }
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) formKeyRef.current += 1;
      setOpen(next);
    },
    [setOpen]
  );

  // --- Slot management state (edit mode only) ---
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [slots, setSlots] = React.useState<StaffSlot[]>([]);

  const fetchSlots = React.useCallback(async () => {
    if (!staff) return;
    const from = startOfMonth(currentMonth).toISOString();
    const to = endOfMonth(currentMonth).toISOString();
    try {
      const res = await fetch(
        `/api/staff-slots?staffId=${staff.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch {
      // ignore
    }
  }, [staff, currentMonth]);

  React.useEffect(() => {
    if (open && isEdit) {
      fetchSlots();
    }
  }, [open, isEdit, fetchSlots]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setSelectedDate(null);
  };

  const handleSlotMutate = () => {
    fetchSlots();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger nativeButton={false} render={<span />}>{trigger}</SheetTrigger>}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isEdit ? "sm:max-w-lg" : undefined}
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? "担当者編集" : "新規担当者"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "担当者情報を変更して更新してください"
              : "担当者情報を入力してください"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <StaffForm
            key={staff?.id ?? `new-${formKeyRef.current}`}
            staff={staff}
            onSuccess={() => handleOpenChange(false)}
            onMutate={onMutate}
          />

          {isEdit && staff && (
            <>
              <Separator />
              <div className="text-sm font-medium">スロット管理</div>
              <SlotCalendar
                slots={slots}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onMonthChange={handleMonthChange}
                onDateClick={setSelectedDate}
              />
              {selectedDate && (
                <>
                  <Separator />
                  <SlotForm
                    staffId={staff.id}
                    selectedDate={selectedDate}
                    onMutate={handleSlotMutate}
                  />
                  <SlotList
                    slots={slots}
                    selectedDate={selectedDate}
                    onMutate={handleSlotMutate}
                  />
                </>
              )}
            </>
          )}
        </div>
        <SheetFooter>
          <SheetClose
            render={
              <Button variant="outline">キャンセル</Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
