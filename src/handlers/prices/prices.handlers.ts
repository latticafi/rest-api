import type { AppRouteHandler } from "@/lib/types";
import type { GetPriceRoute } from "@/routes/prices/prices.routes";

import { getMidPrice } from "@/lib/priceFeed";

export const getPrice: AppRouteHandler<GetPriceRoute> = async (c) => {
  const { conditionId } = c.req.valid("param");

  const priceData = getMidPrice(conditionId);
  if (!priceData) {
    return c.json({ message: "Price not available" }, 404);
  }

  return c.json(
    {
      conditionId,
      bid: priceData.bid,
      ask: priceData.ask,
      mid: priceData.mid,
      updatedAt: priceData.updatedAt,
    },
    200,
  );
};
