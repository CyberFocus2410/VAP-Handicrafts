import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicyHeaderValue = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com ${isDev ? "'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-src 'self' https://challenges.cloudflare.com;
  frame-ancestors 'none';
  worker-src 'self';
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;
  ${isDev ? "" : "upgrade-insecure-requests;"}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicyHeaderValue,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@supabase/supabase-js"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/robot.txt",
        destination: "/robots.txt",
      },
    ];
  },
};

export default nextConfig;
