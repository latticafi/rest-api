import * as handlers from "@/handlers/prices/prices.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/prices/prices.routes";

const router = createRouter().openapi(routes.getPrice, handlers.getPrice);

export default router;
