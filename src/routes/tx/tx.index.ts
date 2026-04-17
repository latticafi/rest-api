import * as handlers from "@/handlers/tx/tx.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/tx/tx.routes";

const router = createRouter()
  .openapi(routes.depositPrepare, handlers.depositPrepare)
  .openapi(routes.withdrawPrepare, handlers.withdrawPrepare)
  .openapi(routes.borrowPrepare, handlers.borrowPrepare)
  .openapi(routes.repayPrepare, handlers.repayPrepare)
  .openapi(routes.rollPrepare, handlers.rollPrepare)
  .openapi(routes.approvalStatus, handlers.approvalStatus)
  .openapi(routes.approvalPrepare, handlers.approvalPrepare);

export default router;
