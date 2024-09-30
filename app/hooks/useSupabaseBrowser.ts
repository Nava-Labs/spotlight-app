import getSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { useMemo } from "react";

function useSupabaseBrowser() {
  return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseBrowser;
