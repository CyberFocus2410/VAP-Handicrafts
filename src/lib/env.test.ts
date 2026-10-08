import { describe, expect, it } from "vitest";
import { validateEnv } from "./env";

describe("env validation", () => {
  it("validates default development environment variables", () => {
    const result = validateEnv({
      NODE_ENV: "development",
      APP_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_BRAND_NAME: "VAP Handicrafts",
    });

    expect(result.server.NODE_ENV).toBe("development");
    expect(result.server.APP_ENV).toBe("development");
    expect(result.client.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(result.client.NEXT_PUBLIC_BRAND_NAME).toBe("VAP Handicrafts");
  });

  it("fails when an invalid URL is provided for client app url", () => {
    expect(() =>
      validateEnv({
        NODE_ENV: "development",
        APP_ENV: "development",
        NEXT_PUBLIC_APP_URL: "not-a-valid-url",
      })
    ).toThrow(/\[ENV VALIDATION ERROR\]/);
  });

  it("validates CRON_SECRET length requirement when provided", () => {
    expect(() =>
      validateEnv(
        {
          NODE_ENV: "development",
          APP_ENV: "development",
          CRON_SECRET: "short",
        },
        { isServer: true }
      )
    ).toThrow(/\[ENV VALIDATION ERROR\]/);

    const valid = validateEnv(
      {
        NODE_ENV: "development",
        APP_ENV: "development",
        CRON_SECRET: "a-secure-cron-secret-with-adequate-entropy",
      },
      { isServer: true }
    );
    expect(valid.server.CRON_SECRET).toBe("a-secure-cron-secret-with-adequate-entropy");
  });
});
