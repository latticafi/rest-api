import { and, desc, eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type {
  GetHistoryRoute,
  GetLoanRoute,
  ListLoansRoute,
} from "@/routes/positions/positions.routes";

import { db } from "@/db";
import { depositEvents, loans, withdrawEvents } from "@/db/schema";
import { getMidPrice } from "@/pricefeed";

const PRECISION = 10_000;

function computeHealthFactor(
  conditionId: string,
  liquidationPrice: string,
): number | null {
  const priceData = getMidPrice(conditionId);
  if (!priceData) return null;

  const priceWad = BigInt(Math.floor(priceData.mid * 1e18));
  const liqPrice = BigInt(liquidationPrice);
  if (liqPrice === 0n) return null;

  return Number((priceWad * BigInt(PRECISION)) / liqPrice) / PRECISION;
}

function serializeLoan(loan: typeof loans.$inferSelect, hf: number | null) {
  return {
    loanId: loan.loanId,
    borrower: loan.borrower,
    conditionId: loan.conditionId,
    tokenId: loan.tokenId,
    collateralAmount: loan.collateralAmount,
    principal: loan.principal,
    premiumPaid: loan.premiumPaid,
    interestDue: loan.interestDue,
    interestRateBps: loan.interestRateBps,
    liquidationPrice: loan.liquidationPrice,
    epochStart: loan.epochStart,
    epochEnd: loan.epochEnd,
    status: loan.status,
    healthFactor: hf,
  };
}

export const listLoans: AppRouteHandler<ListLoansRoute> = async (c) => {
  const wallet = c.get("walletAddress");
  const { status } = c.req.valid("query");

  const conditions = [eq(loans.borrower, wallet)];
  if (status) conditions.push(eq(loans.status, status));

  const rows = await db
    .select()
    .from(loans)
    .where(and(...conditions))
    .orderBy(desc(loans.loanId));

  const result = rows.map((loan) => {
    const hf =
      loan.status === "active"
        ? computeHealthFactor(loan.conditionId, loan.liquidationPrice)
        : null;
    return serializeLoan(loan, hf);
  });

  return c.json(result, 200);
};

export const getLoan: AppRouteHandler<GetLoanRoute> = async (c) => {
  const wallet = c.get("walletAddress");
  const { loanId } = c.req.valid("param");

  const [loan] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.loanId, Number(loanId)), eq(loans.borrower, wallet)));

  if (!loan) {
    return c.json({ message: "Loan not found" }, 404);
  }

  const hf =
    loan.status === "active"
      ? computeHealthFactor(loan.conditionId, loan.liquidationPrice)
      : null;

  return c.json(serializeLoan(loan, hf), 200);
};

export const getHistory: AppRouteHandler<GetHistoryRoute> = async (c) => {
  const wallet = c.get("walletAddress");

  const [deposits, withdrawals, loanRows] = await Promise.all([
    db
      .select()
      .from(depositEvents)
      .where(eq(depositEvents.lender, wallet))
      .orderBy(desc(depositEvents.blockNumber)),
    db
      .select()
      .from(withdrawEvents)
      .where(eq(withdrawEvents.lender, wallet))
      .orderBy(desc(withdrawEvents.blockNumber)),
    db
      .select()
      .from(loans)
      .where(eq(loans.borrower, wallet))
      .orderBy(desc(loans.blockNumber)),
  ]);

  const events = [
    ...deposits.map((d) => ({
      type: "deposit" as const,
      txHash: d.txHash,
      blockNumber: d.blockNumber,
      data: { amount: d.amount, shares: d.shares },
      createdAt: d.createdAt?.toISOString() ?? null,
    })),
    ...withdrawals.map((w) => ({
      type: "withdraw" as const,
      txHash: w.txHash,
      blockNumber: w.blockNumber,
      data: { shares: w.shares, amount: w.amount },
      createdAt: w.createdAt?.toISOString() ?? null,
    })),
    ...loanRows.map((l) => ({
      type: "loan" as const,
      txHash: l.txHash,
      blockNumber: l.blockNumber,
      data: {
        loanId: l.loanId,
        conditionId: l.conditionId,
        principal: l.principal,
        status: l.status,
      },
      createdAt: l.createdAt?.toISOString() ?? null,
    })),
  ];

  events.sort((a, b) => b.blockNumber - a.blockNumber);

  return c.json(events, 200);
};
