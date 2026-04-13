import * as handlers from "@/handlers/users/users.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/users/users.routes";

const router = createRouter()
  .openapi(routes.me, handlers.me)
  .openapi(routes.patchMe, handlers.patchMe);

export default router;
