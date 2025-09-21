import { useState, useCallback } from "react";
import type { ApiResponse, LoadingState, MutationHookReturn } from "@/types";

/**
 * Generic API hook that standardizes API calling patterns
 * Reduces duplication of fetch logic and loading state management
 */
export function useApi<TData = any, TVariables = any>(): MutationHookReturn<TData, TVariables> {
  const [state, setState] = useState<LoadingState & { data: TData | null }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This would be replaced with actual API call logic
      // For now, it's a placeholder that can be customized per use case
      const response = await fetch('/api/placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: ApiResponse<TData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: result.data || null 
      }));

      return result.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    mutate,
  };
}

/**
 * Specialized API hook for common GET requests
 */
export function useApiQuery<TData = any>(url: string, autoFetch = false) {
  const [state, setState] = useState<LoadingState & { data: TData | null }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const refetch = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: ApiResponse<TData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: result.data || null 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  }, [url]);

  // Auto-fetch on mount if requested
  useState(() => {
    if (autoFetch) {
      refetch();
    }
  });

  return {
    ...state,
    refetch,
  };
}