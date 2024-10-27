import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinType, SigninType } from "@harunath/mediumcommon";

const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

userRouter.post("/signup", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = signinType.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid data" });
	}
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
			},
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch (e) {
		c.status(403);
		return c.json({ error: e });
	}
});
userRouter.post("/signin", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const { success } = signinType.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid data" });
	}
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
		},
	});
	if (user && body.password == user?.password) {
		const token = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ token });
	} else {
		return c.json({ message: "Invalid credentials" }, { status: 401 });
	}
});

export default userRouter;
