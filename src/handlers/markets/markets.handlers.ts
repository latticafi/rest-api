import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type {
  GetMarketRoute,
  ListMarketsRoute,
} from "@/routes/markets/markets.routes";

import { db } from "@/db";
import { markets } from "@/db/schema";

function serializeMarket(m: typeof markets.$inferSelect) {
  return {
    conditionId: m.conditionId,
    tokenId: m.tokenId,
    minLtvBps: m.minLtvBps,
    maxLtvBps: m.maxLtvBps,
    resolutionTime: m.resolutionTime.toString(),
    originationCutoff: m.originationCutoff.toString(),
    active: m.active,
    name: m.name,
    description: m.description,
    imageUrl: m.imageUrl,
    category: m.category,
  };
}

export const listMarkets: AppRouteHandler<ListMarketsRoute> = async (c) => {
  const rows = await db.select().from(markets).where(eq(markets.active, true));

  return c.json(rows.map(serializeMarket), 200);
};

export const getMarket: AppRouteHandler<GetMarketRoute> = async (c) => {
  const { conditionId } = c.req.valid("param");

  const [market] = await db
    .select()
    .from(markets)
    .where(eq(markets.conditionId, conditionId));

  if (!market) {
    return c.json({ message: "Market not found" }, 404);
  }

  return c.json(serializeMarket(market), 200);
};
