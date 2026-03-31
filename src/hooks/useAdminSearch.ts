import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { createClient } from "@/utils/supabase/client";

interface UseAdminSearchOptions<T> {
  /** The async search function from a service */
  searchFn: (supabase: any, query: string, limit: number) => Promise<T[]>;
  /** Initial number of items to fetch when query is empty */
  initialLimit?: number;
  /** Number of items to fetch when searching */
  searchLimit?: number;
  /** Delay for debouncing in ms */
  debounceDelay?: number;
}

/**
 * Reusable hook for server-side searching in Admin managers.
 * Handles debouncing, loading states, and result management.
 */
export function useAdminSearch<T>({
  searchFn,
  initialLimit = 20,
  searchLimit = 20,
  debounceDelay = 300
}: UseAdminSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const performSearch = useCallback(async (query: string, limit: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const data = await searchFn(supabase, query, limit);
        setResults(data);
      }
    } catch (error) {
      console.error("useAdminSearch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchFn]);

  // Initial load or when debounced search term changes
  useEffect(() => {
    const limit = debouncedSearchTerm ? searchLimit : initialLimit;
    performSearch(debouncedSearchTerm, limit);
  }, [debouncedSearchTerm, performSearch, initialLimit, searchLimit]);

  /** 
   * Manual refresh function to re-fetch current search state 
   * (e.g., after a delete or update)
   */
  const refresh = useCallback(() => {
    const limit = debouncedSearchTerm ? searchLimit : initialLimit;
    return performSearch(debouncedSearchTerm, limit);
  }, [debouncedSearchTerm, performSearch, initialLimit, searchLimit]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    refresh
  };
}
