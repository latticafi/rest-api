import configureOpenAPI from "@/lib/configureOpenAPI";
import createApp from "@/lib/createApp";
import usersRouter from "@/routes/users/users.index";

const app = createApp();

app.route("/", usersRouter);

configureOpenAPI(app);

export default app;
