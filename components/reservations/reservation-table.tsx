"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  LoaderIcon,
  CircleXIcon,
  CircleAlertIcon,
} from "lucide-react";
import { RESERVATION_STATUSES, RISK_LEVELS } from "@/lib/constants";
import { ReservationStatusMenu } from "./reservation-status-menu";
import { ReservationDeleteDialog } from "./reservation-delete-dialog";
import { ReservationDrawer } from "./reservation-drawer";
import type { ReservationWithCustomer } from "./types";

const statusIcons: Record<string, React.ReactNode> = {
  CONFIRMED: <LoaderIcon />,
  COMPLETED: <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />,
  CANCELLED: <CircleXIcon className="fill-muted-foreground/40" />,
  NO_SHOW: <CircleAlertIcon className="fill-red-500 dark:fill-red-400" />,
};

function RowActions({
  reservation,
  onMutate,
}: {
  reservation: ReservationWithCustomer;
  onMutate?: () => void;
}) {
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-end">
      <ReservationStatusMenu
        reservationId={reservation.id}
        currentStatus={reservation.status}
        onMutate={onMutate}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="data-open:bg-muted text-muted-foreground flex size-8"
              size="icon"
            />
          }
        >
          <EllipsisVerticalIcon />
          <span className="sr-only">メニューを開く</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            編集
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ReservationDeleteDialog
            reservationId={reservation.id}
            onMutate={onMutate}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <ReservationDrawer
        reservation={reservation}
        open={editOpen}
        onOpenChange={setEditOpen}
        onMutate={onMutate}
      />
    </div>
  );
}

function createColumns(onMutate?: () => void): ColumnDef<ReservationWithCustomer>[] {
  return [
    {
      accessorKey: "dateTime",
      header: "日時",
      cell: ({ row }) => (
        <span className="font-medium">
          {format(new Date(row.original.dateTime), "M/d (E) HH:mm", {
            locale: ja,
          })}
        </span>
      ),
    },
    {
      id: "customerName",
      accessorFn: (row) => row.customer.name,
      header: "顧客名",
      cell: ({ row }) => row.original.customer.name,
    },
    {
      id: "customerPhone",
      accessorFn: (row) => row.customer.phone,
      header: "電話番号",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.customer.phone}
        </span>
      ),
    },
    {
      accessorKey: "menu",
      header: "メニュー",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.menu}
        </Badge>
      ),
    },
    {
      accessorKey: "riskLevel",
      header: "リスク",
      cell: ({ row }) => {
        const riskInfo = RISK_LEVELS[row.original.riskLevel];
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${riskInfo.className}`}
          >
            {riskInfo.label}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "ステータス",
      cell: ({ row }) => {
        const statusInfo = RESERVATION_STATUSES[row.original.status];
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {statusIcons[row.original.status]}
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions reservation={row.original} onMutate={onMutate} />
      ),
    },
  ];
}

export function ReservationTable({
  reservations,
  onMutate,
}: {
  reservations: ReservationWithCustomer[];
  onMutate?: () => void;
}) {
  const columns = React.useMemo(() => createColumns(onMutate), [onMutate]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: reservations,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  予約がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredRowModel().rows.length} 件の予約
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              表示件数
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            ページ {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">最初のページへ</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">前のページへ</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">次のページへ</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">最後のページへ</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
