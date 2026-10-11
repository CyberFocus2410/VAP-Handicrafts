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

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("Checking if email_outbox table exists in live Supabase...");
  const { data, error } = await supabase.from("email_outbox").select("id").limit(1);

  if (error) {
    console.log("email_outbox check error:", error.message, error.code);
    if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("not found")) {
      console.log("Table does not exist yet. Please run migration 20261011_004_messaging_and_admin.sql in Supabase SQL Editor if needed, or checking REST schema.");
    }
  } else {
    console.log("SUCCESS: email_outbox table already exists in live Supabase!");
  }

  // Check columns on orders
  const { data: orderData, error: orderErr } = await supabase.from("orders").select("id, tracking_number, courier_name, shipped_at").limit(1);
  if (orderErr) {
    console.log("orders tracking columns check:", orderErr.message);
  } else {
    console.log("SUCCESS: orders table has tracking_number, courier_name, and shipped_at!");
  }
}

main().catch(console.error);
