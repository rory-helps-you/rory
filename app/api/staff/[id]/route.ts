import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffSchema } from "@/lib/validations/staff";

type Params = { params: Promise<{ id: string }> };

// ---------- GET /api/staff/[id] ----------
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { dateTime: "desc" },
      },
      _count: { select: { reservations: true } },
    },
  });

  if (!staff) {
    return NextResponse.json(
      { success: false, error: "担当者が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json(staff);
}

// ---------- PUT /api/staff/[id] ----------
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const parsed = staffSchema.safeParse(body);
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
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: parsed.data.name,
      },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "担当者の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// ---------- DELETE /api/staff/[id] ----------
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "担当者の削除に失敗しました" },
      { status: 500 }
    );
  }
}
