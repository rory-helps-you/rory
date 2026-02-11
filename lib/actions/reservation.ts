"use server";

import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations/reservation";
import { calculateRisk } from "@/lib/risk";
import { revalidatePath } from "next/cache";
import type { ReservationStatus } from "@/lib/generated/prisma/client";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ---------- Create ----------
export async function createReservation(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: formData.get("customerPhone") as string,
    dateTime: formData.get("dateTime") as string,
    menu: formData.get("menu") as string,
    note: formData.get("note") as string,
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "入力内容に誤りがあります",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // 電話番号で顧客を検索、なければ作成
    let customer = await prisma.customer.findUnique({
      where: { phone: parsed.data.customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: parsed.data.customerName,
          phone: parsed.data.customerPhone,
        },
      });
    }

    // リスクスコア算出
    const risk = calculateRisk({
      cancelCount: customer.cancelCount,
      noShowCount: customer.noShowCount,
      visitCount: customer.visitCount,
      lastVisitAt: customer.lastVisitAt,
    });

    await prisma.reservation.create({
      data: {
        customerId: customer.id,
        dateTime: new Date(parsed.data.dateTime),
        menu: parsed.data.menu,
        note: parsed.data.note,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
    });

    revalidatePath("/reservations");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "予約の作成に失敗しました" };
  }
}

// ---------- Read (list) ----------
export async function getReservations(params?: {
  status?: ReservationStatus;
  from?: string;
  to?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.from || params?.to) {
    where.dateTime = {
      ...(params?.from ? { gte: new Date(params.from) } : {}),
      ...(params?.to ? { lte: new Date(params.to) } : {}),
    };
  }

  return prisma.reservation.findMany({
    where,
    include: { customer: true },
    orderBy: { dateTime: "asc" },
  });
}

// ---------- Read (single) ----------
export async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: { customer: true },
  });
}

// ---------- Update ----------
export async function updateReservation(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: formData.get("customerPhone") as string,
    dateTime: formData.get("dateTime") as string,
    menu: formData.get("menu") as string,
    note: formData.get("note") as string,
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "入力内容に誤りがあります",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!reservation) {
      return { success: false, error: "予約が見つかりません" };
    }

    // 顧客情報を更新
    await prisma.customer.update({
      where: { id: reservation.customerId },
      data: {
        name: parsed.data.customerName,
        phone: parsed.data.customerPhone,
      },
    });

    // リスクスコア再算出
    const customer = await prisma.customer.findUnique({
      where: { id: reservation.customerId },
    });
    const risk = calculateRisk({
      cancelCount: customer!.cancelCount,
      noShowCount: customer!.noShowCount,
      visitCount: customer!.visitCount,
      lastVisitAt: customer!.lastVisitAt,
    });

    await prisma.reservation.update({
      where: { id },
      data: {
        dateTime: new Date(parsed.data.dateTime),
        menu: parsed.data.menu,
        note: parsed.data.note,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
    });

    revalidatePath("/reservations");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "予約の更新に失敗しました" };
  }
}

// ---------- Delete ----------
export async function deleteReservation(id: string): Promise<ActionState> {
  try {
    await prisma.reservation.delete({ where: { id } });
    revalidatePath("/reservations");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "予約の削除に失敗しました" };
  }
}

// ---------- Status change ----------
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<ActionState> {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!reservation) {
      return { success: false, error: "予約が見つかりません" };
    }

    const oldStatus = reservation.status;

    // ステータス変更に伴う顧客カウント更新
    const customerUpdate: Record<string, unknown> = {};

    // 新ステータスが COMPLETED → 来店カウント増
    if (status === "COMPLETED" && oldStatus !== "COMPLETED") {
      customerUpdate.visitCount = { increment: 1 };
      customerUpdate.lastVisitAt = new Date();
    }
    // 新ステータスが CANCELLED → キャンセルカウント増
    if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
      customerUpdate.cancelCount = { increment: 1 };
    }
    // 新ステータスが NO_SHOW → 無断キャンセルカウント増
    if (status === "NO_SHOW" && oldStatus !== "NO_SHOW") {
      customerUpdate.noShowCount = { increment: 1 };
    }

    if (Object.keys(customerUpdate).length > 0) {
      await prisma.customer.update({
        where: { id: reservation.customerId },
        data: customerUpdate,
      });
    }

    // リスクスコア再算出
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: reservation.customerId },
    });
    const risk = calculateRisk({
      cancelCount: updatedCustomer!.cancelCount,
      noShowCount: updatedCustomer!.noShowCount,
      visitCount: updatedCustomer!.visitCount,
      lastVisitAt: updatedCustomer!.lastVisitAt,
    });

    await prisma.reservation.update({
      where: { id },
      data: {
        status,
        riskScore: risk.score,
        riskLevel: risk.level,
      },
    });

    revalidatePath("/reservations");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "ステータスの更新に失敗しました" };
  }
}
