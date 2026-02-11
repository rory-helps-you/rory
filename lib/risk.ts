import type { RiskLevel } from "@/lib/generated/prisma/client";

interface RiskInput {
  cancelCount: number;
  noShowCount: number;
  visitCount: number;
  lastVisitAt: Date | null;
}

interface RiskResult {
  score: number;
  level: RiskLevel;
}

/**
 * ルールベースのリスクスコア算出
 *
 * スコア 0–100:
 *  - キャンセル回数: 1回につき +10 (最大30)
 *  - 無断キャンセル回数: 1回につき +25 (最大50)
 *  - 来店回数が少ない(3回未満): +10
 *  - 最終来店から90日以上経過: +10
 *
 * リスクレベル:
 *  - 0–29: LOW
 *  - 30–59: MEDIUM
 *  - 60+: HIGH
 */
export function calculateRisk(input: RiskInput): RiskResult {
  let score = 0;

  // キャンセル回数ペナルティ
  score += Math.min(input.cancelCount * 10, 30);

  // 無断キャンセルは重いペナルティ
  score += Math.min(input.noShowCount * 25, 50);

  // 来店回数が少ない場合
  if (input.visitCount < 3) {
    score += 10;
  }

  // 最終来店から90日以上経過
  if (input.lastVisitAt) {
    const daysSinceLastVisit = Math.floor(
      (Date.now() - input.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastVisit >= 90) {
      score += 10;
    }
  } else {
    // 来店履歴がない場合もリスク加算
    score += 10;
  }

  score = Math.min(score, 100);

  let level: RiskLevel;
  if (score >= 60) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  return { score, level };
}
