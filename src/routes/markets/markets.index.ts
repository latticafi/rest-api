import * as handlers from "@/handlers/markets/markets.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/markets/markets.routes";

const router = createRouter()
  .openapi(routes.listMarkets, handlers.listMarkets)
  .openapi(routes.getMarket, handlers.getMarket);

export default router;
