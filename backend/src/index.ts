import { Hono } from "hono";
import userRouter from "./routes/userRoutes";
import blogRouter from "./routes/blogRouter";

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

app.route("/api/v1/user/", userRouter);
app.route("/api/v1/blog", blogRouter);

app.get("/", (c) => {
	return c.json({ message: "Welcome to Ani Blogs" });
});

export default app;
