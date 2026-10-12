import { createClient } from "@supabase/supabase-js";

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://pdolfnzhfqpybbszvzzl.supabase.co";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkb2xmbnpoZnFweWJic3p2enpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3ODc3MjUsImV4cCI6MjEwNzM2MzcyNX0.8PFCesSmRvX8l_w05-xAnAVQ8C74Bjki5djNh7jt80o";

export const supabase = createClient(URL, ANON_KEY);
