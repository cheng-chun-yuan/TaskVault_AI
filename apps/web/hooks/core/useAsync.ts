import { useState, useCallback, useRef, useEffect } from "react";
import type { LoadingState } from "@/types";

/**
 * Generic async state management hook
 * Handles loading states, errors, and cleanup for async operations
 */
export function useAsync<TData, TArgs extends unknown[] = []>() {
  const [state, setState] = useState<LoadingState & { data: TData | null }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const cancelRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (asyncFunction: (...args: TArgs) => Promise<TData>, ...args: TArgs): Promise<TData | null> => {
      // Cancel previous request if still pending
      if (cancelRef.current) {
        cancelRef.current.abort();
      }

      cancelRef.current = new AbortController();
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        
        // Check if request was cancelled
        if (cancelRef.current?.signal.aborted) {
          return null;
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          data: result 
        }));

        return result;
      } catch (error) {
        // Don't update state if request was cancelled
        if (cancelRef.current?.signal.aborted) {
          return null;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));

        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current.abort();
    }
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for simple loading state management
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      try {
        const result = await asyncFunction();
        return result;
      } catch (error) {
        console.error('Async operation failed:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
}