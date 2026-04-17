import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  depositEvents,
  indexerCursor,
  loans,
  withdrawEvents,
} from "@/db/schema";

const MOCK_LOAN = {
  borrower: "0x1234567890abcdef1234567890abcdef12345678" as `0x${string}`,
  condition_id:
    "0xcafe000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  token_id: 99999999999999999999n,
  collateral_amount: 1000000000n,
  principal: 400000000n,
  premium_paid: 12000000n,
  interest_due: 5000000n,
  interest_rate_bps: 700n,
  liquidation_price: 480000000000000000n,
  epoch_start: 1720000000n,
  epoch_end: 1720086400n,
  repaid: false,
  liquidated: false,
};

mock.module("@/lib/chain", () => ({
  getPublicClient: () => ({
    readContract: async () => MOCK_LOAN,
  }),
  getContract: () => "0x0000000000000000000000000000000000000001",
}));

const {
  handleDeposited,
  handleWithdrawn,
  handleLoanOriginated,
  handleLoanRepaid,
  handleLoanRolled,
  handleLoanLiquidated,
} = await import("@/indexer/handlers");

async function cleanTables() {
  await db.delete(loans);
  await db.delete(depositEvents);
  await db.delete(withdrawEvents);
  await db.delete(indexerCursor);
}

async function seedLoan(loanId: number, status = "active") {
  await db.insert(loans).values({
    loanId,
    borrower: MOCK_LOAN.borrower.toLowerCase(),
    conditionId: MOCK_LOAN.condition_id,
    tokenId: MOCK_LOAN.token_id.toString(),
    collateralAmount: MOCK_LOAN.collateral_amount.toString(),
    principal: MOCK_LOAN.principal.toString(),
    premiumPaid: MOCK_LOAN.premium_paid.toString(),
    interestDue: MOCK_LOAN.interest_due.toString(),
    interestRateBps: Number(MOCK_LOAN.interest_rate_bps),
    liquidationPrice: MOCK_LOAN.liquidation_price.toString(),
    epochStart: Number(MOCK_LOAN.epoch_start),
    epochEnd: Number(MOCK_LOAN.epoch_end),
    status,
    txHash: "0xaaa",
    blockNumber: 50000000,
  });
}

beforeEach(async () => {
  await cleanTables();
});

afterEach(async () => {
  await cleanTables();
});

describe("handleDeposited", () => {
  test("inserts a deposit event", async () => {
    await handleDeposited(
      { lender: "0xAbC123", amount: 1000000000n, shares: 999000000n },
      "0xtx1",
      50000001,
    );

    const rows = await db.select().from(depositEvents);
    expect(rows).toHaveLength(1);
    expect(rows[0].lender).toBe("0xabc123");
    expect(rows[0].amount).toBe("1000000000");
    expect(rows[0].shares).toBe("999000000");
    expect(rows[0].txHash).toBe("0xtx1");
    expect(rows[0].blockNumber).toBe(50000001);
  });

  test("lowercases lender address", async () => {
    await handleDeposited(
      { lender: "0xABCDEF", amount: 100n, shares: 99n },
      "0xtx2",
      50000002,
    );

    const [row] = await db.select().from(depositEvents);
    expect(row.lender).toBe("0xabcdef");
  });
});

describe("handleWithdrawn", () => {
  test("inserts a withdraw event", async () => {
    await handleWithdrawn(
      { lender: "0xAbC123", shares: 500000000n, amount: 510000000n },
      "0xtx3",
      50000003,
    );

    const rows = await db.select().from(withdrawEvents);
    expect(rows).toHaveLength(1);
    expect(rows[0].shares).toBe("500000000");
    expect(rows[0].amount).toBe("510000000");
  });
});

describe("handleLoanOriginated", () => {
  test("fetches loan from chain and inserts into DB", async () => {
    await handleLoanOriginated({ loan_id: 1n }, "0xtx4", 50000004);

    const [loan] = await db.select().from(loans).where(eq(loans.loanId, 1));
    expect(loan).toBeDefined();
    expect(loan.borrower).toBe(MOCK_LOAN.borrower.toLowerCase());
    expect(loan.conditionId).toBe(MOCK_LOAN.condition_id);
    expect(loan.tokenId).toBe(MOCK_LOAN.token_id.toString());
    expect(loan.collateralAmount).toBe(MOCK_LOAN.collateral_amount.toString());
    expect(loan.principal).toBe(MOCK_LOAN.principal.toString());
    expect(loan.status).toBe("active");
    expect(loan.txHash).toBe("0xtx4");
  });

  test("is idempotent on duplicate loan_id", async () => {
    await handleLoanOriginated({ loan_id: 2n }, "0xtx5", 50000005);
    await handleLoanOriginated({ loan_id: 2n }, "0xtx5", 50000005);

    const rows = await db.select().from(loans).where(eq(loans.loanId, 2));
    expect(rows).toHaveLength(1);
  });
});

describe("handleLoanRepaid", () => {
  test("updates loan status to repaid", async () => {
    await seedLoan(10);
    await handleLoanRepaid({ loan_id: 10n });

    const [loan] = await db.select().from(loans).where(eq(loans.loanId, 10));
    expect(loan.status).toBe("repaid");
  });
});

describe("handleLoanLiquidated", () => {
  test("updates loan status to liquidated", async () => {
    await seedLoan(20);
    await handleLoanLiquidated({ loan_id: 20n });

    const [loan] = await db.select().from(loans).where(eq(loans.loanId, 20));
    expect(loan.status).toBe("liquidated");
  });
});

describe("handleLoanRolled", () => {
  test("marks old loan as rolled and creates new loan", async () => {
    await seedLoan(30);
    await handleLoanRolled(
      { old_loan_id: 30n, new_loan_id: 31n },
      "0xtx6",
      50000006,
    );

    const [oldLoan] = await db.select().from(loans).where(eq(loans.loanId, 30));
    expect(oldLoan.status).toBe("rolled");

    const [newLoan] = await db.select().from(loans).where(eq(loans.loanId, 31));
    expect(newLoan).toBeDefined();
    expect(newLoan.status).toBe("active");
    expect(newLoan.txHash).toBe("0xtx6");
  });
});
