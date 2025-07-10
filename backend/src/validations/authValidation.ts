import * as z from "zod";

const registerStep1Schema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

const registerStep2Schema = z.object({
    name: z.string().min(3).max(20),
    username: z.string().min(3).max(20),
});

const registerStep3Schema = z.object({
    avatar: z.url(),
    bio: z.string().max(500),
    theme: z.enum(["light", "dark", "system"]),
    emailNotifications: z.boolean(),
});

export { registerStep1Schema, registerStep2Schema, registerStep3Schema };