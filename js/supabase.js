import { createClient } from "https://esm.sh/@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
