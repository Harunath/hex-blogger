import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

blogRouter.use("/*", async (c, next) => {
	const authHeader = c.req.header("authorization") || "";
	console.log(authHeader);
	try {
		const user = await verify(authHeader.split(" ")[1], c.env.JWT_SECRET);
		if (user) {
			c.set("userId", String(user.id));
			await next();
		} else {
			c.status(403);
			return c.json({
				message: "You are not logged in",
			});
		}
	} catch (e) {
		c.status(403);
		return c.json({
			message: "You are not logged in",
		});
	}
});

blogRouter.post("/", async (c) => {
	try {
		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		}).$extends(withAccelerate());
		const userId = c.get("userId");
		const body = await c.req.json();
		const blog = await prisma.post.create({
			data: {
				authorId: userId,
				content: body.content,
				title: body.title,
			},
		});
		return c.json({ message: "blog successfully created", blog });
	} catch (e) {
		console.log(e);
		c.status(500);
		return c.json({ error: "Error while creating the blog" });
	}
});

blogRouter.put("/", async (c) => {
	try {
		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		}).$extends(withAccelerate());
		const userId = c.get("userId");
		const body = await c.req.json();
		const blog = await prisma.post.update({
			where: { id: body.blogId },
			data: {
				authorId: userId,
				content: body.content,
				title: body.title,
				published: body.published,
			},
		});
		return c.json({ message: "blog successfully updated", blog });
	} catch (e) {
		console.log(e);
		c.status(500);
		return c.json({ error: "Error while creating the blog" });
	}
});

blogRouter.get("/bulk", async (c) => {
	try {
		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		}).$extends(withAccelerate());
		const blogs = await prisma.post.findMany();
		console.log(blogs);
		return c.json(blogs);
	} catch (e) {
		console.log(e);
		c.status(500);
		return c.json({ error: "error while finding the blog" });
	}
});

blogRouter.get("/:id", async (c) => {
	try {
		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		}).$extends(withAccelerate());
		const blogId = c.req.param("id");
		console.log(blogId);
		const blog = await prisma.post.findUnique({ where: { id: blogId } });
		if (!blog) {
			c.status(404);
			return c.json({ error: "blog does not exist" });
		}
		return c.json(blog);
	} catch (e) {
		console.log(e);
		c.status(500);
		return c.json({ error: "error while finding the blog" });
	}
});

export default blogRouter;
