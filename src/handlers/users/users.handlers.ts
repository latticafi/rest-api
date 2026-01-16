import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
} from "@/routes/users/users.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  // TODO: db query to fetch all
  return c.json(
    [
      {
        id: "123",
        name: "John Doe",
      },
      {
        id: "234",
        name: "Jane Doe",
      },
    ],
    200,
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.req.valid("json");
  console.log(user);
  // TODO: db query to create user
  return c.json(
    {
      id: "2324",
      name: user.name,
    },
    200,
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  // TODO: db query to get user by id
  const user = {
    id,
    name: "User Name",
  };

  if (!user) {
    return c.json(
      {
        message: "Not Found",
      },
      404,
    );
  }
  return c.json(user, 200);
};
