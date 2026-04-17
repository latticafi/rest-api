import { encodeFunctionData } from "viem";

import type { AppRouteHandler } from "@/lib/types";
import type {
  ApprovalPrepareRoute,
  ApprovalStatusRoute,
  BorrowPrepareRoute,
  DepositPrepareRoute,
  RepayPrepareRoute,
  RollPrepareRoute,
  WithdrawPrepareRoute,
} from "@/routes/tx/tx.routes";

import { erc20Abi, erc1155Abi, lendingPoolAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

export const depositPrepare: AppRouteHandler<DepositPrepareRoute> = async (
  c,
) => {
  const { amount } = c.req.valid("json");
  const pool = getContract("pool");

  const data = encodeFunctionData({
    abi: lendingPoolAbi,
    functionName: "deposit",
    args: [BigInt(amount)],
  });

  return c.json({ to: pool, data }, 200);
};

export const withdrawPrepare: AppRouteHandler<WithdrawPrepareRoute> = async (
  c,
) => {
  const { shares } = c.req.valid("json");
  const pool = getContract("pool");

  const data = encodeFunctionData({
    abi: lendingPoolAbi,
    functionName: "withdraw",
    args: [BigInt(shares)],
  });

  return c.json({ to: pool, data }, 200);
};

export const borrowPrepare: AppRouteHandler<BorrowPrepareRoute> = async (c) => {
  const body = c.req.valid("json");
  const pool = getContract("pool");

  const data = encodeFunctionData({
    abi: lendingPoolAbi,
    functionName: "borrow",
    args: [
      body.conditionId as `0x${string}`,
      BigInt(body.collateralAmount),
      BigInt(body.borrowAmount),
      BigInt(body.epochLength),
      BigInt(body.premiumBps),
      BigInt(body.deadline),
      BigInt(body.nonce),
      body.signature as `0x${string}`,
      BigInt(body.price),
      BigInt(body.priceTimestamp),
      BigInt(body.priceDeadline),
      body.priceSignature as `0x${string}`,
    ],
  });

  return c.json({ to: pool, data }, 200);
};

export const repayPrepare: AppRouteHandler<RepayPrepareRoute> = async (c) => {
  const { loanId } = c.req.valid("json");
  const pool = getContract("pool");

  const data = encodeFunctionData({
    abi: lendingPoolAbi,
    functionName: "repay",
    args: [BigInt(loanId)],
  });

  return c.json({ to: pool, data }, 200);
};

export const rollPrepare: AppRouteHandler<RollPrepareRoute> = async (c) => {
  const body = c.req.valid("json");
  const pool = getContract("pool");

  const data = encodeFunctionData({
    abi: lendingPoolAbi,
    functionName: "roll_loan",
    args: [
      BigInt(body.oldLoanId),
      BigInt(body.epochLength),
      BigInt(body.premiumBps),
      BigInt(body.deadline),
      BigInt(body.nonce),
      body.signature as `0x${string}`,
      BigInt(body.price),
      BigInt(body.priceTimestamp),
      BigInt(body.priceDeadline),
      body.priceSignature as `0x${string}`,
    ],
  });

  return c.json({ to: pool, data }, 200);
};

export const approvalStatus: AppRouteHandler<ApprovalStatusRoute> = async (
  c,
) => {
  const wallet = c.get("walletAddress") as `0x${string}`;
  const pool = getContract("pool");
  const client = getPublicClient();

  const [allowance, approved] = await Promise.all([
    client.readContract({
      address: getContract("usdc"),
      abi: erc20Abi,
      functionName: "allowance",
      args: [wallet, pool],
    }),
    client.readContract({
      address: getContract("ctf"),
      abi: erc1155Abi,
      functionName: "isApprovedForAll",
      args: [wallet, pool],
    }),
  ]);

  return c.json(
    {
      usdc: {
        allowance: allowance.toString(),
        sufficient: allowance >= MAX_UINT256 / 2n,
      },
      ctf: {
        approved,
      },
    },
    200,
  );
};

export const approvalPrepare: AppRouteHandler<ApprovalPrepareRoute> = async (
  c,
) => {
  const { token } = c.req.valid("json");
  const pool = getContract("pool");

  if (token === "usdc") {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [pool, MAX_UINT256],
    });
    return c.json({ to: getContract("usdc"), data }, 200);
  }

  const data = encodeFunctionData({
    abi: erc1155Abi,
    functionName: "setApprovalForAll",
    args: [pool, true],
  });
  return c.json({ to: getContract("ctf"), data }, 200);
};
