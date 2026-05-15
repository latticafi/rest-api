import type { ApiKeyCreds } from "@polymarket/clob-client-v2";

import { Chain, ClobClient, OrderType, Side } from "@polymarket/clob-client-v2";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const CLOB_HOST = process.env.CLOB_HOST || "https://clob.polymarket.com";
const GAMMA_API = "https://gamma-api.polymarket.com";
const CTF_DECIMALS = 1e6;

let _client: ClobClient | null = null;

function getClient(): ClobClient {
  if (_client) return _client;

  if (!process.env.OPERATOR_PRIVATE_KEY) {
    throw new Error("OPERATOR_PRIVATE_KEY required for CLOB sell");
  }
  if (
    !process.env.CLOB_API_KEY ||
    !process.env.CLOB_API_SECRET ||
    !process.env.CLOB_PASSPHRASE
  ) {
    throw new Error(
      "CLOB_API_KEY, CLOB_API_SECRET, CLOB_PASSPHRASE required for CLOB sell",
    );
  }

  const account = privateKeyToAccount(
    process.env.OPERATOR_PRIVATE_KEY as `0x${string}`,
  );
  const signer = createWalletClient({ account, transport: http() });

  const creds: ApiKeyCreds = {
    key: process.env.CLOB_API_KEY,
    secret: process.env.CLOB_API_SECRET,
    passphrase: process.env.CLOB_PASSPHRASE,
  };

  const chain =
    Number(process.env.CHAIN_ID || 137) === 137 ? Chain.POLYGON : Chain.AMOY;

  _client = new ClobClient({ host: CLOB_HOST, chain, signer, creds });

  return _client;
}

type TickSize = "0.1" | "0.01" | "0.001" | "0.0001";
const VALID_TICK_SIZES = new Set<string>(["0.1", "0.01", "0.001", "0.0001"]);

interface MarketInfo {
  tickSize: TickSize;
  negRisk: boolean;
}

async function fetchMarketInfo(
  conditionId: string,
): Promise<MarketInfo | null> {
  try {
    const res = await fetch(
      `${GAMMA_API}/markets?condition_ids=${conditionId}`,
    );
    if (!res.ok) return null;
    const markets = (await res.json()) as Array<Record<string, unknown>>;
    if (!markets.length) return null;
    const market = markets[0];
    const raw = String(market.minimum_tick_size || "0.01");
    const tickSize = VALID_TICK_SIZES.has(raw) ? (raw as TickSize) : "0.01";
    return { tickSize, negRisk: Boolean(market.neg_risk) };
  } catch {
    return null;
  }
}

export async function sellCollateral(
  tokenId: string,
  collateralAmount: string,
  conditionId: string,
): Promise<string | null> {
  const shares = Number(BigInt(collateralAmount)) / CTF_DECIMALS;
  if (shares <= 0) {
    console.warn("[liquidator] Zero shares to sell, skipping CLOB sell");
    return null;
  }

  const marketInfo = await fetchMarketInfo(conditionId);
  if (!marketInfo) {
    console.error(
      `[liquidator] Failed to fetch market info for ${conditionId}, skipping sell`,
    );
    return null;
  }

  try {
    const client = getClient();
    const resp = await client.createAndPostMarketOrder(
      {
        tokenID: tokenId,
        amount: shares,
        side: Side.SELL,
        orderType: OrderType.FOK, // required inside order params in v2
      },
      { tickSize: marketInfo.tickSize, negRisk: marketInfo.negRisk },
      OrderType.FOK,
    );

    if (resp.success) {
      console.log(
        `[liquidator] CLOB sell filled: ${shares} shares of ${tokenId}, order ${resp.orderID}`,
      );
      return resp.orderID;
    }

    console.warn(
      `[liquidator] CLOB sell failed: ${resp.errorMsg || "unknown error"}`,
    );
    return null;
  } catch (err) {
    console.error(`[liquidator] CLOB sell error for ${tokenId}:`, err);
    return null;
  }
}
