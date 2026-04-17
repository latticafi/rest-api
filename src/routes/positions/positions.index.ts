import * as handlers from "@/handlers/positions/positions.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/positions/positions.routes";

const router = createRouter()
  .openapi(routes.listLoans, handlers.listLoans)
  .openapi(routes.getLoan, handlers.getLoan)
  .openapi(routes.getHistory, handlers.getHistory);

export default router;
