import * as handlers from "@/handlers/auth/auth.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/auth/auth.routes";

const router = createRouter()
  .openapi(routes.nonce, handlers.nonce)
  .openapi(routes.verify, handlers.verify);

export default router;
