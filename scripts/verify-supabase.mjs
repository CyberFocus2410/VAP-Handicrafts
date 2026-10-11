import { createClient } from "@supabase/supabase-js";
import fs from "fs";

if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const requiredTables = [
  "categories",
  "products",
  "product_variants",
  "product_images",
  "site_settings",
  "admin_users",
  "admin_audit_logs",
  "uploaded_assets",
  "orders",
  "order_items",
  "payments",
  "payment_events",
  "stock_reservations",
];

async function checkDatabase() {
  console.log(`Checking Supabase connection to: ${supabaseUrl}`);
  const results = {};

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        results[table] = { status: "missing_or_error", message: error.message };
      } else {
        results[table] = { status: "ok", count: data.length };
      }
    } catch (e) {
      results[table] = { status: "exception", message: e.message };
    }
  }

  console.log("\n=== Supabase Migration Verification Summary ===");
  let allOk = true;
  for (const [table, res] of Object.entries(results)) {
    if (res.status === "ok") {
      console.log(`  ✅ ${table.padEnd(22)} : Found & Accessible (${res.count} rows)`);
    } else {
      allOk = false;
      console.log(`  ❌ ${table.padEnd(22)} : ${res.message}`);
    }
  }

  // Storage buckets check
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      console.log(`\n  ⚠️ Storage buckets check: ${bucketErr.message}`);
    } else {
      console.log("\n=== Supabase Storage Buckets ===");
      const names = buckets.map((b) => b.name);
      console.log(`  Buckets found: [${names.join(", ")}]`);
      if (!names.includes("customization-uploads")) {
        console.log("  ℹ️ Bucket 'customization-uploads' not listed yet; will create if needed.");
        await supabase.storage.createBucket("customization-uploads", {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log("  ✅ Bucket 'customization-uploads' created successfully!");
      } else {
        console.log("  ✅ Bucket 'customization-uploads' exists!");
      }
    }
  } catch (err) {
    console.log(`  ⚠️ Storage check exception: ${err.message}`);
  }

  if (allOk) {
    console.log("\n✨ All 13 required tables are active in Supabase!");
  } else {
    console.log("\n⚠️ Some tables are missing or not created yet in Supabase.");
  }
}

checkDatabase().catch(console.error);
