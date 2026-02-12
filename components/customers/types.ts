import type { Customer } from "@/lib/generated/prisma/client";

export type CustomerWithCounts = Customer & {
  _count: {
    reservations: number;
  };
};
