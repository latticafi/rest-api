import { lendingPoolAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";
import { getOperatorClient } from "@/lib/operator";
import { signPriceAttestation } from "@/lib/priceSigner";
import { getMidPrice } from "@/pricefeed";

import type { AtRiskLoan } from "./scanner";

const PRICE_ATTESTATION_TTL_S = 120;

export async function executeLiquidation(
  loan: AtRiskLoan,
): Promise<string | null> {
  const operator = getOperatorClient();
  const client = getPublicClient();
  const pool = getContract("pool");
  const chainId = Number(process.env.CHAIN_ID || 137);

  try {
    if (loan.reason === "expired") {
      const hash = await operator.writeContract({
        address: pool,
        abi: lendingPoolAbi,
        functionName: "claim_expired",
        args: [BigInt(loan.loanId)],
      });

      await client.waitForTransactionReceipt({ hash });
      console.log(`[liquidator] Claimed expired loan ${loan.loanId}: ${hash}`);
      return hash;
    }

    const priceData = getMidPrice(loan.conditionId);
    if (!priceData) {
      console.warn(
        `[liquidator] Skipping loan ${loan.loanId}: price feed stale`,
      );
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const priceWad = BigInt(Math.floor(priceData.mid * 1e18));
    const deadline = now + PRICE_ATTESTATION_TTL_S;

    const priceSignature = await signPriceAttestation({
      poolAddress: pool,
      conditionId: loan.conditionId as `0x${string}`,
      price: priceWad,
      timestamp: BigInt(now),
      deadline: BigInt(deadline),
      chainId,
    });

    const hash = await operator.writeContract({
      address: pool,
      abi: lendingPoolAbi,
      functionName: "trigger_liquidation",
      args: [
        BigInt(loan.loanId),
        priceWad,
        BigInt(now),
        BigInt(deadline),
        priceSignature,
      ],
    });

    await client.waitForTransactionReceipt({ hash });
    console.log(
      `[liquidator] Liquidated loan ${loan.loanId} (HF=${loan.healthFactor}): ${hash}`,
    );
    return hash;
  } catch (err) {
    console.error(`[liquidator] Failed loan ${loan.loanId}:`, err);
    return null;
  }
}
