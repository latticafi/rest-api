import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { db } from "@/db";
import { loans } from "@/db/schema";
import { clearPrices, updatePrice } from "@/pricefeed/store";

import { cleanDb } from "./setup";

const { scanActiveLoans } = await import("@/liquidator/scanner");

const CONDITION_ID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

async function seedLoan(overrides: Partial<typeof loans.$inferInsert> = {}) {
  await db.insert(loans).values({
    loanId: 1,
    borrower: "0xborrower",
    conditionId: CONDITION_ID,
    tokenId: "99999999999999999999",
    collateralAmount: "1000000000",
    principal: "400000000",
    premiumPaid: "12000000",
    interestDue: "5000000",
    interestRateBps: 700,
    liquidationPrice: "480000000000000000",
    epochStart: 1720000000,
    epochEnd: Math.floor(Date.now() / 1000) + 86400,
    status: "active",
    txHash: "0xaaa",
    blockNumber: 50000000,
    ...overrides,
  });
}

beforeEach(async () => {
  await cleanDb();
  clearPrices();
});

afterEach(async () => {
  await cleanDb();
  clearPrices();
});

describe("scanActiveLoans", () => {
  test("returns empty when no active loans", async () => {
    const result = await scanActiveLoans();
    expect(result).toEqual([]);
  });

  test("skips repaid loans", async () => {
    await seedLoan({ status: "repaid" });
    const result = await scanActiveLoans();
    expect(result).toEqual([]);
  });

  test("detects expired loans", async () => {
    await seedLoan({ epochEnd: Math.floor(Date.now() / 1000) - 100 });
    const result = await scanActiveLoans();
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("expired");
    expect(result[0].loanId).toBe(1);
  });

  test("detects undercollateralized loans", async () => {
    await seedLoan({ liquidationPrice: "480000000000000000" });
    updatePrice(CONDITION_ID, 0.4, 0.42);

    const result = await scanActiveLoans();
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("undercollateralized");
    expect(result[0].healthFactor).not.toBeNull();
    expect(result[0].healthFactor!).toBeLessThan(1.0);
  });

  test("skips healthy loans", async () => {
    await seedLoan({ liquidationPrice: "480000000000000000" });
    updatePrice(CONDITION_ID, 0.6, 0.62);

    const result = await scanActiveLoans();
    expect(result).toHaveLength(0);
  });

  test("skips loans with no price data", async () => {
    await seedLoan();
    const result = await scanActiveLoans();
    expect(result).toHaveLength(0);
  });

  test("expired takes priority over undercollateralized", async () => {
    await seedLoan({
      epochEnd: Math.floor(Date.now() / 1000) - 100,
      liquidationPrice: "480000000000000000",
    });
    updatePrice(CONDITION_ID, 0.3, 0.32);

    const result = await scanActiveLoans();
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("expired");
  });

  test("scans multiple loans independently", async () => {
    const otherCondition =
      "0xdead000000000000000000000000000000000000000000000000000000000000";
    await seedLoan({
      loanId: 1,
      conditionId: CONDITION_ID,
      liquidationPrice: "480000000000000000",
    });
    await seedLoan({
      loanId: 2,
      conditionId: otherCondition,
      liquidationPrice: "300000000000000000",
    });

    updatePrice(CONDITION_ID, 0.4, 0.42);
    updatePrice(otherCondition, 0.6, 0.62);

    const result = await scanActiveLoans();
    expect(result).toHaveLength(1);
    expect(result[0].loanId).toBe(1);
    expect(result[0].reason).toBe("undercollateralized");
  });
});
