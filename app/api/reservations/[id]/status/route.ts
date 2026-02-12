import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRisk } from "@/lib/risk";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

// ---------- PATCH /api/reservations/[id]/status ----------
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: ReservationStatus };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "予約が見つかりません" },
        { status: 404 }
      );
    }

    const oldStatus = reservation.status;

    const customerUpdate: Record<string, unknown> = {};

    if (status === "COMPLETED" && oldStatus !== "COMPLETED") {
      customerUpdate.visitCount = { increment: 1 };
      customerUpdate.lastVisitAt = new Date();
    }
    if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
      customerUpdate.cancelCount = { increment: 1 };
    }
    if (status === "NO_SHOW" && oldStatus !== "NO_SHOW") {
      customerUpdate.noShowCount = { increment: 1 };
    }

    if (Object.keys(customerUpdate).length > 0) {
      await prisma.customer.update({
        where: { id: reservation.customerId },
        data: customerUpdate,
      });
    }

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: reservation.customerId },
    });
    const risk = calculateRisk({
      cancelCount: updatedCustomer!.cancelCount,
      noShowCount: updatedCustomer!.noShowCount,
      visitCount: updatedCustomer!.visitCount,
      lastVisitAt: updatedCustomer!.lastVisitAt,
    });

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
      include: { customer: true },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "ステータスの更新に失敗しました" },
      { status: 500 }
    );
  }
}
