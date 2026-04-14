import * as handlers from "@/handlers/pool/pool.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/pool/pool.routes";

const router = createRouter()
  .openapi(routes.snapshot, handlers.snapshot)
  .openapi(routes.previewLiquidation, handlers.previewLiquidation)
  .openapi(routes.lenderBalance, handlers.lenderBalance);

export default router;
