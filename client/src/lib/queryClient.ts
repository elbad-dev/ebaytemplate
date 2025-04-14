import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
    return await res.json();
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
