import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations/reservation";
import { calculateRisk } from "@/lib/risk";

type Params = { params: Promise<{ id: string }> };

// ---------- GET /api/reservations/[id] ----------
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

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

  return NextResponse.json(reservation);
}

// ---------- PUT /api/reservations/[id] ----------
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
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

    await prisma.customer.update({
      where: { id: reservation.customerId },
      data: {
        name: parsed.data.customerName,
        phone: parsed.data.customerPhone,
      },
    });

    const customer = await prisma.customer.findUnique({
      where: { id: reservation.customerId },
    });
    const risk = calculateRisk({
      cancelCount: customer!.cancelCount,
      noShowCount: customer!.noShowCount,
      visitCount: customer!.visitCount,
      lastVisitAt: customer!.lastVisitAt,
    });

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        dateTime: new Date(parsed.data.dateTime),
        menu: parsed.data.menu,
        note: parsed.data.note,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
      include: { customer: true },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "予約の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// ---------- DELETE /api/reservations/[id] ----------
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "予約の削除に失敗しました" },
      { status: 500 }
    );
  }
}
