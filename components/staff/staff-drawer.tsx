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
import { StaffForm } from "./staff-form";
import type { StaffWithCounts } from "./types";

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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger nativeButton={false} render={<span />}>{trigger}</SheetTrigger>}
      <SheetContent side={isMobile ? "bottom" : "right"}>
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
