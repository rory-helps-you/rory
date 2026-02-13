import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffSlotSchema } from "@/lib/validations/staff-slot";

// ---------- GET /api/staff-slots ----------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const staffId = searchParams.get("staffId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!staffId) {
    return NextResponse.json(
      { success: false, error: "staffId は必須です" },
      { status: 400 }
    );
  }

  const where: Record<string, unknown> = { staffId };

  if (from || to) {
    where.startAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const slots = await prisma.staffSlot.findMany({
    where,
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json(slots);
}

// ---------- POST /api/staff-slots ----------
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = staffSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "入力内容に誤りがあります",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      },
      { status: 400 }
    );
  }

  const { staffId, date, startTime, endTime } = parsed.data;

  // 30分刻みで展開
  const slots: Date[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m < endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const dt = new Date(`${date}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`);
    slots.push(dt);
  }

  if (slots.length === 0) {
    return NextResponse.json(
      { success: false, error: "有効なスロットがありません" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.staffSlot.createMany({
      data: slots.map((startAt) => ({ staffId, startAt })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { success: true, count: result.count },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "スロットの作成に失敗しました" },
      { status: 500 }
    );
  }
}
