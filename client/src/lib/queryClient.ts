import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Safely parse JSON or return the original text if not JSON
async function safelyParseJSON(response: Response): Promise<any> {
  const text = await response.text();
  
  try {
    // Attempt to parse as JSON
    return JSON.parse(text);
  } catch (e) {
    // If it's not valid JSON, log the error and return the text
    console.error('Failed to parse response as JSON:', text);
    throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse error response as JSON first
      const errorData = await safelyParseJSON(res);
      throw new Error(`${res.status}: ${errorData.message || JSON.stringify(errorData)}`);
    } catch (e) {
      // If parsing as JSON fails, use the error message
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  urlOrOptions: string | RequestInit & { url?: string },
  optionsOrData?: RequestInit | unknown,
  data?: unknown
): Promise<Response> {
  let url: string;
  let options: RequestInit;

  // Handle different parameter combinations
  if (typeof urlOrOptions === 'string') {
    // First form: apiRequest(url, options?, data?)
    url = urlOrOptions;
    if (optionsOrData && typeof optionsOrData === 'object' && !Array.isArray(optionsOrData)) {
      options = optionsOrData as RequestInit;
    } else {
      // Second form: apiRequest(url, data?)
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: optionsOrData ? JSON.stringify(optionsOrData) : undefined
      };
    }
  } else {
    // Third form: apiRequest({ url, ...options })
    url = urlOrOptions.url || '';
    options = { ...urlOrOptions };
    delete (options as any).url;
  }

  // Add data to body if provided as third parameter
  if (data !== undefined) {
    options.body = JSON.stringify(data);
    if (!options.headers) {
      options.headers = {};
    }
    if (typeof options.headers === 'object') {
      (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
  }

  // Always include credentials
  options.credentials = 'include';

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    try {
      return await safelyParseJSON(res.clone());
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new Error('Failed to parse response');
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
