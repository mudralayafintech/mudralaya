import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function adminApiRequest(action: string, data: any = {}) {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  
  if (!adminToken && action !== "login") {
    throw new Error("Unauthorized");
  }

  console.log(`[AdminAPI] Request: ${action}`, { hasToken: !!adminToken });

  const { data: res, error } = await supabase.functions.invoke("admin-api", {
    body: { action, data },
    headers: adminToken ? { "x-admin-password": adminToken } : undefined,
  });

  if (error) {
    console.error("[AdminAPI] Error:", error);
    // Try to parse response body if available in error context (supbase-js sometimes hides it)
    if (error instanceof Error && 'context' in error) {
        console.error("Error Context:", (error as any).context);
    }
    throw error;
  }
  return res;
}
