import type { Staff } from "@/lib/generated/prisma/client";

export type StaffWithCounts = Staff & {
  _count: {
    reservations: number;
  };
};
