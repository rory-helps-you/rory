import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffSchema } from "@/lib/validations/staff";

// ---------- GET /api/staff ----------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  const staff = await prisma.staff.findMany({
    where,
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(staff);
}

// ---------- POST /api/staff ----------
export async function POST(request: NextRequest) {
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
    const staff = await prisma.staff.create({
      data: {
        name: parsed.data.name,
      },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "担当者の作成に失敗しました" },
      { status: 500 }
    );
  }
}
