import createRouter from "@/lib/createRouter";

const router = createRouter();

router.get("/health", (c) => {
  return c.json({ status: "ok" }, 200);
});

export default router;
