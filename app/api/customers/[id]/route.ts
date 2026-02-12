import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

type Params = { params: Promise<{ id: string }> };

// ---------- GET /api/customers/[id] ----------
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { dateTime: "desc" },
      },
      _count: { select: { reservations: true } },
    },
  });

  if (!customer) {
    return NextResponse.json(
      { success: false, error: "顧客が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json(customer);
}

// ---------- PUT /api/customers/[id] ----------
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
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
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (e) {
    console.error(e);
    const message =
      (e as { code?: string }).code === "P2002"
        ? "この電話番号は既に登録されています"
        : "顧客の更新に失敗しました";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ---------- DELETE /api/customers/[id] ----------
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "顧客の削除に失敗しました" },
      { status: 500 }
    );
  }
}
