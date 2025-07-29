import { QueryClient } from '@tanstack/react-query';
import { getAuthToken, removeAuthToken, isTokenExpired } from './authUtils';

// Custom fetch function that adds authentication and error handling
async function fetchFn(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  // Check if token is expired
  if (token && isTokenExpired(token)) {
    removeAuthToken();
    window.location.href = '/login';
    throw new Error('401: Token expired');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage = `${response.status}: ${errorData.error}`;
      }
    } catch {
      // Use default error message if JSON parsing fails
    }

    // Handle unauthorized errors
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response;
}

// Create a function to make API requests
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetchFn(url, options);
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
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors except 408 (timeout), 429 (rate limit)
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});