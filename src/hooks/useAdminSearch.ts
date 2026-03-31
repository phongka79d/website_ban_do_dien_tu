import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { createClient } from "@/utils/supabase/client";

interface UseAdminSearchOptions<T> {
  /** The async search function from a service */
  searchFn: (supabase: any, query: string, page: number, pageSize: number) => Promise<{ data: T[]; count: number }>;
  /** Initial page size */
  initialPageSize?: number;
  /** Delay for debouncing in ms */
  debounceDelay?: number;
  /** Storage key for pageSize in localStorage */
  storageKey?: string;
}

/**
 * Reusable hook for server-side searching in Admin managers.
 * Handles debouncing, loading states, result management, and pagination.
 */
export function useAdminSearch<T>({
  searchFn,
  initialPageSize = 20,
  debounceDelay = 300,
  storageKey
}: UseAdminSearchOptions<T>) {
  // Get initial page size from localStorage if available
  const getInitialPageSize = () => {
    if (typeof window !== "undefined" && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) return parseInt(stored, 10);
    }
    return initialPageSize;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getInitialPageSize());
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const performSearch = useCallback(async (query: string, p: number, ps: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, count } = await searchFn(supabase, query, p, ps);
        setResults(data);
        setTotalCount(count);
      }
    } catch (error) {
      console.error("useAdminSearch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchFn]);

  // Initial load and handle search/page/pageSize changes
  useEffect(() => {
    performSearch(debouncedSearchTerm, page, pageSize);
  }, [debouncedSearchTerm, page, pageSize, performSearch]);

  // Reset to page 1 when searchTerm changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Persist pageSize to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      localStorage.setItem(storageKey, pageSize.toString());
    }
  }, [pageSize, storageKey]);

  /** 
   * Manual refresh function to re-fetch current search state 
   * (e.g., after a delete or update)
   */
  const refresh = useCallback(() => {
    return performSearch(debouncedSearchTerm, page, pageSize);
  }, [debouncedSearchTerm, page, pageSize, performSearch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    refresh
  };
}
