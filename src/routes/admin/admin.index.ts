import * as handlers from "@/handlers/admin/admin.handlers";
import createRouter from "@/lib/createRouter";
import { adminMiddleware } from "@/middleware/auth";
import * as routes from "@/routes/admin/admin.routes";

const router = createRouter();

router.use("/admin/*", adminMiddleware);

router
  .openapi(routes.onboardMarket, handlers.onboardMarket)
  .openapi(routes.updateMarket, handlers.updateMarket)
  .openapi(routes.pauseMarket, handlers.pauseMarket)
  .openapi(routes.pausePool, handlers.pausePool)
  .openapi(routes.unpausePool, handlers.unpausePool);

export default router;
