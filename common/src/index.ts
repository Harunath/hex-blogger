import z from "zod";

export const signupType = z.object({
	name: z.string().optional(),
	username: z.string().email(),
	password: z.string().min(6),
});

export const signinType = z.object({
	username: z.string().email(),
	password: z.string().min(6),
});

export const createBlogType = z.object({
	title: z.string(),
	content: z.string(),
});

export const updateBlogType = z.object({
	title: z.string(),
	content: z.string(),
	id: z.string(),
});

export type SignUpType = z.infer<typeof signupType>;
export type SigninType = z.infer<typeof signinType>;
export type CreateBlogType = z.infer<typeof createBlogType>;
export type UpdateBlogType = z.infer<typeof updateBlogType>;
