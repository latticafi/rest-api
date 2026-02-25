import * as handlers from "@/handlers/users/users.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/users/users.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.me, handlers.me)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);

export default router;
