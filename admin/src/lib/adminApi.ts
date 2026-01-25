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
    
    // Try to extract error message from various error formats
    let errorMessage = error.message || "An error occurred";
    let statusCode = 500;
    
    // Check if error has context with response body
    if (error instanceof Error) {
      const errorAny = error as any;
      
      // Check context property (Supabase FunctionsHttpError format)
      if ('context' in errorAny) {
        const context = errorAny.context;
        console.error("Error Context:", context);
        
        // Check if context is a Response object (it might show as {} when logged but is actually a Response)
        let response: Response | null = null;
        if (context instanceof Response) {
          response = context;
          statusCode = response.status || statusCode;
        } else if (context && typeof context === 'object') {
          // Check if it has Response-like properties (status, ok, etc.)
          // Response objects have status as a property but it might not be enumerable
          if (context instanceof Response || ('status' in context && typeof (context as any).status === 'number')) {
            response = context as Response;
            statusCode = response.status || statusCode;
          } else if ('status' in context && typeof context.status === 'number') {
            statusCode = context.status;
          }
          // Check if it has a response property
          if ('response' in context && context.response instanceof Response) {
            response = context.response;
            if (statusCode === 500 && response.status) {
              statusCode = response.status;
            }
          }
        }
        
        // Read response body if we have a Response object
        if (response) {
          if (statusCode === 500 && response.status) {
            statusCode = response.status;
          }
          try {
            // Check if body is already consumed by checking bodyUsed
            if (!response.bodyUsed) {
              const text = await response.text();
              if (text) {
                try {
                  const body = JSON.parse(text);
                  if (body && typeof body === 'object' && body.error) {
                    errorMessage = body.error;
                  }
                } catch (e) {
                  // If not JSON, use the text as error message
                  errorMessage = text || errorMessage;
                }
              }
            } else {
              // Body already consumed, try to clone
              try {
                const clonedResponse = response.clone();
                const text = await clonedResponse.text();
                if (text) {
                  try {
                    const body = JSON.parse(text);
                    if (body && typeof body === 'object' && body.error) {
                      errorMessage = body.error;
                    }
                  } catch (e) {
                    errorMessage = text || errorMessage;
                  }
                }
              } catch (cloneError) {
                // If clone fails, the body was already consumed
                // Try to provide a helpful message based on status code
                if (statusCode === 401) {
                  errorMessage = "Invalid credentials";
                } else if (statusCode === 500) {
                  errorMessage = "Server configuration error: Admin credentials not set. Please contact the administrator.";
                }
                console.warn("Response body already consumed and cannot be cloned:", cloneError);
              }
            }
          } catch (e) {
            // If reading fails, provide helpful message based on status
            if (statusCode === 401) {
              errorMessage = "Invalid credentials";
            } else if (statusCode === 500) {
              errorMessage = "Server configuration error: Admin credentials not set. Please contact the administrator.";
            }
            console.warn("Failed to read response body:", e);
          }
        }
        
        // Try to extract message from context.body (if already parsed)
        if (context && typeof context === 'object' && 'body' in context && !response) {
          try {
            const body = typeof context.body === 'string' ? JSON.parse(context.body) : context.body;
            if (body && typeof body === 'object' && body.error) {
              errorMessage = body.error;
            }
          } catch (e) {
            // If parsing fails, use the raw body
            if (typeof context.body === 'string') {
              errorMessage = context.body;
            }
          }
        }
        
        // Check for error property directly in context
        if (context && typeof context === 'object' && 'error' in context) {
          const contextError = context.error;
          if (typeof contextError === 'string') {
            errorMessage = contextError;
          } else if (contextError && typeof contextError === 'object' && 'message' in contextError) {
            errorMessage = contextError.message || errorMessage;
          }
        }
        
        // Extract status code from context (if not already set from response)
        if (context && typeof context === 'object' && 'status' in context && statusCode === 500) {
          const contextStatus = context.status;
          if (typeof contextStatus === 'number') {
            statusCode = contextStatus;
          }
        }
      }
      
      // Check for response property (some Supabase error formats)
      if ('response' in errorAny && errorAny.response && !(errorAny.context instanceof Response)) {
        const response = errorAny.response;
        if (response.status) {
          statusCode = response.status;
        }
      }
      
      // Check for status property directly
      if ('status' in errorAny && typeof errorAny.status === 'number' && statusCode === 500) {
        statusCode = errorAny.status;
      }
      
      // Check for statusCode property (alternative naming)
      if ('statusCode' in errorAny && typeof errorAny.statusCode === 'number' && statusCode === 500) {
        statusCode = errorAny.statusCode;
      }
    }
    
    // Determine status code from error message if not set
    if (statusCode === 500) {
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid credentials')) {
        statusCode = 401;
      } else if (errorMessage.includes('not found')) {
        statusCode = 404;
      }
    }
    
    // Create a new error with the extracted message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = statusCode;
    throw enhancedError;
  }
  return res;
}
