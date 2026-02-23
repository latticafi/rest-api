import configureOpenAPI from "@/lib/configureOpenAPI";
import createApp from "@/lib/createApp";
import { authMiddleware } from "@/middleware/auth";
import usersRouter from "@/routes/users/users.index";

const app = createApp();

app.use("*", authMiddleware);

app.route("/", usersRouter);

configureOpenAPI(app);

export default app;
