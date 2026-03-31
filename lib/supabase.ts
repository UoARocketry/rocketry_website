import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

if (typeof window !== "undefined") {
  throw new Error("lib/supabase.ts must only be imported on the server.");
}

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missingEnv: string[] = [];
if (!SUPABASE_URL)
  missingEnv.push("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
if (!SUPABASE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required Supabase server environment variable(s): ${missingEnv.join(", ")}. Configure them in your deployment environment (for Vercel: Project Settings > Environment Variables).`,
  );
}

const supabaseUrl = SUPABASE_URL!;
const supabaseKey = SUPABASE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { headers: { "x-client-info": "rocketry_website" } },
});

export default supabase;
