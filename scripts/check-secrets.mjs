import fs from "node:fs";
import path from "node:path";

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z]+ PRIVATE KEY-----/,
  /eyJhbGciOi[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // Real JWT pattern with body
  /re_[0-9a-zA-Z]{24,}/, // Resend API key pattern
  /(?:PAYTM_MERCHANT_KEY|PAYTM_MID)\s*=\s*['"][a-zA-Z0-9]{8,}['"]/i, // Paytm key with actual assigned value
  /sbp_[a-zA-Z0-9]{30,}/, // Supabase personal token
  /(?:SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY)\s*=\s*['"][a-zA-Z0-9_\-.]{20,}['"]/i,
];

const IGNORED_PATHS = [
  ".git",
  "node_modules",
  ".next",
  "coverage",
  "test-results",
  "playwright-report",
  "package-lock.json",
  ".env.example",
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.test",
  "docs",
  "ARCHITECTURE.md",
  "PRD.md",
  "PLAN.md",
  "DECISIONS.md",
];

function scanDirectory(dir) {
  let foundSecrets = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(process.cwd(), fullPath);

    if (IGNORED_PATHS.some((ignored) => relPath.split(path.sep).includes(ignored))) {
      continue;
    }

    if (entry.isDirectory()) {
      foundSecrets += scanDirectory(fullPath);
    } else if (entry.isFile()) {
      // Don't scan binary assets
      if (/\.(jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|eot)$/i.test(entry.name)) {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineIdx) => {
        // Skip comments in check-secrets itself
        if (fullPath.includes("check-secrets.mjs")) return;

        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(line)) {
            console.error(`[SECRET SCAN VIOLATION] Possible secret detected in ${relPath}:${lineIdx + 1}`);
            console.error(`  > ${line.trim().slice(0, 80)}`);
            foundSecrets++;
          }
        }
      });
    }
  }

  return foundSecrets;
}

console.log("[Secret Scanner] Scanning repository for leaked credentials...");
const violations = scanDirectory(process.cwd());

if (violations > 0) {
  console.error(`\n[Secret Scanner Failed] Detected ${violations} potential secret pattern(s).`);
  process.exit(1);
} else {
  console.log("[Secret Scanner Passed] No leaked secrets detected.");
  process.exit(0);
}
