import { z } from "zod";

const serverEnvSchema = z.object({
  API_BASE_URL: z.string().url().default("http://localhost:8000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("aicsl_cms_session"),
  APP_URL: z.string().url().default("http://localhost:3000"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const serverEnv = serverEnvSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:8000",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || "aicsl_cms_session",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
