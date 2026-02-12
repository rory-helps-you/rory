"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import { StaffTable } from "./staff-table";
import { StaffDrawer } from "./staff-drawer";
import type { StaffWithCounts } from "./types";

export function StaffListClient({
  staff,
  onMutate,
  search,
  onSearchChange,
}: {
  staff: StaffWithCounts[];
  onMutate?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="名前で検索"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <StaffDrawer
          trigger={
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
              <PlusIcon />
              <span className="hidden lg:inline">新規担当者</span>
            </Button>
          }
          onMutate={onMutate}
        />
      </div>
      <div className="px-4 lg:px-6">
        <StaffTable staff={staff} onMutate={onMutate} />
      </div>
    </div>
  );
}
