import { decodeEventLog } from "viem";

import { lendingPoolAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";

import { getCursor, setCursor } from "./cursor";
import {
  handleDeposited,
  handleLoanLiquidated,
  handleLoanOriginated,
  handleLoanRepaid,
  handleLoanRolled,
  handleWithdrawn,
} from "./handlers";

const POLL_INTERVAL_MS = 15_000;
const BLOCK_CHUNK = 2000n;

let running = false;

async function processLogs(fromBlock: bigint, toBlock: bigint) {
  const client = getPublicClient();
  const pool = getContract("pool");

  const logs = await client.getLogs({
    address: pool,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    let decoded;
    try {
      decoded = decodeEventLog({
        abi: lendingPoolAbi,
        data: log.data,
        topics: log.topics,
      });
    } catch {
      continue;
    }

    const txHash = log.transactionHash!;
    const blockNumber = Number(log.blockNumber!);

    switch (decoded.eventName) {
      case "Deposited":
        await handleDeposited(decoded.args, txHash, blockNumber);
        break;
      case "Withdrawn":
        await handleWithdrawn(decoded.args, txHash, blockNumber);
        break;
      case "LoanOriginated":
        await handleLoanOriginated(decoded.args, txHash, blockNumber);
        break;
      case "LoanRepaid":
        await handleLoanRepaid(decoded.args);
        break;
      case "LoanRolled":
        await handleLoanRolled(decoded.args, txHash, blockNumber);
        break;
      case "LoanLiquidated":
        await handleLoanLiquidated(decoded.args);
        break;
    }
  }
}

async function tick() {
  try {
    const client = getPublicClient();
    const cursor = await getCursor();
    const head = await client.getBlockNumber();

    if (cursor >= head) return;

    let from = cursor + 1n;
    while (from <= head) {
      const to =
        from + BLOCK_CHUNK - 1n > head ? head : from + BLOCK_CHUNK - 1n;
      await processLogs(from, to);
      await setCursor(to);
      from = to + 1n;
    }
  } catch (err) {
    console.error("[indexer] Error:", err);
  }
}

export function startIndexer() {
  if (running) return;
  running = true;
  console.log("[indexer] Starting event indexer");
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

export function stopIndexer() {
  running = false;
}
