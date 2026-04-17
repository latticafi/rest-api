import * as handlers from "@/handlers/quotes/quotes.handlers";
import createRouter from "@/lib/createRouter";
import * as routes from "@/routes/quotes/quotes.routes";

const router = createRouter().openapi(
  routes.requestQuote,
  handlers.requestQuote,
);

export default router;
