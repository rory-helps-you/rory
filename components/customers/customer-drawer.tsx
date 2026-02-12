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
import { CustomerForm } from "./customer-form";
import type { CustomerWithCounts } from "./types";

export function CustomerDrawer({
  customer,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onMutate,
}: {
  customer?: CustomerWithCounts;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMutate?: () => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;
  const isMobile = useIsMobile();
  const isEdit = !!customer;
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
          <SheetTitle>{isEdit ? "顧客編集" : "新規顧客"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "顧客情報を変更して更新してください"
              : "顧客情報を入力してください"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <CustomerForm
            key={customer?.id ?? `new-${formKeyRef.current}`}
            customer={customer}
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
