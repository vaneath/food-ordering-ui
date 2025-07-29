import { QueryClient } from '@tanstack/react-query';

// Create a function to make API requests
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
}

// Create the query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => {
        const [endpoint] = queryKey as [string];
        return apiRequest(endpoint);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});