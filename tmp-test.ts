import { createClient } from "./src/utils/supabase/server";

async function test() {
  const supabase = await createClient();
  if (!supabase) return console.log("No Supabase client");
  
  const { data } = await supabase.from("products").select("name, image_url").limit(1);
  console.log("SAMPLE PRODUCT IMAGE:", data?.[0]?.image_url);
}

test();
