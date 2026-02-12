import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

// ---------- GET /api/customers ----------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

// ---------- POST /api/customers ----------
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = customerSchema.safeParse(body);
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
    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (e) {
    console.error(e);
    const message =
      (e as { code?: string }).code === "P2002"
        ? "この電話番号は既に登録されています"
        : "顧客の作成に失敗しました";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
