import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function adminApiRequest(action: string, data: any = {}) {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  
  if (!adminToken && action !== "login") {
    throw new Error("Unauthorized");
  }

  const { data: res, error } = await supabase.functions.invoke("admin-api", {
    body: { action, data },
    headers: adminToken ? { "x-admin-password": adminToken } : undefined,
  });

  if (error) throw error;
  return res;
}
