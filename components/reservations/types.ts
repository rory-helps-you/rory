import type { Customer, Reservation } from "@/lib/generated/prisma/client";

export type ReservationWithCustomer = Reservation & {
  customer: Customer;
};
