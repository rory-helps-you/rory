import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations/reservation";
import { calculateRisk } from "@/lib/risk";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

// ---------- GET /api/reservations ----------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as ReservationStatus | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.dateTime = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: { customer: true, staff: true },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(reservations);
}

// ---------- POST /api/reservations ----------
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "入力内容に誤りがあります",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
      { status: 400 }
    );
  }

  try {
    const sortedSlots = [...parsed.data.slotStartTimes].sort();
    const dateTime = new Date(sortedSlots[0]);
    const duration = sortedSlots.length * 30;

    const customer = await prisma.customer.upsert({
      where: { phone: parsed.data.customerPhone },
      update: { name: parsed.data.customerName },
      create: {
        name: parsed.data.customerName,
        phone: parsed.data.customerPhone,
      },
    });

    const risk = calculateRisk({
      cancelCount: customer.cancelCount,
      noShowCount: customer.noShowCount,
      visitCount: customer.visitCount,
      lastVisitAt: customer.lastVisitAt,
    });

    const reservation = await prisma.reservation.create({
      data: {
        customerId: customer.id,
        staffId: parsed.data.staffId,
        dateTime,
        duration,
        menu: parsed.data.menu,
        note: parsed.data.note,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
      include: { customer: true },
    });

    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}
