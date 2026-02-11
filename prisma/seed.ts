import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.reservation.deleteMany();
  await prisma.customer.deleteMany();

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "田中 花子",
        phone: "090-1111-2222",
        visitCount: 12,
        cancelCount: 0,
        noShowCount: 0,
        lastVisitAt: new Date("2025-01-20"),
      },
    }),
    prisma.customer.create({
      data: {
        name: "佐藤 太郎",
        phone: "090-3333-4444",
        visitCount: 5,
        cancelCount: 2,
        noShowCount: 0,
        lastVisitAt: new Date("2025-01-15"),
      },
    }),
    prisma.customer.create({
      data: {
        name: "鈴木 美咲",
        phone: "080-5555-6666",
        visitCount: 1,
        cancelCount: 1,
        noShowCount: 1,
        lastVisitAt: new Date("2024-09-10"),
      },
    }),
    prisma.customer.create({
      data: {
        name: "高橋 健一",
        phone: "070-7777-8888",
        visitCount: 0,
        cancelCount: 0,
        noShowCount: 2,
        lastVisitAt: null,
      },
    }),
    prisma.customer.create({
      data: {
        name: "山本 さくら",
        phone: "090-9999-0000",
        visitCount: 8,
        cancelCount: 1,
        noShowCount: 0,
        lastVisitAt: new Date("2025-01-25"),
      },
    }),
  ]);

  const [tanaka, sato, suzuki, takahashi, yamamoto] = customers;

  // Create reservations
  const now = new Date();
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  };
  const setTime = (d: Date, h: number, m: number) => {
    const result = new Date(d);
    result.setHours(h, m, 0, 0);
    return result;
  };

  await Promise.all([
    // Today
    prisma.reservation.create({
      data: {
        customerId: tanaka.id,
        dateTime: setTime(now, 10, 0),
        menu: "カット",
        status: "CONFIRMED",
        riskScore: 0,
        riskLevel: "LOW",
      },
    }),
    prisma.reservation.create({
      data: {
        customerId: sato.id,
        dateTime: setTime(now, 13, 30),
        menu: "カラー",
        status: "CONFIRMED",
        riskScore: 20,
        riskLevel: "LOW",
        note: "前回と同じカラーで",
      },
    }),
    prisma.reservation.create({
      data: {
        customerId: suzuki.id,
        dateTime: setTime(now, 15, 0),
        menu: "カット+カラー",
        status: "CONFIRMED",
        riskScore: 60,
        riskLevel: "HIGH",
        note: "初回から無断キャンセルあり、要注意",
      },
    }),
    // Tomorrow
    prisma.reservation.create({
      data: {
        customerId: takahashi.id,
        dateTime: setTime(addDays(now, 1), 11, 0),
        menu: "パーマ",
        status: "CONFIRMED",
        riskScore: 70,
        riskLevel: "HIGH",
      },
    }),
    prisma.reservation.create({
      data: {
        customerId: yamamoto.id,
        dateTime: setTime(addDays(now, 1), 14, 0),
        menu: "トリートメント",
        status: "CONFIRMED",
        riskScore: 10,
        riskLevel: "LOW",
      },
    }),
    // Past (completed)
    prisma.reservation.create({
      data: {
        customerId: tanaka.id,
        dateTime: setTime(addDays(now, -3), 10, 0),
        menu: "カット",
        status: "COMPLETED",
        riskScore: 0,
        riskLevel: "LOW",
      },
    }),
    prisma.reservation.create({
      data: {
        customerId: sato.id,
        dateTime: setTime(addDays(now, -5), 16, 0),
        menu: "カット+カラー",
        status: "COMPLETED",
        riskScore: 20,
        riskLevel: "LOW",
      },
    }),
    // Past (cancelled / no-show)
    prisma.reservation.create({
      data: {
        customerId: suzuki.id,
        dateTime: setTime(addDays(now, -7), 11, 0),
        menu: "縮毛矯正",
        status: "NO_SHOW",
        riskScore: 60,
        riskLevel: "HIGH",
      },
    }),
    prisma.reservation.create({
      data: {
        customerId: takahashi.id,
        dateTime: setTime(addDays(now, -10), 13, 0),
        menu: "カット",
        status: "CANCELLED",
        riskScore: 70,
        riskLevel: "HIGH",
      },
    }),
    // Future
    prisma.reservation.create({
      data: {
        customerId: yamamoto.id,
        dateTime: setTime(addDays(now, 5), 10, 30),
        menu: "ヘッドスパ",
        status: "CONFIRMED",
        riskScore: 10,
        riskLevel: "LOW",
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
