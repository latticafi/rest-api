import { eq } from "drizzle-orm";

import { db } from "@/db";
import { loans } from "@/db/schema";
import { getMidPrice } from "@/pricefeed";

const PRECISION = 10_000;

export interface AtRiskLoan {
  loanId: number;
  conditionId: string;
  tokenId: string;
  collateralAmount: string;
  liquidationPrice: string;
  epochEnd: number;
  reason: "undercollateralized" | "expired";
  currentPrice: number | null;
  healthFactor: number | null;
}

export async function scanActiveLoans(): Promise<AtRiskLoan[]> {
  const activeLoans = await db
    .select()
    .from(loans)
    .where(eq(loans.status, "active"));

  const now = Math.floor(Date.now() / 1000);
  const atRisk: AtRiskLoan[] = [];

  for (const loan of activeLoans) {
    if (now > loan.epochEnd) {
      atRisk.push({
        loanId: loan.loanId,
        conditionId: loan.conditionId,
        tokenId: loan.tokenId,
        collateralAmount: loan.collateralAmount,
        liquidationPrice: loan.liquidationPrice,
        epochEnd: loan.epochEnd,
        reason: "expired",
        currentPrice: null,
        healthFactor: null,
      });
      continue;
    }

    const priceData = getMidPrice(loan.conditionId);
    if (!priceData) continue;

    const priceWad = BigInt(Math.floor(priceData.mid * 1e18));
    const liqPrice = BigInt(loan.liquidationPrice);
    if (liqPrice === 0n) continue;

    const hf = Number((priceWad * BigInt(PRECISION)) / liqPrice) / PRECISION;

    if (hf < 1.0) {
      atRisk.push({
        loanId: loan.loanId,
        conditionId: loan.conditionId,
        tokenId: loan.tokenId,
        collateralAmount: loan.collateralAmount,
        liquidationPrice: loan.liquidationPrice,
        epochEnd: loan.epochEnd,
        reason: "undercollateralized",
        currentPrice: priceData.mid,
        healthFactor: hf,
      });
    }
  }

  return atRisk;
}
