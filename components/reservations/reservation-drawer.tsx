"use client";

import * as React from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ReservationForm } from "./reservation-form";
import type { ReservationWithCustomer } from "./types";

export function ReservationDrawer({
  reservation,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  reservation?: ReservationWithCustomer;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;
  const isMobile = useIsMobile();
  const isEdit = !!reservation;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger render={<span />}>{trigger}</SheetTrigger>}
      <SheetContent side={isMobile ? "bottom" : "right"}>
        <SheetHeader>
          <SheetTitle>{isEdit ? "予約編集" : "新規予約"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "予約内容を変更して更新してください"
              : "予約情報を入力してください"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <ReservationForm
            key={reservation?.id ?? "new"}
            reservation={reservation}
            onSuccess={() => setOpen(false)}
          />
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
