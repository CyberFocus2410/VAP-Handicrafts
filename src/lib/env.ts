import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  CRON_SECRET: z.string().min(16).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BRAND_NAME: z.string().default("VAP Handicrafts"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .default("https://qepfiubmjueooacemhzz.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .default("sb_anon_placeholder"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Validates environment variables safely at runtime.
 * Fails fast with descriptive diagnostics if validation fails.
 */
export function validateEnv(
  runtimeEnv: Record<string, string | undefined> = process.env,
  options?: { isServer?: boolean }
): {
  server: ServerEnv;
  client: ClientEnv;
} {
  const isServer = options?.isServer ?? typeof window === "undefined";

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: runtimeEnv.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BRAND_NAME: runtimeEnv.NEXT_PUBLIC_BRAND_NAME,
    NEXT_PUBLIC_SUPABASE_URL: runtimeEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!clientResult.success) {
    const issues = clientResult.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[ENV VALIDATION ERROR] Invalid client environment variables:\n${issues}`);
  }

  let serverEnv: ServerEnv = {
    NODE_ENV: (runtimeEnv.NODE_ENV as "development" | "test" | "production") ?? "development",
    APP_ENV: (runtimeEnv.APP_ENV as "development" | "test" | "production") ?? "development",
    CRON_SECRET: runtimeEnv.CRON_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: runtimeEnv.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (isServer) {
    const serverResult = serverSchema.safeParse(runtimeEnv);
    if (!serverResult.success) {
      const issues = serverResult.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`[ENV VALIDATION ERROR] Invalid server environment variables:\n${issues}`);
    }
    serverEnv = serverResult.data;
  }

  return {
    server: serverEnv,
    client: clientResult.data,
  };
}

export const env = validateEnv();
