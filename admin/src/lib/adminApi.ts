import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function adminApiRequest(action: string, data: any = {}) {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  
  if (!adminToken && action !== "login") {
    throw new Error("Unauthorized: Admin token not found. Please login again.");
  }

  console.log(`[AdminAPI] Request: ${action}`, { hasToken: !!adminToken });

  try {
    const { data: res, error } = await supabase.functions.invoke("admin-api", {
      body: { action, data },
      headers: adminToken ? { "x-admin-password": adminToken } : undefined,
    });

    if (error) {
      console.error("[AdminAPI] Error:", error);
      console.error("[AdminAPI] Error details:", {
        name: error.name,
        message: error.message,
        context: (error as any).context,
        status: (error as any).status,
        statusText: (error as any).statusText
      });
      
      // Try to extract error message from response
      let errorMessage = "An error occurred";
      
      // First, try to get error from context body
      if (error instanceof Error && 'context' in error) {
        try {
          const context = (error as any).context;
          if (context && typeof context === 'object') {
            // Try to parse JSON response if available
            if (context.body) {
              try {
                const parsed = typeof context.body === 'string' 
                  ? JSON.parse(context.body) 
                  : context.body;
                if (parsed && typeof parsed === 'object') {
                  if (parsed.error) {
                    errorMessage = parsed.error;
                  } else if (parsed.message) {
                    errorMessage = parsed.message;
                  }
                }
              } catch (e) {
                console.warn("[AdminAPI] Failed to parse error body:", e);
              }
            }
            
            // Also check response if available
            if (context.response) {
              try {
                const responseData = typeof context.response === 'string'
                  ? JSON.parse(context.response)
                  : context.response;
                if (responseData?.error) {
                  errorMessage = responseData.error;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        } catch (e) {
          console.warn("[AdminAPI] Failed to extract error from context:", e);
        }
      }
      
      // Fallback to error message if we couldn't extract from context
      if (errorMessage === "An error occurred" && error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      // Add status code info if available
      const statusCode = (error as any).status || (error as any).context?.status;
      if (statusCode) {
        errorMessage = `[${statusCode}] ${errorMessage}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return res;
  } catch (err: any) {
    // Re-throw with better error message
    if (err.message && err.message.includes("Unauthorized")) {
      throw new Error("Unauthorized: Please login again.");
    }
    throw err;
  }
}
