import { eq } from "drizzle-orm";

import { db } from "@/db";
import { depositEvents, loans, withdrawEvents } from "@/db/schema";
import { poolCoreAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";

async function fetchLoan(loanId: bigint) {
  const client = getPublicClient();
  return client.readContract({
    address: getContract("core"),
    abi: poolCoreAbi,
    functionName: "get_loan",
    args: [loanId],
  });
}

async function insertLoanFromChain(
  loanId: bigint,
  txHash: string,
  blockNumber: number,
) {
  const loan = await fetchLoan(loanId);
  await db
    .insert(loans)
    .values({
      loanId: Number(loanId),
      borrower: loan.borrower.toLowerCase(),
      conditionId: loan.condition_id,
      tokenId: loan.token_id.toString(),
      collateralAmount: loan.collateral_amount.toString(),
      principal: loan.principal.toString(),
      premiumPaid: loan.premium_paid.toString(),
      interestDue: loan.interest_due.toString(),
      interestRateBps: Number(loan.interest_rate_bps),
      liquidationPrice: loan.liquidation_price.toString(),
      epochStart: Number(loan.epoch_start),
      epochEnd: Number(loan.epoch_end),
      status: "active",
      txHash,
      blockNumber,
    })
    .onConflictDoNothing();
}

export async function handleDeposited(
  args: { lender: string; amount: bigint; shares: bigint },
  txHash: string,
  blockNumber: number,
) {
  await db
    .insert(depositEvents)
    .values({
      lender: args.lender.toLowerCase(),
      amount: args.amount.toString(),
      shares: args.shares.toString(),
      txHash,
      blockNumber,
    })
    .onConflictDoNothing();
}

export async function handleWithdrawn(
  args: { lender: string; shares: bigint; amount: bigint },
  txHash: string,
  blockNumber: number,
) {
  await db
    .insert(withdrawEvents)
    .values({
      lender: args.lender.toLowerCase(),
      shares: args.shares.toString(),
      amount: args.amount.toString(),
      txHash,
      blockNumber,
    })
    .onConflictDoNothing();
}

export async function handleLoanOriginated(
  args: { loan_id: bigint },
  txHash: string,
  blockNumber: number,
) {
  await insertLoanFromChain(args.loan_id, txHash, blockNumber);
}

export async function handleLoanRepaid(args: { loan_id: bigint }) {
  await db
    .update(loans)
    .set({ status: "repaid" })
    .where(eq(loans.loanId, Number(args.loan_id)));
}

export async function handleLoanRolled(
  args: { old_loan_id: bigint; new_loan_id: bigint },
  txHash: string,
  blockNumber: number,
) {
  await db
    .update(loans)
    .set({ status: "rolled" })
    .where(eq(loans.loanId, Number(args.old_loan_id)));

  await insertLoanFromChain(args.new_loan_id, txHash, blockNumber);
}

export async function handleLoanLiquidated(args: { loan_id: bigint }) {
  await db
    .update(loans)
    .set({ status: "liquidated" })
    .where(eq(loans.loanId, Number(args.loan_id)));
}
